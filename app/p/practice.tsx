// D2 Daily Practice: start the guided meditation, or mark today in one tap; this week; the course group today (tap to see who has practised).
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { WeekRow } from '@/components/cards';
import { Body, Btn, Card, Icon, Loading, ProgressBar, Row, Screen, Section, T, Tick } from '@/components/ui';
import { useApp } from '@/lib/app';
import { colors } from '@/theme';

export default function Practice() {
  const { pv, pid, act, setSheet } = useApp();
  if (!pv) return <Loading />;
  return (
    <Screen title="Daily practice">
      <Body>
        <Pressable accessibilityRole="button" onPress={() => router.navigate('/session')} className="flex-row items-center gap-4 rounded-hero bg-brand px-5 py-[22px] active:opacity-80">
          <View className="h-[54px] w-[54px] items-center justify-center rounded-full bg-card"><Icon name="play" size={24} color={colors.brand.DEFAULT} /></View>
          <View className="flex-1"><T v="h3" c="white" className="text-[19px] leading-[24px]">Start guided meditation</T><T v="small" c="white" className="text-[13.5px]">with Gurudev Sri Sri Ravi Shankar</T></View>
        </Pressable>

        {pv.doneToday ? (
          <Card><Row><Tick done /><View className="flex-1"><T v="h3">Done for today 🙏</T><T v="meta">{pv.streak} {pv.streak === 1 ? 'day' : 'days'} in a row</T></View></Row></Card>
        ) : (
          <Btn wide v="out" icon="check" label="I practised on my own" onPress={() => act({ type: 'practice', pid }, 'Done for today 🙏')} />
        )}

        <Section title="This week" />
        <WeekRow week={pv.week} todayIndex={pv.todayIndex} />

        <Section title="Your course group today" />
        {/* Tapping shows the first names of those who have practised today. It never lists who hasn't. */}
        <Pressable accessibilityRole="button" accessibilityLabel={`${pv.cohort.practised} of ${pv.cohort.size} from your course practised today. See who has practised.`} onPress={() => setSheet({ t: 'group' })}
          className="gap-3 rounded-card border border-line bg-card px-4 py-5 active:opacity-70">
          <View className="flex-row items-baseline gap-2"><T v="big" c="brand">{pv.cohort.practised} of {pv.cohort.size}</T><T c="ink2" className="flex-1">from your course practised today</T></View>
          <ProgressBar value={pv.cohort.practised} max={pv.cohort.size} />
          <View className="flex-row items-center justify-between"><T v="strong" c="accent" className="text-[14px]">See who has practised</T><Icon name="chevron-right" size={18} color={colors.accent.deep} /></View>
        </Pressable>
      </Body>
    </Screen>
  );
}
