// Draft writer (features.md C1). Server only.
// The Claude API writes the text when ANTHROPIC_API_KEY is set; otherwise, or if the call fails, a template per stage does.
// Every draft goes through the banned-phrase filter (C2). A failing AI draft is regenerated once, then replaced by the template.
import Anthropic from '@anthropic-ai/sdk';
import { daysBetween } from './clock';
import { daysInWindow, type NextStep } from './engine';
import { checkMessage } from './filter';
import { config, firstName, teacher, type Participant, type Store } from './store';
import { inviteText } from './templates';
import type { Item } from './types';

const place = (i: Item) => (i.online ? 'online' : 'in ' + i.city);

const TONE: Record<string, string> = {
  new: 'a warm welcome',
  practising: 'light and friendly',
  ready_to_deepen: 'a personal invitation',
  seva_inclined: '"we would love your help"',
  drifting: 'a gentle check-in with no ask',
  dormant: '"thinking of you, the door is open"',
  returning: '"lovely to see you", with no mention of any gap',
};

// An invitation to one item, used for invites from the Events tab and for a step the teacher chose.
export const inviteDraft = (s: Store, p: Participant, item: Item, teacherId: string) =>
  inviteText(p.first_name, { kind: item.kind, title: item.title, day: item.day, place: place(item) }, firstName(teacher(s, teacherId)!));

export function templateDraft(s: Store, p: Participant, step: NextStep, teacherId: string = p.teacher_id): string {
  const n = p.first_name, T = firstName(teacher(s, teacherId)!), it = step.item;
  const w = `${it.title} is on ${it.day} ${place(it)}`;
  if (step.channel === 'teacher_call') return `Hi ${n}, it’s ${T} from the course. I was thinking of you and wanted to say hello. The door is always open.`;
  if (step.channel === 'in_person') return it.kind === 'practice' ? `Hi ${n}, it’s so good to see you.` : `Hi ${n}, it’s so good to see you. ${w}, and you’d be very welcome.`;
  if (step.overridden || it.kind === 'practice' || step.stage === 'seva_inclined') return inviteDraft(s, p, it, teacherId);
  switch (step.stage) {
    case 'new':
      return `Hi ${n}, it was lovely having you on the course. A little practice each day is a beautiful way to begin, and ${w} if you’d like to practise together. Come only if it suits you. - ${T}`;
    case 'ready_to_deepen':
      return `Hi ${n}, your practice has been so steady these past weeks, and it’s a joy to see. I thought of you for ${it.title} ${place(it)}, starting ${it.day}. If you’d like to know more, just say so, and if now isn’t the time, that’s completely fine. - ${T}`;
    case 'drifting':
      return `Hi ${n}, just thinking of you and hoping all is well. ${w}, and you’re always welcome. No need to reply. - ${T}`;
    case 'returning':
      return `Hi ${n}, lovely to see you. ${w} if you’d like to sit together. Only if it suits you. - ${T}`;
    default:
      return `Hi ${n}, lovely to see your practice going so steadily. ${w}, and you’d be very welcome. No need to reply if the timing doesn’t suit. - ${T}`;
  }
}

export const aiAvailable = () => !!process.env.ANTHROPIC_API_KEY;

const SYSTEM = `You write short personal notes that an Art of Living teacher sends to one participant after their course.

Why the rules below matter: people drift away when follow-up feels like a broadcast or a sales push. Each note must read as one person thinking of another, and must be easy to decline.

Rules:
- At most ${config.message_rules.max_sentences} sentences, then a signature on the same line in the form "- <teacher's first name>".
- Warm, respectful, never pushy. No guilt, urgency, scarcity or sales language.
- Never mention price, fees, missed days, gaps, streaks being broken or inactivity. If a practice count is given, use it only as appreciation.
- Always include an easy way to decline or not reply.
- Use only the facts given. Do not invent programme names, dates, places or details about the person. Do not use gendered pronouns for the participant.
- The teacher's private remark is context for wording only. Never quote it or reveal that remarks exist.
- Do not write practice instructions.
- Plain text only: no greeting line breaks, no emoji, no quotation marks around the note.

Reply with the note and nothing else.`;

function userPrompt(s: Store, p: Participant, step: NextStep, teacherId: string): string {
  const last = [...p.courses_completed].sort((a, b) => a.completed_on.localeCompare(b.completed_on)).pop();
  const it = step.item;
  return [
    `Participant's first name: ${p.first_name}`,
    last ? `Last course: ${last.title}, completed ${daysBetween(last.completed_on)} days ago` : '',
    `Practice days in the last 40 (appreciation only): ${daysInWindow(s, p.id, 40)}`,
    `Teacher's first name: ${firstName(teacher(s, teacherId)!)}`,
    it.kind === 'practice' ? 'Purpose: a word of encouragement for the daily practice, with no ask' : `Invitation to: ${it.title}, ${it.day}${it.time ? ' at ' + it.time : ''}, ${place(it)}`,
    step.habit ? 'Also gently encourage a little daily practice.' : '',
    `Tone for this person: ${TONE[step.stage]}`,
    s.notes[p.id] ? `Teacher's private remark (wording context only): ${s.notes[p.id]}` : '',
  ].filter(Boolean).join('\n');
}

async function askClaude(prompt: string): Promise<string | null> {
  const client = new Anthropic();
  const res = await client.messages.create(
    { model: 'claude-opus-5-5', max_tokens: 16000, output_config: { effort: 'low' }, system: SYSTEM, messages: [{ role: 'user', content: prompt }] },
    { timeout: 25_000, maxRetries: 1 },
  );
  if (res.stop_reason === 'refusal') return null;
  const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
  return text || null;
}

// Returns the AI draft, or the template when there is no key, the call fails, or the draft fails the filter twice.
export async function draftFor(s: Store, p: Participant, step: NextStep, teacherId: string): Promise<{ text: string; source: 'ai' | 'template' }> {
  const fallback = { text: templateDraft(s, p, step, teacherId), source: 'template' as const };
  if (!aiAvailable() || step.channel === 'teacher_call' || step.channel === 'in_person') return fallback;
  const cacheKey = [p.id, step.item.key, step.stage, s.tags[p.id].join(','), s.notes[p.id]].join('|');
  if (s.aiDrafts[cacheKey]) return { text: s.aiDrafts[cacheKey], source: 'ai' };
  const prompt = userPrompt(s, p, step, teacherId);
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const text = await askClaude(prompt);
      if (text && checkMessage(text, config.banned_phrases, config.message_rules.max_sentences).ok) {
        s.aiDrafts[cacheKey] = text;
        return { text, source: 'ai' };
      }
    }
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) console.warn('Draft writer: the Anthropic API key was rejected. Using templates.');
    else if (err instanceof Anthropic.RateLimitError) console.warn('Draft writer: rate limited. Using the template for this draft.');
    else if (err instanceof Anthropic.APIError) console.warn(`Draft writer: API error ${err.status}. Using the template for this draft.`);
    else console.warn('Draft writer: could not reach the API. Using the template for this draft.');
  }
  return fallback;
}
