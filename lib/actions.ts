// Everything that changes the in-memory store. Server only.
// Each text that reaches a participant is checked by the banned-phrase filter here, on every send (features.md C2).
import { addDays, daysBetween, fmtShort, monthsBetween, TODAY, weekdayLong } from './clock';
import { inviteDraft } from './drafter';
import { eventItem, findItem, gapUntil, lastPractice, nextStep, practiceDays, streak } from './engine';
import { bannedIn, checkMessage } from './filter';
import { cohortOf, config, firstName, person, teacher, type Participant, type Seva, type Store } from './store';
import type { ActionResult, Notice } from './types';

const N = config.notifications;
const ex = N.examples as Record<string, string>;
const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
const fail = (error: string): ActionResult => ({ ok: false, error });
const OK: ActionResult = { ok: true };

// Notifications (features.md C3). Push is simulated as an in-app banner.
export function notify(s: Store, pid: string, title: string, text: string, to: Notice['to'] = 'home') {
  if (bannedIn(text, config.banned_phrases).length) return; // never show a text that fails the filter
  (s.notices[pid] ??= []).push({ id: 'n' + ++s.seq, title, text, to });
}

// The time-based notifications, checked once per person per demo day: at most one automatic notification a day.
export function ensureAutomatic(s: Store, p: Participant) {
  if (N.demo_teacher_sent_only || s.autoChecked[p.id]) return; // demo: no banner until the teacher sends something
  s.autoChecked[p.id] = true;
  const going = s.rsvps[p.id] ?? {};
  const tomorrow = addDays(TODAY, N.event_reminder_days_before);
  for (const key of Object.keys(going)) {
    const i = findItem(s, p, key);
    if (i && i.iso === tomorrow) return notify(s, p.id, 'Event reminder', `Tomorrow: ${i.title}${i.time ? ', ' + i.time : ''} ${i.online ? 'online' : 'in ' + i.city}. See you there.`, 'events');
  }
  const mates = (cohortOf(s, p.id)?.member_ids ?? []).filter((m) => m !== p.id);
  for (const e of s.events) {
    const key = 'e:' + e.id;
    const names = mates.filter((m) => s.rsvps[m]?.[key]).map((m) => person(s, m)!.first_name);
    if (!going[key] && e.date >= TODAY && names.length >= N.course_group_going_min_people) {
      const others = names.length - 1;
      return notify(s, p.id, 'Your course group', `${names[0]} and ${others} ${others === 1 ? 'other' : 'others'} from your course are going to ${e.title}. Join them?`, 'events');
    }
  }
  const p1 = p.courses_completed.find((c) => c.category === 'part1');
  const months = p1 ? monthsBetween(p1.completed_on) : -1;
  if (N.course_anniversary_months.includes(months)) {
    const days = practiceDays(s, p.id).length;
    const base = `It’s been ${months} ${months === 1 ? 'month' : 'months'} since your course.`;
    return notify(s, p.id, 'Course anniversary', days ? `${base} Here’s how far you’ve come: ${days} practice days.` : base, 'practice');
  }
  const last = lastPractice(s, p.id);
  if (last && daysBetween(last) === N.practice_note_after_days_without_practice) return notify(s, p.id, 'Practice note', fill(ex.practice_note, { first_name: p.first_name }), 'practice');
}

function afterPractice(s: Store, p: Participant, first: boolean) {
  const n = streak(s, p.id);
  if (first && N.first_practice_logged) notify(s, p.id, 'First practice', ex.first_practice, 'practice');
  else if (N.streak_milestones_days.includes(n)) notify(s, p.id, 'Streak milestone', fill(ex.streak_milestone, { n }), 'practice');
}

function deliver(s: Store, p: Participant, teacherId: string, itemKey: string | null, text: string): ActionResult {
  const c = checkMessage(text, config.banned_phrases, config.message_rules.max_sentences);
  if (c.banned.length) return fail(`Please reword: “${c.banned.join('”, “')}”.`);
  if (!c.ok) return fail(`Personal messages stay within ${config.message_rules.max_sentences} sentences.`);
  const gap = gapUntil(s, p.id);
  if (gap) return fail('Next outreach is possible on ' + fmtShort(gap) + '.');
  const t = teacher(s, teacherId);
  if (!t) return fail('Teacher not found.');
  const item = itemKey ? findItem(s, p, itemKey) : null;
  s.threads[p.id].push({ from: 't', senderId: teacherId, text, on: TODAY, outreach: true, status: 'sent' });
  s.invitations[p.id] = { from: firstName(t), item: item && item.kind !== 'practice' ? item : null, text, answer: null };
  s.unread['p' + p.id] = true;
  delete s.hidden[p.id];
  notify(s, p.id, 'Invitation', item && item.kind !== 'practice' ? `${firstName(t)} has invited you to ${item.title}.` : `${firstName(t)} sent you a note.`, 'home');
  return OK;
}

