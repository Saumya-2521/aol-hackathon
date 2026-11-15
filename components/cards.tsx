// Cards a participant sees: events, seva and the week of practice.
import React from 'react';
import { View } from 'react-native';
import { useApp } from '@/lib/app';
import type { EventView, SevaView } from '@/lib/types';
import { colors } from '@/theme';
import { Btn, Card, Icon, ProgressBar, T } from './ui';

const TYPE: Record<string, string> = { follow_up: 'Follow-up', satsang: 'Satsang', community_event: 'Community', meditation_event: 'Meditation' };
export const whenText = (i: { day: string; time: string }) => i.day + (i.time ? ' · ' + i.time : '');
export const whereText = (i: { online: boolean; city: string; km: number | null }) => (i.online ? 'Online' : i.city + (i.km != null ? ` · ${i.km < 1 ? 'under 1' : Math.round(i.km)} km` : ''));

export function EventCard({ event }: { event: EventView }) {
  const { act, pid } = useApp();
  return (
    <Card>
      <T v="label" c="accent">{TYPE[event.cat] ?? 'Event'}{event.online ? ' · Online' : ''}</T>
      <T v="h3">{event.title}</T>
      {/* The time is shown only when the data has one. */}
      <T v="meta">{whenText(event)}{'\n'}{whereText(event)}</T>
      <View className="flex-row justify-end">
        <Btn sm v={event.going ? 'done' : 'pri'} icon={event.going ? 'check' : undefined} label={event.going ? 'Going' : 'I’m going'}
          onPress={() => act({ type: 'rsvp', pid, key: event.key }, event.going ? 'No problem. Your RSVP is removed.' : 'Lovely. Your teacher can see you’re going.')} />
      </View>
    </Card>
  );
}

export function SevaCard({ seva }: { seva: SevaView }) {
  const { act, pid } = useApp();
  return (
    <Card>
      <T v="h3">{seva.title}</T>
      {seva.desc ? <T v="meta">{seva.desc}</T> : null}
      <T v="meta">{whenText(seva)}{'\n'}{whereText(seva)}</T>
      <ProgressBar value={seva.count} max={seva.spots} />
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <T v="meta">{seva.count} of {seva.spots} signed up</T>
        {seva.done ? <T v="strong" c="green">Completed. Thank you 💛</T> : (
          <Btn sm v={seva.mine ? 'done' : 'pri'} icon={seva.mine ? 'check' : undefined} disabled={seva.full} label={seva.mine ? 'Signed up' : seva.full ? 'All spots filled' : 'Sign up'}
            onPress={() => act({ type: 'seva', pid, sevaId: seva.sevaId }, seva.mine ? 'No problem. You’re no longer signed up.' : 'Thank you. You’re signed up.')} />
        )}
      </View>
    </Card>
  );
}

// Monday to Sunday. A day not practised stays empty: no cross, no red.
export function WeekRow({ week, todayIndex }: { week: boolean[]; todayIndex: number }) {
  return (
    <Card>
      <View className="flex-row justify-between">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <View key={i} className="items-center gap-1" accessibilityLabel={`${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]}${week[i] ? ', practised' : ''}${i === todayIndex ? ', today' : ''}`}>
            <T v="small" c={i === todayIndex ? 'sun' : 'ink3'} className={i === todayIndex ? 'font-body-semibold text-[12px]' : 'text-[12px]'}>{d}</T>
            <View className={`h-[34px] w-[34px] items-center justify-center rounded-full border-[1.5px] ${week[i] ? 'bg-green-tint' : ''} ${i === todayIndex ? 'border-sun' : week[i] ? 'border-green-tint' : 'border-line'}`}>
              {week[i] ? <Icon name="check" size={16} color={colors.green.deep} /> : null}
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
