// E5 Sadhana report: four groups by practice days in the last 40; tap a group to see its people and their next step.
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { PersonRow } from '@/components/PersonRow';
import { Body, Chip, Empty, LinkBtn, Loading, Screen, T } from '@/components/ui';
import { useApp, type Tile } from '@/lib/app';
import type { PersonView } from '@/lib/types';

const TILES: { key: Tile; title: string; sub: string; bg: string }[] = [
  { key: 'reg', title: 'Very regular', sub: '35–40 days · suggest the next course', bg: 'bg-brand-tint' },
  { key: 'build', title: 'Building the habit', sub: '20–34 days · encourage', bg: 'bg-accent-tint' },
  { key: 'support', title: 'Needs support', sub: 'Below 20 days · check in', bg: 'bg-sun-tint' },
  { key: 'app', title: 'App not opened', sub: '5+ days · reach out', bg: 'bg-mist' },
];
const inTile = (p: PersonView, t: Tile) => (t === 'app' ? p.notOpened : p.bucket === t);

export default function Reports() {
  const { tv, report, setReport } = useApp();
  if (!tv) return <Loading />;
  const cohorts = tv.cohorts.filter((c) => c.size > 0);
  const cohort = cohorts.find((c) => c.id === report.cohort) ?? cohorts[0];
  if (!cohort) return <Screen title="Sadhana report"><Body><Empty text="Create a course channel to see its report here." /></Body></Screen>;
  const members = cohort.memberIds.map((id) => tv.people.find((p) => p.id === id)!).filter(Boolean);
  const list = members.filter((p) => inTile(p, report.tile));
  const current = TILES.find((t) => t.key === report.tile)!;
  return (
    <Screen title="Sadhana report">
      <Body>
        <View className="gap-1.5">
          <T v="small" c="ink2" className="font-body-semibold">Group</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {cohorts.map((c) => <Chip key={c.id} label={`${c.name} · ${c.size} ${c.size === 1 ? 'participant' : 'participants'}`} on={c.id === cohort.id} onPress={() => setReport({ cohort: c.id, tile: report.tile })} />)}
          </ScrollView>
        </View>
        <View className="flex-row flex-wrap gap-2.5">
          {TILES.map((t) => (
            <Pressable key={t.key} accessibilityRole="button" accessibilityState={{ selected: t.key === report.tile }} onPress={() => setReport({ cohort: cohort.id, tile: t.key })}
              className={`min-w-[46%] flex-1 gap-0.5 rounded-card border-2 px-3.5 py-3 active:opacity-80 ${t.bg} ${t.key === report.tile ? 'border-brand' : 'border-transparent'}`}>
              <T v="big">{members.filter((p) => inTile(p, t.key)).length}</T>
              <T v="strong">{t.title}</T>
              <T v="small" c="ink2" className="text-[12.5px]">{t.sub}</T>
            </Pressable>
          ))}
        </View>
        <View className="flex-row items-center justify-between"><T v="h3" className="text-[16px]">{current.title}</T><LinkBtn label="Add remarks" onPress={() => router.navigate('/t/people')} /></View>
        {list.length ? (
          <View className="rounded-card border border-line bg-card px-3.5">
            {list.map((p, i) => <PersonRow key={p.id} person={p} sub={report.tile === 'app' ? p.appOpenedText : undefined} last={i === list.length - 1} />)}
          </View>
        ) : <Empty text="Nobody in this group right now." />}
        <T v="small">Someone can be in “App not opened” and one other group.</T>
      </Body>
    </Screen>
  );
}
