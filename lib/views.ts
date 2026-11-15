// Builds what each role's screens need (features.md F: use only the data needed).
// A participant's view never contains contact details, remarks or other people's practice.
// A teacher's view contains only their own participants.
import { addDays, daysBetween, fmtDay, fmtLong, fmtShort, TODAY, weekday } from './clock';
import { aiAvailable, templateDraft } from './drafter';
import {
  actionLabel, bucketOf, CHANNEL_LABEL, daysInWindow, doneToday, eventItem, eventsFor, gapLabel, lastPractice, nextStep, notOpened,
  practiceDays, sevaItem, sevaNear, STAGE_LABEL, stepOptions, streak,
} from './engine';
import { cohortOf, config, firstName, person, teacher, type Cohort, type CommunityEvent, type Participant, type Seva, type Store, type ThreadMsg } from './store';
import type { CohortView, DemoPeople, Msg, ParticipantView, PersonView, RecView, SevaView, TeacherEvent, TeacherSeva, TeacherView } from './types';

const LOGISTIC = ['weekends_only', 'weekdays_only', 'no_car', 'online_ok', 'prefers_call'];

function who(s: Store, id: string): string {
  const p = person(s, id);
  if (p) return p.first_name;
  const t = teacher(s, id);
  return t ? `${firstName(t)} (${t.role})` : 'Someone';
}
const channelMsgs = (s: Store, cohortId: string, me: string): Msg[] =>
  s.chat.filter((m) => m.cohort_id === cohortId).map((m, i) => ({ m, i })).sort((a, b) => a.m.sent_on.localeCompare(b.m.sent_on) || a.i - b.i)
    .map(({ m, i }) => ({ id: cohortId + i, who: who(s, m.sender_id), text: m.text, mine: m.sender_id === me }));
const threadMsgs = (s: Store, pid: string, side: 't' | 'p'): Msg[] =>
  s.threads[pid].map((m: ThreadMsg, i) => ({ id: pid + i, who: m.from === 'p' ? who(s, pid) : firstName(teacher(s, m.senderId)!), text: m.text, mine: m.from === side }));

function sevaView(s: Store, p: Participant, e: Seva): SevaView {
  const mine = e.signed_up_ids.includes(p.id);
  return { ...sevaItem(p, e), sevaId: e.id, count: e.signed_up_count, spots: e.spots, mine, full: e.signed_up_count >= e.spots && !mine, done: !!s.sevaDone[e.id] };
}

export function participantView(s: Store, pid: string): ParticipantView | null {
  const p = person(s, pid);
  const c = p && cohortOf(s, pid);
  if (!p || !c) return null;
  const going = s.rsvps[pid] ?? {};
  const events = eventsFor(s, p).map((i) => ({ ...i, going: !!going[i.key] }));
  const days = new Set(practiceDays(s, pid));
  const monday = addDays(TODAY, -((weekday(TODAY) + 6) % 7));
  const g = config.guided_practice;
  return {
    id: p.id, first: p.first_name, last: p.last_name, fsa: p.postal_fsa, teacherFirst: firstName(teacher(s, p.teacher_id)!),
    dateLabel: fmtLong(TODAY),
    streak: streak(s, pid), days40: daysInWindow(s, pid, 40), total: days.size, doneToday: doneToday(s, pid),
    week: [0, 1, 2, 3, 4, 5, 6].map((i) => days.has(addDays(monday, i))), todayIndex: (weekday(TODAY) + 6) % 7,
    // The course-group count is a number only, never names (features.md D2).
    cohort: { id: c.id, name: c.name, joinCode: c.join_code, practised: c.member_ids.filter((m) => doneToday(s, m)).length, size: c.member_ids.length },
    invitation: s.invitations[pid] ?? null,
    nextFollowUp: events.find((e) => e.cat === 'follow_up') ?? null,
    events,
    seva: s.seva.filter((e) => sevaNear(s, p).some((i) => i.key === 's:' + e.id)).map((e) => sevaView(s, p, e)).sort((a, b) => (a.km ?? 999) - (b.km ?? 999) || a.iso.localeCompare(b.iso)),
    milestones: config.milestones_practice_days.map((d) => ({ days: d, reached: days.size >= d })),
    channel: channelMsgs(s, c.id, pid),
    thread: threadMsgs(s, pid, 'p'),
    threadUnread: !!s.unread['p' + pid],
    notices: s.notices[pid] ?? [],
    guided: { title: g.sessions[0].title, youtubeId: g.sessions[0].youtube_video_id, url: g.sessions[0].source_url, demoSeconds: g.demo_mode_seconds },
  };
}

