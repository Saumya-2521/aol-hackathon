// Shapes shared by the server (lib/views.ts) and the screens. No data or secrets here.

export type Stage = 'returning' | 'dormant' | 'drifting' | 'new' | 'ready_to_deepen' | 'seva_inclined' | 'practising';
export type Channel = 'feed_card' | 'feed_card_and_push' | 'in_app_message' | 'teacher_call' | 'in_person';
export type ItemKind = 'course' | 'event' | 'seva' | 'practice';
export type Bucket = 'reg' | 'build' | 'support';

export type Item = {
  key: string;
  kind: ItemKind;
  cat: string;
  title: string;
  city: string;
  online: boolean;
  iso: string;
  day: string;
  time: string;
  km: number | null;
  tags: string[];
  desc?: string;
};

export type EventView = Item & { going: boolean };
export type SevaView = Item & { sevaId: string; count: number; spots: number; mine: boolean; full: boolean; done: boolean };
export type Msg = { id: string; who: string; text: string; mine: boolean };
export type Notice = { id: string; title: string; text: string; to: 'home' | 'practice' | 'events' | 'volunteer' | 'thread' };
export type ReasonPart = { text: string; bold?: boolean };

export type ParticipantView = {
  id: string;
  first: string;
  last: string;
  fsa: string;
  teacherFirst: string;
  dateLabel: string;
  streak: number;
  days40: number;
  total: number;
  doneToday: boolean;
  week: boolean[];
  todayIndex: number;
  cohort: { id: string; name: string; joinCode: string; practised: number; size: number };
  invitation: null | { from: string; item: Item | null; text: string; answer: string | null };
  nextFollowUp: EventView | null;
  events: EventView[];
  seva: SevaView[];
  milestones: { days: number; reached: boolean }[];
  channel: Msg[];
  thread: Msg[];
  threadUnread: boolean;
  note: Notice | null; // the latest notification, for the note card on Home (features.md C3)
  guided: { title: string; youtubeId: string; url: string; demoSeconds: number };
};

export type RecView = {
  stage: Stage;
  stageLabel: string;
  item: Item;
  habit: boolean;
  reason: ReasonPart[];
  channel: Channel;
  channelLabel: string;
  direct: boolean;
  draft: string;
  gapUntil: string | null;
  sentText: string | null;
  actionLabel: string;
  overridden: boolean;
};

export type PersonView = {
  id: string;
  first: string;
  last: string;
  initials: string;
  area: string;
  cohortId: string;
  cohortName: string;
  email: string;
  phone: string;
  streak: number;
  days40: number;
  heat: boolean[];
  doneToday: boolean;
  lastText: string;
  appOpenedText: string;
  bucket: Bucket;
  notOpened: boolean;
  alertDays: number | null;
  tags: string[];
  note: string;
  timeline: { date: string; text: string }[];
  rec: RecView;
  options: Item[];
  thread: Msg[];
  threadUnread: boolean;
  hidden: string | null;
};

export type CohortView = {
  id: string;
  name: string;
  joinCode: string;
  memberIds: string[];
  guests: { name: string; tags: string[]; note: string }[];
  practised: number;
  size: number;
  counts: { reg: number; build: number; support: number; app: number };
  channel: Msg[];
};

export type TeacherEvent = {
  key: string;
  id: string;
  cat: string;
  title: string;
  day: string;
  time: string;
  city: string;
  going: string[];
  goingOwn: number;
  tags: string[];
  matches: { id: string; tags: string[] }[];
};

export type TeacherSeva = TeacherEvent & { count: number; spots: number; done: boolean; canInvite: number };

export type TeacherView = {
  id: string;
  first: string;
  last: string;
  email: string;
  areas: string[];
  dateLabel: string;
  cohorts: CohortView[];
  people: PersonView[];
  nextEvent: TeacherEvent | null;
  openSeva: TeacherSeva | null;
  remarksLeft: number;
  cheer: string; // the warm note for the teacher, written from real numbers (features.md E2)
  wisdom: { text: string; source: string } | null; // only from config.teacher_note.wisdom_notes; the app never writes its own
  events: TeacherEvent[];
  seva: TeacherSeva[];
  tagVocabulary: string[];
  bannedPhrases: string[];
  maxSentences: number;
  aiDrafts: boolean;
};

export type DemoPeople = {
  participants: { id: string; first: string; area: string }[];
  teachers: { id: string; name: string }[];
  signedUp: { p: boolean; t: boolean }; // sign-up is shown once per role in a demo run (features.md D0, E0)
};

export type ActionResult = { ok: true; code?: string; draft?: string } | { ok: false; error: string };
