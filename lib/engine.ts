// Recommendation engine (features.md B). Deterministic rules, no AI. Every threshold comes from data/config.json.
// Tested against data/expected_outcomes.json in __tests__/engine.test.ts.
import { addDays, daysBetween, fmtDay, fmtShort, TODAY, toronto, weekday } from './clock';
import { config, type CommunityEvent, type Course, type Participant, type Seva, type Store } from './store';
import type { Bucket, Channel, Item, ReasonPart, Stage } from './types';

const st = config.stages;

/* ---------- practice ---------- */
export const practiceDays = (s: Store, pid: string) => s.logs[pid] ?? [];
export const doneToday = (s: Store, pid: string) => practiceDays(s, pid).includes(TODAY);
export const daysInWindow = (s: Store, pid: string, n: number) =>
  new Set(practiceDays(s, pid).filter((d) => d <= TODAY && daysBetween(d) < n)).size;
export function streak(s: Store, pid: string): number {
  const set = new Set(practiceDays(s, pid));
  let d = set.has(TODAY) ? TODAY : addDays(TODAY, -1);
  let n = 0;
  while (set.has(d)) { n++; d = addDays(d, -1); }
  return n;
}
export const lastPractice = (s: Store, pid: string) => [...practiceDays(s, pid)].sort().pop() ?? null;

/* ---------- B1: journey stage ---------- */
// Activity = a practice log, an event attended, or the app being opened.
export function activityDates(s: Store, p: Participant): string[] {
  const all = [...practiceDays(s, p.id), ...p.events_attended.map((e) => e.date), p.app.last_opened].filter((d) => d && d <= TODAY);
  return [...new Set(all)].sort();
}
export const idleDays = (s: Store, p: Participant) => {
  const a = activityDates(s, p);
  return a.length ? daysBetween(a[a.length - 1]) : 9999;
};
const lastCourse = (p: Participant) => [...p.courses_completed].sort((a, b) => a.completed_on.localeCompare(b.completed_on)).pop();
export function eligibleCourses(p: Participant): string[] {
  const last = lastCourse(p);
  if (!last) return [];
  const next = (config.next_courses_after as unknown as Record<string, string[]>)[last.category] ?? [];
  const done = p.courses_completed.map((c) => c.category);
  return next.filter((c) => !done.includes(c));
}

const RULES: Record<Stage, (s: Store, p: Participant) => boolean> = {
  returning: (s, p) => {
    const a = activityDates(s, p);
    for (let i = a.length - 1; i > 0; i--) {
      if (daysBetween(a[i]) > st.returning_active_within_days) break;
      if (daysBetween(a[i - 1], a[i]) >= st.returning_min_gap_days) return true;
    }
    return false;
  },
  dormant: (s, p) => idleDays(s, p) > st.dormant_inactive_days,
  drifting: (s, p) => idleDays(s, p) >= st.drifting_inactive_days,
  new: (_s, p) => {
    const p1 = p.courses_completed.find((c) => c.category === 'part1');
    return !!p1 && daysBetween(p1.completed_on) <= st.new_days_after_part1;
  },
  ready_to_deepen: (s, p) => daysInWindow(s, p.id, st.ready_window_days) >= st.ready_min_practice_days && eligibleCourses(p).length > 0,
  seva_inclined: (s, p) =>
    s.tags[p.id].includes(config.seva_inclined.tag) ||
    p.events_attended.filter((e) => daysBetween(e.date) < 60 && e.date <= TODAY).length >= config.seva_inclined.or_min_events_60_days,
  practising: (s, p) =>
    daysInWindow(s, p.id, 30) >= st.practising_min_practice_days_30 || p.events_attended.some((e) => daysBetween(e.date) < 30 && e.date <= TODAY),
};

export function stageOf(s: Store, p: Participant): Stage {
  for (const name of config.stage_order as Stage[]) if (RULES[name](s, p)) return name;
  return 'practising'; // ASSUMPTION: someone who matches no stage falls back to practising.
}

/* ---------- B2: nearby ---------- */
function km(p: Participant, lat?: number | null, lng?: number | null): number | null {
  if (lat == null || lng == null) return null;
  const r = Math.PI / 180;
  const a = Math.sin(((lat - p.home_lat) * r) / 2) ** 2 + Math.cos(p.home_lat * r) * Math.cos(lat * r) * Math.sin(((lng - p.home_lng) * r) / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(a)) * 10) / 10;
}
const near = (i: Item) => i.online || (i.km != null && i.km <= config.nearby_radius_km);
const byNear = (a: Item, b: Item) => (a.km ?? 999) - (b.km ?? 999) || a.iso.localeCompare(b.iso);