function recView(s: Store, p: Participant, teacherId: string): RecView {
  const step = nextStep(s, p);
  const direct = step.channel === 'teacher_call' || step.channel === 'in_person';
  const sentToday = s.threads[p.id].filter((m) => m.from === 't' && m.outreach && m.on === TODAY).pop();
  const cacheKey = [p.id, step.item.key, step.stage, s.tags[p.id].join(','), s.notes[p.id]].join('|');
  return {
    stage: step.stage, stageLabel: STAGE_LABEL[step.stage], item: step.item, habit: step.habit, reason: step.reason,
    channel: step.channel, channelLabel: CHANNEL_LABEL[step.channel], direct,
    draft: (!direct && s.aiDrafts[cacheKey]) || templateDraft(s, p, step, teacherId),
    gapUntil: gapLabel(s, p.id), sentText: sentToday?.text ?? null, actionLabel: actionLabel(step), overridden: step.overridden,
  };
}

function personView(s: Store, p: Participant, c: Cohort, teacherId: string): PersonView {
  const last = lastPractice(s, p.id);
  const done = doneToday(s, p.id);
  const set = new Set(practiceDays(s, p.id));
  const tl: { on: string; text: string }[] = [];
  p.courses_completed.forEach((x) => tl.push({ on: x.completed_on, text: x.title + ' completed' }));
  p.events_attended.forEach((x) => tl.push({ on: x.date, text: x.title + ' · attended' }));
  Object.entries(s.rsvps[p.id] ?? {}).forEach(([key, on]) => {
    const e = s.events.find((x) => 'e:' + x.id === key);
    const co = s.courses.find((x) => 'c:' + x.id === key);
    tl.push({ on, text: 'RSVP · ' + (e?.title ?? co?.title ?? 'event') });
  });
  s.seva.filter((e) => e.signed_up_ids.includes(p.id)).forEach((e) => tl.push({ on: e.date, text: 'Seva sign-up · ' + e.title }));
  s.threads[p.id].forEach((m) => tl.push({ on: m.on, text: m.from === 'p' ? `${p.first_name} replied` : `Message from ${firstName(teacher(s, m.senderId)!)}${m.status ? ' · ' + m.status.replace('_', ' ') : ''}` }));
  if (done) tl.push({ on: TODAY, text: 'Practice logged' });
  tl.sort((a, b) => b.on.localeCompare(a.on));
  const since = last ? daysBetween(last) : null;
  return {
    id: p.id, first: p.first_name, last: p.last_name, initials: p.first_name[0] + p.last_name[0], area: p.area, cohortId: c.id, cohortName: c.name,
    // Contact details: only for the assigned teacher (features.md F).
    email: p.teacher_id === teacherId ? p.contact.email : '', phone: p.teacher_id === teacherId ? p.contact.phone : '',
    streak: streak(s, p.id), days40: daysInWindow(s, p.id, 40),
    heat: Array.from({ length: 40 }, (_, i) => set.has(addDays(TODAY, i - 39))), doneToday: done,
    lastText: done ? 'practised today' : since == null ? 'no practice logged yet' : since === 1 ? 'yesterday' : 'last on ' + fmtShort(last!),
    appOpenedText: 'App last opened ' + fmtShort(p.app.last_opened),
    bucket: bucketOf(s, p.id), notOpened: notOpened(p),
    alertDays: !done && since != null && since >= config.notifications.teacher_alert_after_days_without_practice ? since : null,
    tags: s.tags[p.id], note: s.notes[p.id],
    timeline: tl.map((x) => ({ date: fmtShort(x.on), text: x.text })),
    rec: recView(s, p, teacherId), options: stepOptions(s, p),
    thread: threadMsgs(s, p.id, 't'), threadUnread: !!s.unread['t' + p.id], hidden: s.hidden[p.id] ?? null,
  };
}

