// App state shared by every screen: who we're viewing as, that role's data, sheets, toast and the notification banner.
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { get, post } from './api';
import type { ActionResult, DemoPeople, Notice, ParticipantView, TeacherView } from './types';

export type Role = 'p' | 't';
export type Tile = 'reg' | 'build' | 'support' | 'app';
export type InviteItem = { key: string; kind: string; title: string; day: string; place: string };
export type Sheet =
  | null
  | { t: 'demo' }
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
  banner: Notice | null; dismissBanner: () => void;
  sheet: Sheet; setSheet: (s: Sheet) => void;
  switchRole: (r: Role) => void; viewAs: (id: string) => void; reset: () => Promise<void>;
  report: { cohort: string | null; tile: Tile }; setReport: (r: { cohort: string | null; tile: Tile }) => void;
};

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp must be used inside AppProvider');
  return c;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('p');
  const [pid, setPid] = useState('P01'); // Priya by default (features.md A4)
  const [tid, setTid] = useState('T1'); // Anita by default
  const [pv, setPv] = useState<ParticipantView | null>(null);
  const [tv, setTv] = useState<TeacherView | null>(null);
  const [demo, setDemo] = useState<DemoPeople | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const [banner, setBanner] = useState<Notice | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [report, setReport] = useState<{ cohort: string | null; tile: Tile }>({ cohort: null, tile: 'reg' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seen = useRef(new Set<string>());
  const who = useRef({ role, pid, tid });
  who.current = { role, pid, tid };

  const refresh = useCallback(async () => {
    const { role, pid, tid } = who.current;
    try {
      if (role === 'p') setPv(await get<ParticipantView>('/api/participant/' + pid));
      else setTv(await get<TeacherView>('/api/teacher/' + tid));
      setError(null);
    } catch {
      setError('We couldn’t reach the server. Check that it is running, then try again.');
    }
  }, []);

  useEffect(() => { refresh(); }, [role, pid, tid, refresh]);
  useEffect(() => { get<DemoPeople>('/api/demo').then(setDemo).catch(() => {}); }, []);

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
    return res;
  }, [refresh, toast]);

  const dismissBanner = useCallback(() => {
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    setBanner(null);
  }, []);

  // Simulated push (features.md C3): show each pending notification once, as a banner, for the participant.
  useEffect(() => {
    if (role !== 'p' || banner || sheet || !pv || pv.id !== pid) return;
    const next = pv.notices.find((n) => !seen.current.has(n.id));
    if (!next) return;
    seen.current.add(next.id);
    setBanner(next);
    post('/api/action', { type: 'ack', pid, ids: [next.id] }).catch(() => {});
    bannerTimer.current = setTimeout(() => setBanner(null), 6500);
  }, [pv, role, pid, banner, sheet]);

  const switchRole = useCallback((r: Role) => {
    dismissBanner(); setSheet(null); setRole(r);
    router.replace(r === 'p' ? '/p' : '/t');
  }, [dismissBanner]);

  const viewAs = useCallback((id: string) => {
    dismissBanner(); setSheet(null);
    if (who.current.role === 'p') { setPv(null); setPid(id); router.replace('/p'); }
    else { setTv(null); setTid(id); setReport({ cohort: null, tile: 'reg' }); router.replace('/t'); }
  }, [dismissBanner]);

  const reset = useCallback(async () => {
    await post('/api/reset').catch(() => {});
    seen.current.clear(); dismissBanner(); setSheet(null); setReport({ cohort: null, tile: 'reg' });
    await refresh();
    router.replace(who.current.role === 'p' ? '/p' : '/t');
    toast('Demo reset. Everyone is back where they started.');
  }, [refresh, toast, dismissBanner]);

  const value = useMemo<Ctx>(() => ({ role, pid, tid, pv, tv, demo, error, refresh, act, toast, toastText, banner, dismissBanner, sheet, setSheet, switchRole, viewAs, reset, report, setReport }),
    [role, pid, tid, pv, tv, demo, error, refresh, act, toast, toastText, banner, dismissBanner, sheet, switchRole, viewAs, reset, report]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
