// Bottom sheets: the demo menu, a person's recommendation, other steps, add event or seva, invitations and the join code.
import React, { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useApp, type InviteItem } from '@/lib/app';
import { checkMessage } from '@/lib/filter';
import { inviteText } from '@/lib/templates';
import type { Item, PersonView } from '@/lib/types';
import { colors } from '@/theme';
import { whenText, whereText } from './cards';
import { RecommendationCard, recKey } from './RecommendationCard';
import { TagPicker } from './TagPicker';
import { Btn, Card, Chip, Field, Icon, SheetFrame, T } from './ui';

export function Sheets() {
  const { sheet, setSheet, tv } = useApp();
  if (!sheet) return null;
  const close = () => setSheet(null);
  const person = 'pid' in sheet ? tv?.people.find((p) => p.id === sheet.pid) : undefined;
  switch (sheet.t) {
    case 'demo': return <DemoMenu />;
    case 'note': return <NoteSheet />;
    case 'rec': return person ? (
      <SheetFrame onClose={close} title="Next step">
        <RecommendationCard key={recKey(person)} person={person} startEditing={sheet.edit} inSheet />
        <Btn wide v="quiet" label="Open the full profile" onPress={() => { close(); router.navigate(`/person/${person.id}`); }} />
      </SheetFrame>
    ) : null;
    case 'other': return person ? <OtherStep person={person} back={sheet.back} /> : null;
    case 'add': return <AddEvent seva={sheet.seva} />;
    case 'invite': return <Invite item={sheet.item} pids={sheet.pids} />;
    case 'code': return (
      <SheetFrame onClose={close} title="Your channel is ready">
        <T v="meta">{sheet.name} · {sheet.n} {sheet.n === 1 ? 'participant' : 'participants'}</T>
        <View className="items-center rounded-card border-[1.5px] border-dashed border-accent bg-accent-wash px-3 py-5"><T v="big" c="brand" selectable className="tracking-[2px]">{sheet.code}</T></View>
        <T v="meta">Share this code with your participants. They enter it when they sign up and land in this channel.</T>
        <CopyCode code={sheet.code} />
        <Btn wide v="quiet" label="Done" onPress={close} />
      </SheetFrame>
    );
  }
}

/* The participant's latest notification in full (features.md C3). An invitation is read and answered here. */
function NoteSheet() {
  const { pv, pid, act, setSheet } = useApp();
  const close = () => setSheet(null);
  const note = pv?.note, inv = pv?.invitation;
  if (!pv || !note) return null;
  if (note.title === 'Invitation' && inv) {
    // The sheet already says who it is from, so the "- Anita" signature is left out here. The stored message is still signed.
    const body = inv.text.replace(new RegExp(`\\s*[-–—]\\s*${inv.from}\\s*$`), '');
    const answer = (text: string) => act({ type: 'answer', pid, text }, `Sent to ${inv.from}`);
    return (
      <SheetFrame onClose={close} title="A note for you">
        <View className="flex-row items-center gap-1.5"><Icon name="mail" size={14} color={colors.ink[3]} /><T v="label">From {inv.from}</T></View>
        {inv.item ? (<><T v="h3">{inv.item.title}</T><T v="meta">{whenText(inv.item)} · {whereText(inv.item)}</T></>) : null}
        <T>{body}</T>
        {inv.answer ? (
          <T v="small">You replied: “{inv.answer}”. Thank you for letting {inv.from} know.</T>
        ) : (
          <View className="flex-row flex-wrap gap-2"><Btn sm label="Tell me more" onPress={() => answer('Tell me more')} /><Btn sm v="quiet" label="Not right now" onPress={() => answer('Not right now')} /></View>
        )}
        <Btn wide v="quiet" label="Close" onPress={close} />
      </SheetFrame>
    );
  }
  return (
    <SheetFrame onClose={close} title={note.title}>
      <T>{note.text}</T>
      <Btn wide v="quiet" label="Close" onPress={close} />
    </SheetFrame>
  );
}

