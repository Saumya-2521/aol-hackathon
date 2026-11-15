import { ensureAutomatic } from '@/lib/actions';
import { getStore, person } from '@/lib/store';
import { participantView } from '@/lib/views';

export function GET(_request: Request, { id }: { id: string }) {
  const s = getStore();
  const p = person(s, id);
  if (!p) return Response.json({ error: 'Participant not found' }, { status: 404 });
  ensureAutomatic(s, p);
  return Response.json(participantView(s, id));
}
