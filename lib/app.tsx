// App state shared by every screen: who we're viewing as, that role's data, sheets and the toast.
import { router, usePathname } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { get, post } from './api';
import { onNotificationTap, showSystemNotification } from './notify';
import type { ActionResult, DemoPeople, ParticipantView, TeacherView } from './types';

export type Role = 'p' | 't';
export type Tile = 'all' | 'reg' | 'build' | 'support' | 'app'; // 'all' = no group picked: everyone in the course
export type InviteItem = { key: string; kind: string; title: string; day: string; place: string };
export type Sheet =
  | null
  | { t: 'demo' }
  | { t: 'group' } // who in the participant's course has practised today (features.md D2)
  | { t: 'note' } // the participant's latest notification in full (features.md C3)
  | { t: 'rec'; pid: string; edit?: boolean }
  | { t: 'other'; pid: string; back: boolean }
  | { t: 'add'; seva: boolean }
  | { t: 'invite'; item: InviteItem; pids: string[] }
  | { t: 'code'; code: string; name: string; n: number };

type Ctx = {
  role: Role; pid: string; tid: string;
  pv: ParticipantView | null; tv: TeacherView | null; demo: DemoPeople | null;
  error: string | null;
  refresh: () => Promise<void>;
  act: (body: Record<string, unknown>, done?: string) => Promise<ActionResult>;
  toast: (text: string) => void; toastText: string | null;
  sheet: Sheet; setSheet: (s: Sheet) => void;
  signedUp: { p: boolean; t: boolean } | null;
  switchRole: (r: Role) => void; viewAs: (id: string) => void; reset: () => Promise<void>;
  report: { cohort: string | null; tile: Tile }; setReport: (r: { cohort: string | null; tile: Tile }) => void;
};

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp must be used inside AppProvider');
  return c;
};

// Which role a screen belongs to, so a reload (or opening /t directly on the projected laptop) keeps the right view.
const roleOf = (path: string): Role | null =>
  path === '/t' || path.startsWith('/t/') || path === '/teacher-sign-up' || path === '/new-channel' || path.startsWith('/person/') ? 't'
    : path === '/p' || path.startsWith('/p/') || path === '/sign-up' || path === '/session' ? 'p' : null;
const POLL_MS = 3000; // how often each device re-reads its view, so two devices stay in step during the demo

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<Role>(() => roleOf(pathname) ?? 'p');
  const [pid, setPid] = useState('P01'); // Priya by default (features.md A4)
  const [tid, setTid] = useState('T1'); // Anita by default
  const [pv, setPv] = useState<ParticipantView | null>(null);
  const [tv, setTv] = useState<TeacherView | null>(null);
  const [demo, setDemo] = useState<DemoPeople | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [report, setReport] = useState<{ cohort: string | null; tile: Tile }>({ cohort: null, tile: 'all' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const who = useRef({ role, pid, tid });
  who.current = { role, pid, tid };

  const refresh = useCallback(async () => {
    const { role, pid, tid } = who.current;
    try {
      const view = await get<ParticipantView | TeacherView>(role === 'p' ? '/api/participant/' + pid : '/api/teacher/' + tid);
      const now = who.current;
      if (now.role !== role || now.pid !== pid || now.tid !== tid) return; // the role or persona changed while this was loading
      // Keep the same object when nothing changed, so the 3-second poll doesn't re-render every screen.
      const keep = <V,>(old: V | null) => (old && JSON.stringify(old) === JSON.stringify(view) ? old : (view as V));
      if (role === 'p') setPv(keep<ParticipantView>); else setTv(keep<TeacherView>);
      setError(null);
    } catch {
      setError('We couldn’t reach the server. Check that it is running, then try again.');
    }
  }, []);

  useEffect(() => { refresh(); }, [role, pid, tid, refresh]);
  useEffect(() => { const r = roleOf(pathname); if (r) setRole(r); }, [pathname]);
  // Sign-up shows once per role in a demo run (features.md D0, E0). The flags live on the server, so a reload doesn't bring it back.
  const demoRef = useRef<DemoPeople | null>(null);
  const loadDemo = useCallback(async () => {
    try { const d = await get<DemoPeople>('/api/demo'); if (JSON.stringify(d) !== JSON.stringify(demoRef.current)) { demoRef.current = d; setDemo(d); } } catch { /* the screens show the connection error */ }
    return demoRef.current;
  }, []);
  useEffect(() => { loadDemo(); }, [loadDemo]);
  // Two-device demo: what the teacher sends on one device reaches the participant's device within a few seconds, and the other way round.
  useEffect(() => {
    const t = setInterval(() => { refresh(); loadDemo(); }, POLL_MS);
    return () => clearInterval(t);
  }, [refresh, loadDemo]);
  const home = (r: Role, d: DemoPeople | null = demoRef.current) =>
    r === 'p' ? (d && !d.signedUp.p ? '/sign-up' : '/p') : (d && !d.signedUp.t ? '/teacher-sign-up' : '/t');

  const toast = useCallback((text: string) => {
    setToastText(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastText(null), 2600);
  }, []);

  const act = useCallback(async (body: Record<string, unknown>, done?: string) => {
    let res: ActionResult;
    try { res = await post<ActionResult>('/api/action', body); } catch { res = { ok: false, error: 'We couldn’t reach the server. Please try again.' }; }
    if (res.ok) { if (done) toast(done); } else toast(res.error);
    await refresh();
    if (body.type === 'join' || body.type === 'teacherJoin') await loadDemo();
    return res;
  }, [refresh, toast, loadDemo]);

  // A new note for the participant also goes out as a real system notification (expo-notifications; native only).
  // It fires once per note: when it arrives, or when the persona who has it is chosen.
  const notified = useRef<string | null>(null);
  useEffect(() => {
    const note = role === 'p' && pv && pv.id === pid ? pv.note : null;
    if (!note || notified.current === note.id) return;
    notified.current = note.id;
    showSystemNotification(note);
  }, [pv, role, pid]);
  // Tapping the system notification opens the note in full on Home.
  useEffect(() => onNotificationTap(() => { if (who.current.role === 'p') { router.navigate('/p'); setSheet({ t: 'note' }); } }), []);

  const switchRole = useCallback((r: Role) => {
    setSheet(null); setRole(r);
    router.replace(home(r));
  }, []);

  const viewAs = useCallback((id: string) => {
    setSheet(null);
    if (who.current.role === 'p') { setPv(null); setPid(id); router.replace('/p'); }
    else { setTv(null); setTid(id); setReport({ cohort: null, tile: 'all' }); router.replace('/t'); }
  }, []);

  const reset = useCallback(async () => {
    await post('/api/reset').catch(() => {});
    notified.current = null; // note ids start again after a reset
    setSheet(null); setReport({ cohort: null, tile: 'all' });
    await refresh();
    router.replace(home(who.current.role, await loadDemo()));
    toast('Demo reset. Everyone is back where they started.');
  }, [refresh, toast, loadDemo]);

  const value = useMemo<Ctx>(() => ({ role, pid, tid, pv, tv, demo, error, refresh, act, toast, toastText, sheet, setSheet, signedUp: demo?.signedUp ?? null, switchRole, viewAs, reset, report, setReport }),
    [role, pid, tid, pv, tv, demo, error, refresh, act, toast, toastText, sheet, switchRole, viewAs, reset, report]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
