// D3 Events (satsang): follow-ups, satsangs and community events near the participant. Events, not courses.
import { useState } from 'react';
import { View } from 'react-native';
import { EventCard } from '@/components/cards';
import { Body, Chip, Empty, Loading, Screen } from '@/components/ui';
import { useApp } from '@/lib/app';
import type { EventView } from '@/lib/types';

const FILTERS: [string, string, (e: EventView) => boolean][] = [
  ['all', 'All', () => true],
  ['follow', 'Follow-ups', (e) => e.cat === 'follow_up'],
  ['sats', 'Satsangs', (e) => e.cat === 'satsang'],
  ['comm', 'Community', (e) => e.cat === 'community_event' || e.cat === 'meditation_event'],
  ['online', 'Online', (e) => e.online],
];

export default function Events() {
  const { pv } = useApp();
  const [filter, setFilter] = useState('all');
  if (!pv) return <Loading />;
  const list = pv.events.filter(FILTERS.find((f) => f[0] === filter)![2]);
  return (
    <Screen title={`Events near ${pv.fsa}`}>
      <Body>
        <View className="flex-row flex-wrap gap-1.5">{FILTERS.map(([k, label]) => <Chip key={k} label={label} on={filter === k} onPress={() => setFilter(k)} />)}</View>
        {list.length ? list.map((e) => <EventCard key={e.key} event={e} />) : <Empty text="Nothing here just now. New gatherings appear as teachers add them." />}
      </Body>
    </Screen>
  );
}
