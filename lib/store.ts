// In-memory store (features.md A2). Server only: never import this from a screen or component.
// Every JSON file in /data is loaded here; actions change this copy and nothing is written back.
import chatJson from '../data/chat.json';
import cohortsJson from '../data/cohorts.json';
import eventsJson from '../data/community_events.json';
import configJson from '../data/config.json';
import coursesJson from '../data/courses.json';
import messagesJson from '../data/messages.json';
import participantsJson from '../data/participants.json';
import logsJson from '../data/practice_logs.json';
import rsvpsJson from '../data/rsvps.json';
import sevaJson from '../data/seva_opportunities.json';
import teachersJson from '../data/teachers.json';
import type { Item, Notice } from './types';

export type Config = typeof configJson;
export const config: Config = configJson;

export type Participant = {
  id: string;
  first_name: string;
  last_name: string;
  area: string;
  postal_fsa: string;
  home_lat: number;
  home_lng: number;
  teacher_id: string;
  joined_app_on: string;
  contact: { email: string; phone: string };
  courses_completed: { category: string; title: string; completed_on: string }[];
  events_attended: { date: string; category: string; title: string; city: string }[];
  app: { last_opened: string; push_enabled: boolean };
  teacher_notes: { tags: string[]; text: string }[];
};
export type Teacher = { id: string; name: string; role: string; areas: string[]; email: string; assists?: string };
export type Cohort = {
  id: string;
  name: string;
  course_ended_on: string;
  teacher_id: string;
  join_code: string;
  member_ids: string[];
  guests?: { name: string; tags: string[]; note: string }[];
};
export type CommunityEvent = {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  is_online: boolean;
  city: string;
  lat: number | null;
  lng: number | null;
  created_by: string;
  tags?: string[];
  description?: string;
};
export type Seva = CommunityEvent & { spots: number; tags: string[]; description: string; signed_up_count: number; signed_up_ids: string[] };
export type Course = {
  id: number;
  title: string;
  category: string;
  is_online: boolean;
  start_date_utc: string;
  end_date_utc?: string;
  timing_text?: string;
  sessions?: { start: string }[];
  city?: string;
  lat?: number | null;
  lng?: number | null;
  registration_closed?: boolean;
  capacity_full?: boolean;
};
export type ThreadMsg = { from: 't' | 'p'; senderId: string; text: string; on: string; outreach?: boolean; status?: string };
export type ChatMsg = { cohort_id: string; sender_id: string; sent_on: string; text: string };
export type Invitation = { from: string; item: Item | null; text: string; answer: string | null };

export type Store = {
  participants: Participant[];
  logs: Record<string, string[]>;
  teachers: Teacher[];
  cohorts: Cohort[];
  chat: ChatMsg[];
  rsvps: Record<string, Record<string, string>>; // participant → item key → date
  seva: Seva[];
  events: CommunityEvent[];
  courses: Course[];
  threads: Record<string, ThreadMsg[]>;
  tags: Record<string, string[]>;
  notes: Record<string, string>;
  steps: Record<string, string>; // participant → item key the teacher chose instead
  hidden: Record<string, string>;
  invitations: Record<string, Invitation>;
  notices: Record<string, Notice[]>;
  unread: Record<string, boolean>;
  sevaDone: Record<string, boolean>;
  autoChecked: Record<string, boolean>;
  aiDrafts: Record<string, string>;
  seq: number;
};

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const USED = ['follow_up', 'satsang', 'sahaj', 'part2'];

function load(): Store {
  const participants = clone(participantsJson.participants) as unknown as Participant[];
  const s: Store = {
    participants,
    logs: clone(logsJson.logs) as Record<string, string[]>,
    teachers: clone(teachersJson.teachers) as Teacher[],
    cohorts: clone(cohortsJson.cohorts) as Cohort[],
    chat: clone(chatJson.messages) as ChatMsg[],
    rsvps: {},
    seva: clone(sevaJson.seva) as Seva[],
    events: clone(eventsJson.events) as CommunityEvent[],
    // The cached snapshot only (features.md A5). The app never calls the Unity/Harmony API.
    courses: (coursesJson.courses as unknown as Course[]).filter((c) => USED.includes(c.category)),
    threads: {},
    tags: {},
    notes: {},
    steps: {},
    hidden: {},
    invitations: {},
    notices: {},
    unread: {},
    sevaDone: {},
    autoChecked: {},
    aiDrafts: {},
    seq: 0,
  };
  for (const p of participants) {
    s.tags[p.id] = [...new Set(p.teacher_notes.flatMap((n) => n.tags))];
    s.notes[p.id] = p.teacher_notes.map((n) => n.text).join(' ');
    s.threads[p.id] = [];
  }
  for (const r of rsvpsJson.rsvps) {
    (s.rsvps[r.participant_id] ??= {})[(r.item_type === 'course' ? 'c:' : 'e:') + r.item_id] = r.created_on;
  }
  for (const m of messagesJson.messages as any[]) {
    s.threads[m.participant_id].push({ from: 't', senderId: m.sender_id, text: m.text, on: m.sent_on, outreach: true, status: m.status });
    if (m.reply) s.threads[m.participant_id].push({ from: 'p', senderId: m.participant_id, text: m.reply.text, on: m.reply.on });
  }
  return s;
}

// API routes are bundled separately, so the store lives on globalThis to be shared between them.
const g = globalThis as unknown as { __aolStore?: Store };

export function getStore(): Store {
  return (g.__aolStore ??= load());
}

// Reset demo (features.md A3): reload all the JSON.
export function resetStore(): Store {
  return (g.__aolStore = load());
}

export const person = (s: Store, id: string) => s.participants.find((p) => p.id === id);
export const teacher = (s: Store, id: string) => s.teachers.find((t) => t.id === id);
export const firstName = (t: Teacher) => t.name.split(' ')[0];
export const cohortOf = (s: Store, pid: string) => s.cohorts.find((c) => c.member_ids.includes(pid));