type A = Record<string, any>;

export function runAction(s: Store, a: A): ActionResult {
  const p = a.pid ? person(s, a.pid) : undefined;
  if (a.pid && !p) return fail('Participant not found.');
  const text = typeof a.text === 'string' ? a.text.trim() : '';

  switch (a.type) {
    /* ----- participant ----- */
    case 'practice': {
      if (!p) return fail('Missing participant.');
      const logs = (s.logs[p.id] ??= []);
      if (!logs.includes(TODAY)) { const first = logs.length === 0; logs.push(TODAY); afterPractice(s, p, first); }
      return OK;
    }
    case 'rsvp': {
      if (!p || !findItem(s, p, a.key)) return fail('Event not found.');
      const r = (s.rsvps[p.id] ??= {});
      if (r[a.key]) delete r[a.key]; else r[a.key] = TODAY;
      return OK;
    }
    case 'seva': {
      const e = s.seva.find((x) => x.id === a.sevaId);
      if (!p || !e) return fail('Seva not found.');
      const i = e.signed_up_ids.indexOf(p.id);
      if (i >= 0) { e.signed_up_ids.splice(i, 1); e.signed_up_count--; }
      else if (e.signed_up_count >= e.spots) return fail('All spots are filled.');
      else { e.signed_up_ids.push(p.id); e.signed_up_count++; }
      return OK;
    }
    case 'answer': {
      const inv = p && s.invitations[p.id];
      if (!p || !inv || !text) return fail('No invitation to answer.');
      inv.answer = text;
      s.threads[p.id].push({ from: 'p', senderId: p.id, text, on: TODAY });
      s.unread['t' + p.id] = true;
      delete s.unread['p' + p.id];
      return OK;
    }
    case 'join': {
      if (!p) return fail('Missing participant.');
      s.signedUp.p = true;
      if (N.welcome_on_joining_channel && !N.demo_teacher_sent_only) notify(s, p.id, 'Welcome', fill(ex.welcome, { first_name: p.first_name }), 'home');
      return OK;
    }
    case 'ack': {
      if (!p) return fail('Missing participant.');
      s.notices[p.id] = (s.notices[p.id] ?? []).filter((n) => !(a.ids ?? []).includes(n.id));
      return OK;
    }
    case 'readThread': {
      if (!p) return fail('Missing participant.');
      delete s.unread[(a.side === 't' ? 't' : 'p') + p.id];
      return OK;
    }

    /* ----- chat (both roles) ----- */
    case 'sayChannel': {
      if (!text || !s.cohorts.some((c) => c.id === a.cohortId)) return fail('Nothing to send.');
      const fromTeacher = !!teacher(s, a.senderId);
      if (fromTeacher) { const b = bannedIn(text, config.banned_phrases); if (b.length) return fail(`Please reword: “${b[0]}”.`); }
      s.chat.push({ cohort_id: a.cohortId, sender_id: a.senderId, sent_on: TODAY, text });
      return OK;
    }
    case 'sayThread': {
      if (!p || !text) return fail('Nothing to send.');
      if (a.side === 't') {
        const b = bannedIn(text, config.banned_phrases);
        if (b.length) return fail(`Please reword: “${b[0]}”.`);
        // ASSUMPTION: a reply inside a conversation is not counted towards the 3-day outreach gap; recommendations and invitations are.
        s.threads[p.id].push({ from: 't', senderId: a.teacherId, text, on: TODAY });
        s.unread['p' + p.id] = true;
        if (N.reply_in_chat) notify(s, p.id, 'Reply', fill(ex.reply_in_chat, { name: firstName(teacher(s, a.teacherId)!) }), 'thread');
      } else {
        s.threads[p.id].push({ from: 'p', senderId: p.id, text, on: TODAY });
        s.unread['t' + p.id] = true;
      }
      return OK;
    }

    /* ----- teacher ----- */
    case 'teacherJoin': {
      s.signedUp.t = true;
      return OK;
    }
    case 'setTags': {
      if (!p || !Array.isArray(a.tags)) return fail('Missing tags.');
      s.tags[p.id] = [...new Set((a.tags as string[]).map((t) => String(t).trim().toLowerCase().replace(/\s+/g, '_')).filter(Boolean))];
      return OK;
    }
    case 'setNote': {
      if (!p) return fail('Missing participant.');
      s.notes[p.id] = String(a.text ?? '');
      return OK;
    }
    case 'setStep': {
      if (!p) return fail('Missing participant.');
      if (a.key && findItem(s, p, a.key)) s.steps[p.id] = a.key; else delete s.steps[p.id];
      return OK;
    }
    case 'send': {
      if (!p) return fail('Missing participant.');
      const step = nextStep(s, p);
      if (step.channel === 'teacher_call' || step.channel === 'in_person') return fail('Nothing is sent through the app for this step.');
      return deliver(s, p, a.teacherId, step.item.key, text);
    }
    case 'invite': {
      if (!p) return fail('Missing participant.');
      return deliver(s, p, a.teacherId, a.key, text || inviteDraft(s, p, findItem(s, p, a.key)!, a.teacherId));
    }
    case 'hide': {
      if (!p) return fail('Missing participant.');
      if (a.how) s.hidden[p.id] = a.how; else delete s.hidden[p.id];
      return OK;
    }
    case 'createChannel': {
      const t = teacher(s, a.teacherId);
      const guests = ((a.guests ?? []) as A[]).map((g) => ({ name: String(g.name ?? '').trim(), tags: (g.tags ?? []) as string[], note: String(g.note ?? '') })).filter((g) => g.name);
      if (!t) return fail('Teacher not found.');
      if (!guests.length) return fail('Add at least one participant’s first name.');
      const end = String(a.endedOn || TODAY);
      const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][Number(end.slice(5, 7)) - 1] ?? 'NOV';
      let code = `${mon}${end.slice(2, 4)}-${t.areas[0].slice(0, 3).toUpperCase()}`;
      while (s.cohorts.some((c) => c.join_code === code)) code += '2';
      s.cohorts.push({ id: 'CH' + (s.cohorts.length + 1) + 'N', name: String(a.name || 'Part 1').trim(), course_ended_on: end, teacher_id: t.id, join_code: code, member_ids: [], guests });
      return { ok: true, code };
    }
    case 'addEvent': {
      const t = teacher(s, a.teacherId);
      const title = String(a.title ?? '').trim();
      if (!t || !title) return fail('Give it a title first.');
      const online = a.city === 'Online';
      const ref = s.participants.find((x) => x.area === a.city) ?? s.participants.find((x) => x.teacher_id === t.id);
      const base = {
        id: 'N' + ++s.seq, title, date: String(a.date || TODAY), time: String(a.time || ''), is_online: online, city: String(a.city || t.areas[0]),
        lat: online ? null : ref?.home_lat ?? null, lng: online ? null : ref?.home_lng ?? null, created_by: t.id, tags: (a.tags ?? []) as string[], description: String(a.description ?? ''),
      };
      if (a.seva) {
        s.seva.push({ ...base, category: 'seva', spots: Math.max(1, Number(a.spots) || 1), signed_up_count: 0, signed_up_ids: [] } as Seva);
      } else {
        const e = { ...base, category: String(a.category || 'community_event') };
        s.events.push(e);
        if (N.new_event_nearby) for (const x of s.participants) {
          const i = eventItem(x, e);
          if (i.online || (i.km != null && i.km <= config.nearby_radius_km)) notify(s, x.id, 'New event nearby', fill(ex.new_event_nearby, { event: title, weekday: weekdayLong(e.date) }), 'events');
        }
      }
      return OK;
    }
    case 'completeSeva': {
      const e = s.seva.find((x) => x.id === a.sevaId);
      if (!e) return fail('Seva not found.');
      s.sevaDone[e.id] = true;
      if (N.seva_thank_you) e.signed_up_ids.forEach((id) => notify(s, id, 'After seva', ex.seva_thank_you, 'volunteer'));
      return OK;
    }
    default:
      return fail('Unknown action.');
  }
}
