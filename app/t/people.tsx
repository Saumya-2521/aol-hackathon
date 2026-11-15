// E3 People: one continuous list. "All" is selected by default and there are no channel headings.
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { PersonRow } from '@/components/PersonRow';
import { Avatar, Body, Btn, Chip, Empty, Loading, Screen, T } from '@/components/ui';
import { useApp } from '@/lib/app';
import { colors } from '@/theme';

export default function People() {
  const { tv } = useApp();
  const [chan, setChan] = useState('all');
  if (!tv) return <Loading />;
  const shown = tv.cohorts.filter((c) => chan === 'all' || c.id === chan);
  const one = chan !== 'all' ? shown[0] : null;
  const people = shown.flatMap((c) => c.memberIds.map((id) => tv.people.find((p) => p.id === id)!).filter(Boolean));
  const guests = shown.flatMap((c) => c.guests.map((g) => ({ ...g, code: c.joinCode })));
  const total = people.length + guests.length;
  return (
    <Screen title="People">
      <Body>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          <Chip label="All" on={chan === 'all'} onPress={() => setChan('all')} />
          {tv.cohorts.map((c) => <Chip key={c.id} label={c.name} on={chan === c.id} onPress={() => setChan(c.id)} />)}
        </ScrollView>
        {one ? <T v="small">Join code <T v="strong" className="text-[13px]">{one.joinCode}</T></T> : null}
        {total ? (
          <View className="rounded-card border border-line bg-card px-3.5">
            {people.map((p, i) => <PersonRow key={p.id} person={p} last={i === total - 1} />)}
            {guests.map((g, i) => (
              <View key={g.name + i} className={`flex-row items-center gap-3 py-3 ${people.length + i === total - 1 ? '' : 'border-b border-line'}`}>
                <Avatar text={g.name[0]} />
                <View className="flex-1"><T v="strong">{g.name}</T><T v="small" c="ink2" className="text-[13.5px]">Joins with code {g.code}</T></View>
                <View className="rounded-full bg-green-tint px-2.5 py-0.5"><T v="small" c="green" className="font-body-semibold text-[11.5px]">New</T></View>
              </View>
            ))}
          </View>
        ) : <Empty text="Nobody here yet." />}
        <View className="h-12" />{/* room so the floating button never covers the last row */}
      </Body>
      {/* Floating "+ Channel", bottom right, above the tab bar (ui-design.md E3). */}
      <View className="absolute bottom-4 right-[18px] rounded-button" style={{ shadowColor: colors.brand.DEFAULT, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}>
        <Btn icon="plus" label="Channel" onPress={() => router.navigate('/new-channel')} />
      </View>
    </Screen>
  );
}