export function courseItem(p: Participant, c: Course): Item | null {
  // Next occurrence: the first session from today on, or the start date for a recurring follow-up.
  const next = (c.sessions ?? []).map((x) => x.start).find((x) => toronto(x).iso >= TODAY) ?? c.start_date_utc;
  const t = toronto(next);
  if (t.iso < TODAY) return null;
  const isCourse = c.category === 'sahaj' || c.category === 'part2';
  return {
    key: 'c:' + c.id, kind: isCourse ? 'course' : 'event', cat: c.category, title: c.title.replace(/\s+/g, ' ').trim(),
    city: c.is_online ? 'Online' : c.city ?? '', online: c.is_online, iso: t.iso, day: fmtDay(t.iso), time: t.time,
    km: c.is_online ? null : km(p, c.lat, c.lng), tags: [],
  };
}
export const eventItem = (p: Participant, e: CommunityEvent): Item => ({
  key: 'e:' + e.id, kind: 'event', cat: e.category, title: e.title, city: e.city, online: e.is_online, iso: e.date, day: fmtDay(e.date),
  time: e.time.split(' - ')[0], km: e.is_online ? null : km(p, e.lat, e.lng), tags: e.tags ?? [], desc: e.description,
});
export const sevaItem = (p: Participant, e: Seva): Item => ({ ...eventItem(p, e), key: 's:' + e.id, kind: 'seva', cat: 'seva', tags: e.tags ?? [], desc: e.description });

export const sevaCount = (e: Seva) => e.signed_up_count;
export const sevaFull = (e: Seva) => e.signed_up_count >= e.spots;

function courseItems(s: Store, p: Participant, cats: string[]): Item[] {
  const out: Item[] = [];
  for (const c of s.courses) {
    if (!cats.includes(c.category)) continue;
    const i = courseItem(p, c);
    if (!i || !near(i)) continue;
    if (i.kind === 'course' && (c.registration_closed || c.capacity_full || daysBetween(TODAY, i.iso) < config.min_days_notice_for_courses)) continue;
    out.push(i);
  }
  return out.sort(byNear);
}
export const followUps = (s: Store, p: Participant) => courseItems(s, p, ['follow_up', 'satsang']);
export const communityEvents = (s: Store, p: Participant) => s.events.filter((e) => e.date >= TODAY).map((e) => eventItem(p, e)).filter(near).sort(byNear);
export const sevaNear = (s: Store, p: Participant) => s.seva.filter((e) => e.date >= TODAY).map((e) => sevaItem(p, e)).filter(near).sort(byNear);
// What a participant sees in the Events tab: events, not courses.
export function eventsFor(s: Store, p: Participant): Item[] {
  const fu = followUps(s, p);
  return [...fu.filter((i) => !i.online).slice(0, 6), ...fu.filter((i) => i.online).slice(0, 2), ...communityEvents(s, p)].sort(byNear);
}

/* ---------- B3 + B4 + B5: next step, reason, channel ---------- */
const LOGISTIC = ['weekends_only', 'weekdays_only', 'no_car', 'online_ok', 'prefers_call', config.seva_inclined.tag];
const skillTags = (s: Store, p: Participant) => s.tags[p.id].filter((t) => !LOGISTIC.includes(t));
const where = (i: Item) => (i.online ? 'online' : 'in ' + i.city);
const PRACTICE: Item = { key: 'practice', kind: 'practice', cat: 'practice', title: 'A daily-practice encouragement', city: '', online: false, iso: TODAY, day: '', time: '', km: null, tags: [] };

// The nearest follow-up or satsang that fits the schedule and transport tags.
function fittingFollowUp(s: Store, p: Participant): { item: Item | null; why: string[] } {
  const tags = s.tags[p.id];
  const all = followUps(s, p);
  let list = all.filter((i) => !i.online);
  const why: string[] = [];
  if (tags.includes('no_car') && tags.includes('online_ok')) {
    const on = all.filter((i) => i.online);
    if (on.length) { list = on; why.push('no_car', 'online_ok'); }
  }
  for (const [tag, ok] of [['weekends_only', (d: number) => d === 0 || d === 6], ['weekdays_only', (d: number) => d > 0 && d < 6]] as const) {
    if (!tags.includes(tag)) continue;
    const f = list.filter((i) => ok(weekday(i.iso)));
    if (f.length) { list = f; why.push(tag); }
  }
  return { item: list[0] ?? all[0] ?? null, why };
}

