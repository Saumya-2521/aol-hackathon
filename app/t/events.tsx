// E6 Events and seva: add, see who is going, invite by skill, mark seva complete.
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Body, Btn, Card, Empty, Icon, Loading, ProgressBar, Screen, Section, T, Tag } from '@/components/ui';
import { useApp } from '@/lib/app';
import type { TeacherEvent, TeacherSeva } from '@/lib/types';
import { colors } from '@/theme';

const TYPE: Record<string, string> = { follow_up: 'Follow-up', satsang: 'Satsang', community_event: 'Community', meditation_event: 'Meditation' };

function Matches({ item, seva }: { item: TeacherEvent; seva?: boolean }) {
  const { tv, setSheet } = useApp();
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [everyone, setEveryone] = useState(false);
  if (!tv) return null;
  const rows = everyone ? tv.people.map((p) => ({ id: p.id, tags: item.matches.find((m) => m.id === p.id)?.tags ?? [] })) : item.matches;
  const ids = Object.keys(picked).filter((k) => picked[k]);
  const place = item.city === 'Online' ? 'online' : 'in ' + item.city;
  return (
    <View className="gap-2">
      <T v="label">People who might enjoy this</T>
      {rows.length ? rows.map((m) => {
        const p = tv.people.find((x) => x.id === m.id)!;
        const on = !!picked[m.id];
        return (
          <Pressable key={m.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => setPicked((x) => ({ ...x, [m.id]: !on }))} className="flex-row items-center gap-2.5 py-1 active:opacity-70">
            <View className={`h-[20px] w-[20px] items-center justify-center rounded-[6px] border-[1.5px] ${on ? 'border-green-strong bg-green-strong' : 'border-line bg-card'}`}>{on ? <Icon name="check" size={14} color={colors.card} /> : null}</View>
            <T>{p.first}</T>
            {m.tags.map((t) => <Tag key={t} label={t} />)}
          </Pressable>
        );
      }) : <T v="small">No skill matches yet.</T>}
      <View className="flex-row flex-wrap gap-2">
        <Btn sm label="Invite selected" disabled={!ids.length} onPress={() => setSheet({ t: 'invite', item: { key: item.key, kind: seva ? 'seva' : 'event', title: item.title, day: item.day, place }, pids: ids })} />
        {everyone ? null : <Btn sm v="quiet" label="Choose from everyone" onPress={() => setEveryone(true)} />}
      </View>
    </View>
  );
}

export default function Events() {
  const { tv, act, setSheet } = useApp();
  if (!tv) return <Loading />;
  return (
    <Screen title="Events and seva">
      <Body>
        <T v="meta">What you add shows at once for participants nearby.</T>
        <View className="flex-row gap-2">
          <Btn sm v="out" icon="plus" label="Event" onPress={() => setSheet({ t: 'add', seva: false })} />
          <Btn sm v="out" icon="plus" label="Seva" onPress={() => setSheet({ t: 'add', seva: true })} />
        </View>

        <Section title="Events" />
        {tv.events.length ? tv.events.map((e) => (
          <Card key={e.key}>
            <T v="label" c="accent">{TYPE[e.cat] ?? 'Event'}</T>
            <T v="h3">{e.title}</T>
            <T v="meta">{e.day} · {e.time} · {e.city}</T>
            <T v="meta"><T v="strong" className="text-[14px]">{e.going.length} going</T>{e.going.length ? ': ' + e.going.join(', ') : ''}</T>
            <Matches item={e} />
          </Card>
        )) : <Empty text="No events yet. Add one for people nearby." />}

        <Section title="Seva" />
        {tv.seva.length ? tv.seva.map((s: TeacherSeva) => (
          <Card key={s.key}>
            <T v="h3">{s.title}</T>
            <T v="meta">{s.day} · {s.time} · {s.city}</T>
            <ProgressBar value={s.count} max={s.spots} />
            <T v="meta"><T v="strong" className="text-[14px]">{s.count} of {s.spots} signed up</T>{s.going.length ? ': ' + s.going.join(', ') : ''}</T>
            {s.done ? (
              <View className="flex-row items-center gap-1.5"><Icon name="check" size={16} color={colors.green.deep} /><T v="strong" c="green">Completed. Thank-you note sent.</T></View>
            ) : (
              <>
                <Matches item={s} seva />
                <Btn sm v="quiet" label="Mark complete" onPress={() => act({ type: 'completeSeva', sevaId: s.id }, 'Thank-you note sent to everyone who signed up')} />
              </>
            )}
          </Card>
        )) : <Empty text="No seva yet. Add one when you need helping hands." />}
      </Body>
    </Screen>
  );
}