function CopyCode({ code }: { code: string }) {
  const { toast } = useApp();
  const copy = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) { await navigator.clipboard.writeText(code); toast('Code copied'); }
      else toast('Press and hold the code to copy it');
    } catch { toast('Press and hold the code to copy it'); }
  };
  return <Btn wide label="Copy the code" onPress={copy} />;
}

/* Demo menu: role switcher (A4), persona picker and Reset demo (A3). */
function DemoMenu() {
  const { role, pid, tid, demo, setSheet, switchRole, viewAs, reset } = useApp();
  const list = role === 'p' ? demo?.participants.map((p) => ({ id: p.id, label: p.first, sub: p.area })) : demo?.teachers.map((t) => ({ id: t.id, label: t.name, sub: 'Teacher' }));
  const current = role === 'p' ? pid : tid;
  return (
    <SheetFrame onClose={() => setSheet(null)} title="Demo menu">
      <View className="flex-row rounded-full bg-mist p-1">
        {(['p', 't'] as const).map((r) => (
          <Pressable key={r} accessibilityRole="button" accessibilityState={{ selected: role === r }} onPress={() => role !== r && switchRole(r)} className={`flex-1 items-center rounded-full py-2 ${role === r ? 'bg-card' : ''}`}>
            <T v="strong" c={role === r ? 'brand' : 'ink2'}>{r === 'p' ? 'Participant' : 'Teacher'}</T>
          </Pressable>
        ))}
      </View>
      <T v="small" c="ink2" className="font-body-semibold">{role === 'p' ? 'View the app as' : 'View as teacher'}</T>
      <View className="flex-row flex-wrap gap-1.5">
        {(list ?? []).map((x) => <Chip key={x.id} label={role === 'p' ? x.label : x.label} on={x.id === current} onPress={() => viewAs(x.id)} />)}
      </View>
      <Btn wide v="quiet" label="See the sign-up screen" onPress={() => { setSheet(null); router.navigate(role === 'p' ? '/sign-up' : '/teacher-sign-up'); }} />
      <Btn wide v="out" label="Reset demo" onPress={reset} />
      <T v="small">Reset reloads the sample data and undoes everything done in this session.</T>
    </SheetFrame>
  );
}

/* Choose a different step (features.md E4): another course, an event, seva, or a daily-practice encouragement. */
function OtherStep({ person, back }: { person: PersonView; back: boolean }) {
  const { act, setSheet } = useApp();
  const GROUP: Record<string, string> = { course: 'Courses', event: 'Events and satsang', seva: 'Seva', practice: 'Daily practice' };
  const choose = async (key: string | null) => { await act({ type: 'setStep', pid: person.id, key }); setSheet(back ? { t: 'rec', pid: person.id } : null); };
  return (
    <SheetFrame onClose={() => setSheet(back ? { t: 'rec', pid: person.id } : null)} title={`Choose a different step for ${person.first}`}>
      {person.rec.overridden ? <Btn wide v="quiet" label="Back to the suggested step" onPress={() => choose(null)} /> : null}
      {person.options.map((i: Item, n: number) => {
        const head = n === 0 || person.options[n - 1].kind !== i.kind ? <T v="label">{GROUP[i.kind]}</T> : null;
        return (
          <View key={i.key} className="gap-2">
            {head}
            <Pressable accessibilityRole="button" onPress={() => choose(i.key)} className="rounded-input border border-line bg-card px-3 py-2.5 active:opacity-70">
              <T v="strong">{i.title}</T>
              {i.kind === 'practice' ? null : <T v="small" c="ink2">{whenText(i)} · {whereText(i)}</T>}
            </Pressable>
          </View>
        );
      })}
    </SheetFrame>
  );
}

