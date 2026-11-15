import { runAction } from '@/lib/actions';
import { getStore } from '@/lib/store';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.type !== 'string') return Response.json({ ok: false, error: 'Bad request' }, { status: 400 });
  return Response.json(runAction(getStore(), body));
}
