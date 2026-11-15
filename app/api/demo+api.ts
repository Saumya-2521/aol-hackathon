import { getStore } from '@/lib/store';
import { demoPeople } from '@/lib/views';

// The personas and teachers the role switcher can pick (features.md A4).
export function GET() {
  return Response.json(demoPeople(getStore()));
}