function pickCourse(s: Store, p: Participant): { item: Item | null; tag: string | null } {
  const ok = eligibleCourses(p);
  const map = config.interest_to_course as Record<string, string>;
  const tag = s.tags[p.id].find((t) => map[t] && ok.includes(map[t])) ?? null;
  const all = courseItems(s, p, tag ? [map[tag]] : ok).sort((a, b) => a.iso.localeCompare(b.iso));
  // Tie-break: the earliest in-person course nearby, then online.
  return { item: all.find((i) => !i.online) ?? all[0] ?? null, tag };
}

export function findItem(s: Store, p: Participant, key: string): Item | null {
  if (key === 'practice') return PRACTICE;
  const [kind, id] = [key.slice(0, 1), key.slice(2)];
  if (kind === 'c') { const c = s.courses.find((x) => String(x.id) === id); return c ? courseItem(p, c) : null; }
  if (kind === 'e') { const e = s.events.find((x) => x.id === id); return e ? eventItem(p, e) : null; }
  if (kind === 's') { const e = s.seva.find((x) => x.id === id); return e ? sevaItem(p, e) : null; }
  return null;
}

export function channelFor(s: Store, p: Participant, stage: Stage): Channel {
  const tags = s.tags[p.id];
  if (stage === 'dormant' && tags.includes('community_events')) return 'in_person';
  if (!p.app.push_enabled || tags.includes('prefers_call') || daysBetween(p.app.last_opened) > 30) return 'teacher_call';
  return (config.channels as unknown as Record<string, Channel>)[stage];
}

export type NextStep = { stage: Stage; item: Item; habit: boolean; reason: ReasonPart[]; channel: Channel; overridden: boolean };

export function nextStep(s: Store, p: Participant): NextStep {
  const stage = stageOf(s, p);
  const n = p.first_name;
  const tags = s.tags[p.id];
  const skills = skillTags(s, p);
  const match = (list: Item[]) => list.find((i) => i.tags.some((t) => skills.includes(t)));
  const T = (text: string): ReasonPart => ({ text });
  const B = (text: string): ReasonPart => ({ text, bold: true });
  const fu = fittingFollowUp(s, p);
  let item: Item | null = null;
  let reason: ReasonPart[] = [];
  let habit = false;
  const chosen = s.steps[p.id] ? findItem(s, p, s.steps[p.id]) : null;

  if (chosen) {
    item = chosen;
    reason = [T(`You chose this step for ${n} yourself.`)];
  } else if (stage === 'ready_to_deepen') {
    const c = pickCourse(s, p);
    item = c.item;
    if (item) reason = [T(`${n} has practised on ${daysInWindow(s, p.id, st.ready_window_days)} of the last ${st.ready_window_days} days`), ...(c.tag ? [T(' and your remarks mention '), B(c.tag)] : []), T(`, so we suggest ${item.title} ${where(item)} on ${item.day}.`)];
  } else if (stage === 'seva_inclined') {
    const open = sevaNear(s, p).filter((i) => !sevaFull(s.seva.find((e) => 's:' + e.id === i.key)!));
    item = match(open) ?? open[0] ?? null;
    const tag = item?.tags.find((t) => skills.includes(t));
    if (item) reason = [...(tag ? [T('Your remarks mention '), B(tag), T(' and ')] : []), T(`${n} is drawn to seva, so we suggest ${item.title} on ${item.day}.`)];
  } else if (stage === 'drifting') {
    item = match(communityEvents(s, p)) ?? fu.item;
    if (item) reason = [T(`${n} has been quiet for ${idleDays(s, p)} days, so we suggest a gentle check-in that mentions ${item.title} ${where(item)}`), ...tagWhy(fu.why, item, fu.item), T('.')];
  } else if (stage === 'dormant') {
    const ce = tags.includes('community_events') ? communityEvents(s, p)[0] : null;
    item = ce ?? fu.item;
    if (item) reason = ce
      ? [T(`${n} has been quiet for ${idleDays(s, p)} days and your remarks mention `), B('community_events'), T(`, so a hello in person, with a word about ${item.title}, is the kindest step.`)]
      : [T(`${n} has been quiet for ${idleDays(s, p)} days, and a notification is unlikely to reach them, so a personal call is the kindest step.`)];
  } else if (stage === 'returning') {
    item = fu.item;
    if (item) reason = [T(`${n} is practising again after some time away, so we suggest a warm welcome and ${item.title} ${where(item)}.`)];
  } else if (stage === 'new') {
    item = fu.item;
    habit = true;
    const p1 = p.courses_completed.find((c) => c.category === 'part1')!;
    if (item) reason = [T(`${n} finished Part 1 ${daysBetween(p1.completed_on)} days ago, so we suggest the daily practice habit and the nearest follow-up, ${item.title} ${where(item)}.`)];
  } else {
    const m = match([...communityEvents(s, p), ...sevaNear(s, p)]);
    item = m ?? fu.item;
    const tag = m?.tags.find((t) => skills.includes(t));
    if (item) reason = [T(`${n} has practised on ${daysInWindow(s, p.id, 30)} of the last 30 days`), ...(tag ? [T(' and your remarks mention '), B(tag)] : []), T(`, so we suggest ${item.title} ${where(item)} on ${item.day}`), ...tagWhy(fu.why, item, fu.item), T('.')];
  }
  if (!item) {
    item = PRACTICE;
    reason = [T(`Nothing suitable is listed near ${n} right now, so we suggest a word of encouragement for the daily practice.`)];
  }
  return { stage, item, habit, reason, channel: channelFor(s, p, stage), overridden: !!chosen };

  function tagWhy(why: string[], picked: Item | null, fuItem: Item | null): ReasonPart[] {
    if (!why.length || picked !== fuItem) return [];
    const out: ReasonPart[] = [T(', because your remarks mention ')];
    why.forEach((w, i) => { if (i) out.push(T(' and ')); out.push(B(w)); });
    return out;
  }
}

