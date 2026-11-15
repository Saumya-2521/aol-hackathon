// E2 Today, kept short on purpose: new course channel, three shortcuts for this week, and the people to reach out to personally.
// Practice numbers live in Reports only (features.md E2, changed 2026-11-15).
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Avatar, Body, Btn, Icon, Loading, Screen, Section, T, type IconName } from '@/components/ui';
import { useApp } from '@/lib/app';
import { colors } from '@/theme';

// `Shortcut` row (ui-design.md section 4): icon, small label, one bold line, chevron.
function Shortcut({ icon, label, text, to, last }: { icon: IconName; label: string; text: string; to: '/t/events' | '/t/people'; last?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${text}`} onPress={() => router.navigate(to)} className={`flex-row items-center gap-3 py-3 active:opacity-70 ${last ? '' : 'border-b border-line'}`}>
      <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-tint"><Icon name={icon} size={17} color={colors.brand.DEFAULT} /></View>
      <View className="flex-1"><T v="small" c="ink2" className="font-body-semibold text-[12.5px]">{label}</T><T v="strong" numberOfLines={1}>{text}</T></View>
      <Icon name="chevron-right" size={18} color={colors.ink[3]} />
    </Pressable>
  );
}

export default function Today() {
  const { tv, setSheet } = useApp();
  if (!tv) return <Loading />;
  const ev = tv.nextEvent, se = tv.openSeva;
  // People who need a call or a hello in person come first, then people with no practice for 3 days or more (C4).
  const reach = [
    ...tv.people.filter((p) => p.rec.direct).map((p) => ({ p, why: p.rec.channel === 'teacher_call' ? 'A phone call from you' : 'A hello in person', label: p.rec.actionLabel, edit: false })),
    ...tv.people.filter((p) => !p.rec.direct && p.alertDays != null).map((p) => ({ p, why: `No practice · ${p.alertDays} days`, label: 'Write a note', edit: true })),
  ];
  return (
    <Screen logo right={<T v="small">{tv.dateLabel}</T>}>
      <Body>
        <T v="h1">Good morning, {tv.first}</T>
        <Btn wide v="out" icon="plus" label="New course channel" onPress={() => router.navigate('/new-channel')} />

        <Section title="This week" />
        <View className="rounded-card border border-line bg-card px-3.5">
          <Shortcut icon="calendar" label={ev ? `Next event · ${ev.day}` : 'Next satsang or event'} text={ev ? ev.title : 'Nothing posted yet'} to="/t/events" />
          <Shortcut icon="heart" label={se ? `Open seva · ${se.count} of ${se.spots} signed up` : 'Open seva'} text={se ? se.title : 'No open seva right now'} to="/t/events" />
          <Shortcut icon="users" label="Remarks" text={tv.remarksLeft ? `${tv.remarksLeft} of ${tv.people.length} still to add` : 'Added for everyone'} to="/t/people" last />
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
