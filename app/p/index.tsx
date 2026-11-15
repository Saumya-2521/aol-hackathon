// D1 Home: streak, today's practice, the teacher's invitation, next follow-up, seva nearby, milestones.
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { DawnHero } from '@/components/DawnHero';
import { EventCard, whenText, whereText } from '@/components/cards';
import { Body, Btn, Card, Icon, LinkBtn, Loading, Row, Screen, Section, T, Tick } from '@/components/ui';
import { useApp } from '@/lib/app';
import { colors } from '@/theme';

export default function Home() {
  const { pv, pid, act } = useApp();
  if (!pv) return <Loading />;
  const inv = pv.invitation;
  const seva = pv.seva.filter((s) => !s.full && !s.done).slice(0, 2);
  const answer = (text: string) => act({ type: 'answer', pid, text }, `Sent to ${inv?.from}`);
  return (
    <Screen logo>
      <Body>
        <DawnHero done={pv.doneToday}>
          <T v="label">{pv.dateLabel}</T>
          <T v="h1" className="mb-3 mt-0.5">Good morning, {pv.first}</T>
          {/* Encouraging only: a streak of zero shows a greeting, never a number. */}
          {pv.streak > 0 ? (
            <View className="flex-row items-baseline gap-1.5"><T v="num" c="brand">{pv.streak}</T><T c="ink2">{pv.streak === 1 ? 'day' : 'days'} in a row</T></View>
          ) : (
            <T v="h3" c="brand" className="text-[19px] leading-[25px]">A fresh morning.{'\n'}Begin whenever you’re ready.</T>
          )}
          {pv.days40 > 0 ? <T v="small" c="ink2" className="mt-1 text-[13.5px]">{pv.days40} practice days in the last 40</T> : null}
        </DawnHero>

        <Card>
          <Row>
            <Tick done={pv.doneToday} />
            <View className="flex-1"><T v="h3">Today’s sadhana</T><T v="meta">{pv.doneToday ? 'Done for today 🙏' : 'Ready when you are'}</T></View>
            {pv.doneToday ? null : <Btn sm label="Start" onPress={() => router.navigate('/p/practice')} />}
          </Row>
        </Card>

        {inv ? (
          <Card className="border-accent-tint bg-accent-wash">
            <View className="flex-row items-center gap-1.5"><Icon name="mail" size={14} color={colors.ink[3]} /><T v="label">From {inv.from}</T></View>
            {inv.item ? (<><T v="h3">{inv.item.title}</T><T v="meta">{whenText(inv.item)} · {whereText(inv.item)}</T></>) : null}
            <T>{inv.text}</T>
            {inv.answer ? (
              <T v="small">You replied: “{inv.answer}”. Thank you for letting {inv.from} know.</T>
            ) : (
              <View className="flex-row flex-wrap gap-2"><Btn sm label="Tell me more" onPress={() => answer('Tell me more')} /><Btn sm v="quiet" label="Not right now" onPress={() => answer('Not right now')} /></View>
            )}
          </Card>
        ) : null}

        {pv.nextFollowUp ? (<><Section title="Next follow-up" /><EventCard event={pv.nextFollowUp} /></>) : null}

        {seva.length ? (
          <>
            <Section title="Seva near you" right={<LinkBtn label="See all" onPress={() => router.navigate('/p/volunteer')} />} />
            <View className="flex-row gap-2.5">
              {seva.map((s) => (
                <Pressable key={s.key} accessibilityRole="button" onPress={() => router.navigate('/p/volunteer')} className="flex-1 gap-0.5 rounded-card border border-line bg-card p-3 active:opacity-70">
                  <T v="strong" className="text-[14px] leading-[18px]" numberOfLines={3}>{s.title}</T>
                  <T v="small" c="ink2">{s.day}</T>
                  <T v="small">{whereText(s)}</T>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <Card>
          <View className="flex-row items-center justify-between"><T v="h3">Milestones</T><T v="small">Only you see these</T></View>
          <View className="flex-row gap-5">
            {pv.milestones.map((m) => (
              <View key={m.days} className="flex-row items-center gap-1.5">
                <View className={`h-[26px] w-[26px] items-center justify-center rounded-full ${m.reached ? 'bg-green-tint' : 'border-[1.5px] border-dashed border-line'}`}>{m.reached ? <Icon name="check" size={15} color={colors.green.deep} /> : null}</View>
                <T v={m.reached ? 'strong' : 'body'} c={m.reached ? 'green' : 'ink3'} className="text-[13.5px]">{m.days} days</T>
              </View>
            ))}
          </View>
        </Card>
      </Body>
    </Screen>
  );
}
