import { resetStore } from '@/lib/store';

// Reset demo (features.md A3): reload all the JSON and undo every change made in the session.
export function POST() {
  resetStore();
  return Response.json({ ok: true });
}