// Other steps a teacher can choose (features.md E4).
export function stepOptions(s: Store, p: Participant): Item[] {
  const courses = courseItems(s, p, ['sahaj', 'part2']).sort((a, b) => a.iso.localeCompare(b.iso));
  const pick = (cat: string) => [courses.find((i) => i.cat === cat && !i.online), courses.find((i) => i.cat === cat && i.online)].filter(Boolean) as Item[];
  const seva = sevaNear(s, p).filter((i) => !sevaFull(s.seva.find((e) => 's:' + e.id === i.key)!));
  return [...pick('sahaj').slice(0, 1), ...pick('part2'), ...eventsFor(s, p).slice(0, 5), ...seva.slice(0, 3), PRACTICE];
}

/* ---------- B6: outreach gap ---------- */
export function gapUntil(s: Store, pid: string): string | null {
  const last = s.threads[pid].filter((m) => m.from === 't' && m.outreach).map((m) => m.on).sort().pop();
  const min = config.outreach.min_days_between_outreach;
  return last && daysBetween(last) < min ? addDays(last, min) : null;
}
export const gapLabel = (s: Store, pid: string) => { const g = gapUntil(s, pid); return g ? fmtShort(g) : null; };

/* ---------- E5: report groups ---------- */
const rp = config.reports;
export function bucketOf(s: Store, pid: string): Bucket {
  const n = daysInWindow(s, pid, rp.window_days);
  return n >= rp.very_regular_min_practice_days ? 'reg' : n >= rp.building_min_practice_days ? 'build' : 'support';
}
export const notOpened = (p: Participant) => daysBetween(p.app.last_opened) >= rp.not_opened_app_days;

/* ---------- labels ---------- */
export const STAGE_LABEL: Record<Stage, string> = {
  new: 'New', practising: 'Practising', ready_to_deepen: 'Ready to deepen', seva_inclined: 'Seva-inclined', drifting: 'Drifting', dormant: 'Dormant', returning: 'Returning',
};
export const CHANNEL_LABEL: Record<Channel, string> = {
  feed_card: 'a feed card', feed_card_and_push: 'a feed card and a notification', in_app_message: 'a personal message', teacher_call: 'a phone call from you', in_person: 'a hello in person',
};
export function actionLabel(step: NextStep): string {
  if (step.channel === 'teacher_call') return 'Call';
  if (step.channel === 'in_person') return 'Say hello';
  const i = step.item;
  if (i.kind === 'course') return 'Invite to ' + (i.cat === 'sahaj' ? 'Sahaj' : 'Part 2');
  if (i.kind === 'seva') return 'Invite to seva';
  if (i.kind === 'practice') return 'Encourage';
  if (step.stage === 'drifting' || step.stage === 'returning') return 'Check in';
  return 'Invite to ' + (i.cat === 'follow_up' ? 'follow-up' : i.cat === 'satsang' ? 'satsang' : 'event');
}