/* Add an event or a seva opportunity (features.md E6). */
function AddEvent({ seva }: { seva: boolean }) {
  const { tv, tid, act, setSheet } = useApp();
  const TYPES = [['follow_up', 'Follow-up'], ['satsang', 'Satsang'], ['community_event', 'Community'], ['meditation_event', 'Meditation']] as const;
  const places = [...(tv?.areas ?? []), 'Online'];
  const [f, setF] = useState({ title: '', category: 'satsang', date: '2026-11-21', time: '7:00 PM - 8:30 PM', city: places[0], description: '', spots: '3' });
  const [tags, setTags] = useState<string[]>([]);
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  const save = async () => {
    const res = await act({ type: 'addEvent', teacherId: tid, seva, ...f, tags }, 'Added. People nearby can see it now.');
    if (res.ok) setSheet(null);
  };
  return (
    <SheetFrame onClose={() => setSheet(null)} title={seva ? 'Add a seva opportunity' : 'Add an event'}>
      <Field label="Title" value={f.title} onChangeText={set('title')} placeholder={seva ? 'e.g. Set-up for the satsang' : 'e.g. Full moon meditation'} />
      {seva ? null : (<View className="gap-1.5"><T v="small" c="ink2" className="font-body-semibold">Type</T><View className="flex-row flex-wrap gap-1.5">{TYPES.map(([k, l]) => <Chip key={k} label={l} on={f.category === k} onPress={() => set('category')(k)} />)}</View></View>)}
      <View className="flex-row gap-2.5"><Field half label="Date (YYYY-MM-DD)" value={f.date} onChangeText={set('date')} /><Field half label="Time" value={f.time} onChangeText={set('time')} /></View>
      <View className="gap-1.5"><T v="small" c="ink2" className="font-body-semibold">Place</T><View className="flex-row flex-wrap gap-1.5">{places.map((p) => <Chip key={p} label={p} on={f.city === p} onPress={() => set('city')(p)} />)}</View></View>
      <Field label="Description" value={f.description} onChangeText={set('description')} placeholder="A line about what to expect" />
      {seva ? <Field label="People needed" value={f.spots} onChangeText={set('spots')} keyboardType="number-pad" /> : null}
      <T v="label">Skill tags, used to suggest who to invite</T>
      <TagPicker tags={tags} vocabulary={tv?.tagVocabulary ?? []} onChange={setTags} />
      <Btn wide label={seva ? 'Add seva' : 'Add event'} onPress={save} />
    </SheetFrame>
  );
}

/* Invite by skill (features.md E6): one editable personal note each. The outreach gap and the filter apply. */
function Invite({ item, pids }: { item: InviteItem; pids: string[] }) {
  const { tv, setSheet } = useApp();
  return (
    <SheetFrame onClose={() => setSheet(null)} title={`Invite to ${item.title}`}>
      <T v="small">One personal note each. Edit freely before sending.</T>
      {pids.map((id) => { const p = tv?.people.find((x) => x.id === id); return p ? <InviteOne key={id} person={p} item={item} /> : null; })}
    </SheetFrame>
  );
}
function InviteOne({ person, item }: { person: PersonView; item: InviteItem }) {
  const { tv, tid, act } = useApp();
  const [text, setText] = useState(inviteText(person.first, item, tv!.first));
  const [sent, setSent] = useState(false);
  const check = checkMessage(text, tv!.bannedPhrases, tv!.maxSentences);
  const gap = sent ? null : person.rec.gapUntil;
  const send = async () => { const res = await act({ type: 'invite', teacherId: tid, pid: person.id, key: item.key, text }, `Sent to ${person.first}`); if (res.ok) setSent(true); };
  return (
    <Card>
      <T v="strong">{person.first}</T>
      {sent ? <View className="flex-row items-center gap-1.5"><Icon name="check" size={16} color={colors.green.deep} /><T v="strong" c="green">Sent</T></View> : (
        <>
          <Field label="Personal note" multiline value={text} onChangeText={setText} />
          {check.banned.length ? <View className="rounded-input bg-clay-tint px-2.5 py-2"><T v="small" c="clay">Please reword: “{check.banned.join('”, “')}”.</T></View> : null}
          {gap ? <T v="small">Next outreach possible on {gap}</T> : null}
          <Btn sm label="Send" disabled={!!gap || !check.ok} onPress={send} />
        </>
      )}
    </Card>
  );
}