export function teacherView(s: Store, tid: string): TeacherView | null {
  const t = teacher(s, tid);
  if (!t) return null;
  const mine = s.participants.filter((p) => p.teacher_id === tid);
  const cohorts = s.cohorts.filter((c) => c.teacher_id === tid);
  const people = mine.map((p) => personView(s, p, cohortOf(s, p.id)!, tid));
  const byId = Object.fromEntries(people.map((p) => [p.id, p]));
  const own = (e: CommunityEvent) => e.created_by === tid || teacher(s, e.created_by)?.assists === tid;
  const ref = mine[0];

  const cohortViews: CohortView[] = cohorts.map((c) => {
    const m = c.member_ids.map((id) => byId[id]).filter(Boolean);
    return {
      id: c.id, name: c.name, joinCode: c.join_code, memberIds: c.member_ids, guests: c.guests ?? [],
      practised: m.filter((p) => p.doneToday).length, size: m.length,
      counts: { reg: m.filter((p) => p.bucket === 'reg').length, build: m.filter((p) => p.bucket === 'build').length, support: m.filter((p) => p.bucket === 'support').length, app: m.filter((p) => p.notOpened).length },
      channel: channelMsgs(s, c.id, tid),
    };
  });

  const matches = (tags: string[]) => people.map((p) => ({ id: p.id, tags: p.tags.filter((x) => tags.includes(x) && !LOGISTIC.includes(x)) })).filter((m) => m.tags.length);
  const evView = (e: CommunityEvent, key: string, names: string[]): TeacherEvent => ({
    key, id: e.id, cat: e.category ?? 'seva', title: e.title, day: fmtDay(e.date), time: e.time, city: e.city, going: names,
    goingOwn: names.filter((n) => mine.some((p) => p.first_name === n)).length, tags: e.tags ?? [], matches: matches(e.tags ?? []),
  });
  const events = s.events.filter(own).sort((a, b) => a.date.localeCompare(b.date)).map((e) => {
    const key = ref ? eventItem(ref, e).key : 'e:' + e.id;
    return evView(e, key, s.participants.filter((p) => s.rsvps[p.id]?.[key]).map((p) => p.first_name));
  });
  const seva: TeacherSeva[] = s.seva.filter(own).sort((a, b) => a.date.localeCompare(b.date)).map((e) => ({
    ...evView(e, 's:' + e.id, e.signed_up_ids.map((id) => person(s, id)!.first_name)), cat: 'seva',
    count: e.signed_up_count, spots: e.spots, done: !!s.sevaDone[e.id],
    canInvite: mine.filter((p) => s.tags[p.id].includes(config.seva_inclined.tag) && !e.signed_up_ids.includes(p.id)).length,
  }));
  const upcoming = (e: { id: string }, list: CommunityEvent[]) => (list.find((x) => x.id === e.id)?.date ?? '') >= TODAY;

  return {
    id: t.id, first: firstName(t), last: t.name.split(' ').slice(1).join(' '), email: t.email, areas: t.areas, dateLabel: fmtDay(TODAY),
    cohorts: cohortViews, people,
    nextEvent: events.find((e) => upcoming(e, s.events)) ?? null,
    openSeva: seva.find((e) => !e.done && upcoming(e, s.seva)) ?? null,
    remarksLeft: people.filter((p) => !p.tags.length && !p.note).length,
    events, seva,
    tagVocabulary: config.tag_vocabulary, bannedPhrases: config.banned_phrases, maxSentences: config.message_rules.max_sentences, aiDrafts: aiAvailable(),
  };
}

export const demoPeople = (s: Store): DemoPeople => ({
  participants: s.participants.map((p) => ({ id: p.id, first: p.first_name, area: p.area })),
  teachers: s.teachers.filter((t) => t.role === 'teacher').map((t) => ({ id: t.id, name: t.name })),
  signedUp: s.signedUp,
});
