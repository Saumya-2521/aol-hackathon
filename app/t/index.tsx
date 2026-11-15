// E2 Today: new course channel, this week's summary (sadhana, satsang, seva, remarks), alerts and personal check-ins.
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Avatar, Body, Btn, Card, Icon, LinkBtn, Loading, ProgressBar, Row, Screen, Section, T } from '@/components/ui';
import { useApp, type Tile } from '@/lib/app';
import { colors } from '@/theme';

const SEG = { reg: 'bg-brand', build: 'bg-accent', support: 'bg-sun' } as const;

export default function Today() {
  const { tv, setSheet, setReport } = useApp();
  if (!tv) return <Loading />;
  const openReport = (cohort: string, tile: Tile) => { setReport({ cohort, tile }); router.navigate('/t/reports'); };
  // People who need a call or a hello in person are listed under the check-in heading instead.
  const alerts = tv.people.filter((p) => p.alertDays != null && !p.rec.direct);
  const direct = tv.people.filter((p) => p.rec.direct);
  const ev = tv.nextEvent, se = tv.openSeva;
  return (
    <Screen logo right={<T v="small">{tv.dateLabel}</T>}>
      <Body>
        <View>
          <T v="small">Teacher · {tv.cohorts.length} {tv.cohorts.length === 1 ? 'group' : 'groups'} · {tv.people.length} participants</T>
          <T v="h1" className="mt-0.5">Good morning, {tv.first}</T>
        </View>
        <Btn wide v="out" icon="plus" label="New course channel" onPress={() => router.navigate('/new-channel')} />

        <Section title="Suggested this week" />
        {tv.cohorts.filter((c) => c.size > 0).map((c) => (
          <Card key={c.id}>
            <View className="flex-row items-baseline justify-between gap-2"><T v="label" c="brand" className="flex-1">Sadhana · {c.name}</T><LinkBtn label="Report" onPress={() => openReport(c.id, 'reg')} /></View>
            <View className="h-2.5 flex-row gap-[3px]" accessibilityLabel={`${c.counts.reg} very regular, ${c.counts.build} building, ${c.counts.support} need support`}>
              {(['reg', 'build', 'support'] as const).filter((k) => c.counts[k] > 0).map((k) => <View key={k} className={`rounded-full ${SEG[k]}`} style={{ flex: c.counts[k] }} />)}
            </View>
            <View className="flex-row flex-wrap justify-between gap-x-3 gap-y-1">
              <T v="small" c="ink2"><T v="strong" className="text-[13px]">{c.counts.reg}</T> very regular</T>
              <T v="small" c="ink2"><T v="strong" className="text-[13px]">{c.counts.build}</T> building</T>
              <T v="small" c="ink2"><T v="strong" className="text-[13px]">{c.counts.support}</T> need support</T>
            </View>
            <T v="meta"><T v="strong" className="text-[14px]">{c.practised} of {c.size}</T> practised today</T>
            {c.counts.app > 0 ? (
              <Pressable accessibilityRole="button" onPress={() => openReport(c.id, 'app')} className="flex-row items-center gap-2 rounded-[12px] bg-sun-tint px-3 py-2.5 active:opacity-70">
                <Icon name="bell" size={16} color={colors.sun.deep} />
                <T v="strong" c="sun" className="flex-1 text-[13.5px]">{c.counts.app} {c.counts.app === 1 ? 'hasn’t' : 'haven’t'} opened the app in 5+ days</T>
              </Pressable>
            ) : null}
          </Card>
        ))}

        <Card>
          <View className="flex-row items-baseline justify-between"><T v="label" c="brand">Satsang · next up</T><LinkBtn label="Post" onPress={() => { router.navigate('/t/events'); setSheet({ t: 'add', seva: false }); }} /></View>
          {ev ? (<><T v="h3">{ev.title}</T><T v="meta">{ev.day} · {ev.time.split(' - ')[0]} · {ev.city}</T><T v="meta"><T v="strong" className="text-[14px]">{ev.going.length} going</T>{ev.goingOwn ? ` · ${ev.goingOwn} from your groups` : ''}</T></>)
            : <T v="meta">Nothing posted yet. Add a satsang or an event for people nearby.</T>}
        </Card>

        <Card>
          <View className="flex-row items-baseline justify-between"><T v="label" c="brand">Seva · open</T><LinkBtn label="Manage" onPress={() => router.navigate('/t/events')} /></View>
          {se ? (<><T v="h3">{se.title} · {se.count} of {se.spots}</T><ProgressBar value={se.count} max={se.spots} /><T v="meta">{se.canInvite ? `${se.canInvite} ${se.canInvite === 1 ? 'participant' : 'participants'} tagged seva in your remarks can be invited` : 'Invite people by skill from Events and seva'}</T></>)
            : <T v="meta">No open seva right now. Add one when you need helping hands.</T>}
        </Card>

        <Pressable accessibilityRole="button" onPress={() => router.navigate('/t/people')} className="flex-row items-center justify-between gap-2.5 rounded-card bg-accent-tint px-4 py-3.5 active:opacity-70">
          <T v="strong" c="accent" className="flex-1">{tv.remarksLeft ? `Remarks · ${tv.remarksLeft} of ${tv.people.length} still to add` : 'Remarks · added for everyone'}</T>
          <Icon name="chevron-right" size={18} color={colors.accent.deep} />
        </Pressable>

        {alerts.length ? (
          <>
            <Section title="A personal note might help" right={<T v="small">{alerts.length}</T>} />
            {alerts.map((p) => (
              <Card key={p.id}>
                <Row><Avatar text={p.initials} /><View className="flex-1"><T v="strong">{p.first}</T><T v="meta">No practice logged in {p.alertDays} days</T></View></Row>
                <Btn sm wide v="out" label="Send a personal note" onPress={() => setSheet({ t: 'rec', pid: p.id, edit: true })} />
              </Card>
            ))}
          </>
        ) : null}

        {direct.length ? (
          <>
            <Section title="Needs a personal check-in" right={<T v="small">{direct.length}</T>} />
            {direct.map((p) => (
              <Card key={p.id}>
                <Row><Avatar text={p.initials} /><View className="flex-1"><T v="strong">{p.first}</T><T v="meta">{p.rec.channel === 'teacher_call' ? 'A phone call from you' : 'A hello in person'}</T></View><Btn sm v="tint" label={p.rec.actionLabel} onPress={() => setSheet({ t: 'rec', pid: p.id })} /></Row>
              </Card>
            ))}
          </>
        ) : null}
      </Body>
    </Screen>
  );
}
