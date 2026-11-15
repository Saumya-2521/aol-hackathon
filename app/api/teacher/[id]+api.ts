import { getStore } from '@/lib/store';
import { teacherView } from '@/lib/views';

export function GET(_request: Request, { id }: { id: string }) {
  const view = teacherView(getStore(), id);
  return view ? Response.json(view) : Response.json({ error: 'Teacher not found' }, { status: 404 });
}
