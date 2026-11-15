// E5 Sadhana report: picking a course lists everyone in it; the four groups (by practice days in the last 40) narrow the list.
// Tapping the selected group again shows everyone.
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
const inTile = (p: PersonView, t: Tile) => (t === 'all' ? true : t === 'app' ? p.notOpened : p.bucket === t);

export default function Reports() {
  const { tv, report, setReport } = useApp();
  if (!tv) return <Loading />;
  const cohorts = tv.cohorts.filter((c) => c.size > 0);
  const cohort = cohorts.find((c) => c.id === report.cohort) ?? cohorts[0];
  if (!cohort) return <Screen title="Sadhana report"><Body><Empty text="Create a course channel to see its report here." /></Body></Screen>;
  const members = cohort.memberIds.map((id) => tv.people.find((p) => p.id === id)!).filter(Boolean);
  const list = members.filter((p) => inTile(p, report.tile));
  const current = TILES.find((t) => t.key === report.tile);
  return (
    <Screen title="Sadhana report">
      <Body>
        <View className="gap-1.5">
          <T v="small" c="ink2" className="font-body-semibold">Group</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {cohorts.map((c) => <Chip key={c.id} label={`${c.name} · ${c.size} ${c.size === 1 ? 'participant' : 'participants'}`} on={c.id === cohort.id} onPress={() => setReport({ cohort: c.id, tile: 'all' })} />)}
          </ScrollView>
        </View>
        <View className="flex-row flex-wrap gap-2.5">
          {TILES.map((t) => (
            <Pressable key={t.key} accessibilityRole="button" accessibilityState={{ selected: t.key === report.tile }} onPress={() => setReport({ cohort: cohort.id, tile: t.key === report.tile ? 'all' : t.key })}
              className={`min-w-[46%] flex-1 gap-0.5 rounded-card border-2 px-3.5 py-3 active:opacity-80 ${t.bg} ${t.key === report.tile ? 'border-brand' : 'border-transparent'}`}>
              <T v="big">{members.filter((p) => inTile(p, t.key)).length}</T>
              <T v="strong">{t.title}</T>
              <T v="small" c="ink2" className="text-[12.5px]">{t.sub}</T>
            </Pressable>
          ))}
        </View>
        <View className="flex-row items-center justify-between gap-3"><T v="h3" className="flex-1 text-[16px]">{current ? current.title : `Everyone in ${cohort.name}`}</T>{current ? <LinkBtn label="Show everyone" onPress={() => setReport({ cohort: cohort.id, tile: 'all' })} /> : null}<LinkBtn label="Add remarks" onPress={() => router.navigate('/t/people')} /></View>
        {list.length ? (
          <View className="rounded-card border border-line bg-card px-3.5">
            {list.map((p, i) => <PersonRow key={p.id} person={p} sub={report.tile === 'app' ? p.appOpenedText : undefined} last={i === list.length - 1} />)}
          </View>
        ) : <Empty text="Nobody in this group right now." />}
        <T v="small">Tap a group to see only its people; tap it again to see everyone. Someone can be in “App not opened” and one other group.</T>
      </Body>
    </Screen>
  );
}
