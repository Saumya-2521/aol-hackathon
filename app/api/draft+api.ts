import { draftFor } from '@/lib/drafter';
import { nextStep } from '@/lib/engine';
import { getStore, person } from '@/lib/store';

// Asks the draft writer for a personal note (features.md C1). The Claude API key stays on the server.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const s = getStore();
  const p = body && person(s, body.pid);
  if (!p) return Response.json({ ok: false, error: 'Participant not found' }, { status: 404 });
  const { text, source } = await draftFor(s, p, nextStep(s, p), body.teacherId ?? p.teacher_id);
  return Response.json({ ok: true, draft: text, source });
}
