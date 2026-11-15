// E2 Today, kept short on purpose: a warm note for the teacher, new course channel, two tiles for this week,
// and the people to reach out to personally. Practice numbers live in Reports only (features.md E2, changed 2026-11-15).
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Avatar, Body, Btn, Icon, Loading, NoteCard, ProgressBar, Screen, Section, T, type IconName } from '@/components/ui';
import { useApp } from '@/lib/app';
import { colors } from '@/theme';

const TONE = { accent: ['bg-accent-tint', colors.accent.deep], green: ['bg-green-tint', colors.green.deep] } as const;

// `Tile` (ui-design.md section 4): small label with icon, title, when, one fact at the bottom. Opens Events.
function Tile({ tone, icon, label, title, when, children }: { tone: keyof typeof TONE; icon: IconName; label: string; title?: string; when?: string; children?: React.ReactNode }) {
  const [bg, hex] = TONE[tone];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title ? `${label}: ${title}` : `${label}: nothing posted yet`} onPress={() => router.navigate('/t/events')} className={`flex-1 gap-2 rounded-card p-3.5 active:opacity-70 ${bg}`}>
      <View className="flex-row items-center gap-1.5"><Icon name={icon} size={15} color={hex} /><T v="label" c={tone}>{label}</T></View>
      {title ? (
        <>
          <View className="flex-1 gap-0.5"><T v="h3">{title}</T><T v="small" c="ink2" className="text-[13.5px]">{when}</T></View>
          {children}
        </>
      ) : <T v="small" c="ink2" className="flex-1 text-[13.5px]">Nothing posted yet. Tap to add one.</T>}
    </Pressable>
  );
}

export default function Today() {
  const { tv, setSheet } = useApp();
  if (!tv) return <Loading />;
  const ev = tv.nextEvent, se = tv.openSeva;
  const evTime = ev?.time.split(' - ')[0];
  // People who need a call or a hello in person come first, then people with no practice for 3 days or more (C4).
  const reach = [
    ...tv.people.filter((p) => p.rec.direct).map((p) => ({ p, why: p.rec.channel === 'teacher_call' ? 'A phone call from you' : 'A hello in person', label: p.rec.actionLabel, edit: false })),
    ...tv.people.filter((p) => !p.rec.direct && p.alertDays != null).map((p) => ({ p, why: `No practice · ${p.alertDays} days`, label: 'Write a note', edit: true })),
  ];
  return (
    <Screen logo right={<T v="small">{tv.dateLabel}</T>}>
      <Body>
        <T v="h1">Good morning, {tv.first}</T>

        {/* A warm note for the teacher. The wisdom note appears only when the team has added one to config.teacher_note.wisdom_notes. */}
        <NoteCard text={tv.cheer} sub={tv.wisdom ? `${tv.wisdom.text}${tv.wisdom.source ? ` (${tv.wisdom.source})` : ''}` : undefined} />

        <Btn wide v="out" icon="plus" label="New course channel" onPress={() => router.navigate('/new-channel')} />

        <Section title="This week" />
        <View className="flex-row gap-3">
          <Tile tone="accent" icon="calendar" label="Next event" title={ev?.title} when={ev ? `${ev.day}${evTime ? ` · ${evTime}` : ''}` : undefined}>
            {ev ? <T v="strong" c="accent" className="text-[13.5px]">{ev.going.length} going</T> : null}
          </Tile>
          <Tile tone="green" icon="heart" label="Open seva" title={se?.title} when={se?.day}>
            {se ? (<><ProgressBar value={se.count} max={se.spots} /><T v="strong" c="green" className="text-[13.5px]">{se.count} of {se.spots} signed up</T></>) : null}
          </Tile>
        </View>

        {reach.length ? (
          <>
            <Section title="Reach out personally" right={<T v="small">{reach.length}</T>} />
            <View className="rounded-card border border-line bg-card px-3.5">
              {reach.map(({ p, why, label, edit }, i) => (
                <View key={p.id} className={`flex-row items-center gap-3 py-3 ${i === reach.length - 1 ? '' : 'border-b border-line'}`}>
                  <Avatar text={p.initials} />
                  <View className="flex-1"><T v="strong">{p.first}</T><T v="small" c="ink2" className="text-[13.5px]">{why}</T></View>
                  <Btn sm v="tint" label={label} onPress={() => setSheet({ t: 'rec', pid: p.id, edit })} />
                </View>
              ))}
            </View>
          </>
        ) : null}
      </Body>
    </Screen>
  );
}
