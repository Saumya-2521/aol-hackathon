// One person on one row, used by People and by the Sadhana report: initials, name, practice line and the next-step button.
import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useApp } from '@/lib/app';
import type { PersonView } from '@/lib/types';
import { Avatar, Btn, T } from './ui';

export function PersonRow({ person, sub, last }: { person: PersonView; sub?: string; last?: boolean }) {
  const { setSheet } = useApp();
  const open = () => router.navigate(`/person/${person.id}`);
  const sent = !!person.rec.sentText;
  return (
    <View className={`flex-row items-center gap-3 py-3 ${last ? '' : 'border-b border-line'}`}>
      <Avatar text={person.initials} onPress={open} label={`Open the profile of ${person.first}`} />
      <Pressable accessibilityRole="button" onPress={open} className="flex-1 active:opacity-70">
        <T v="strong">{person.first} {person.last[0]}.</T>
        <T v="small" c="ink2" className="text-[13.5px]">{sub ?? `${person.days40} of 40 days · ${person.lastText}`}</T>
      </Pressable>
      {/* The label always names what the invitation is to, and comes from the engine's next step. */}
      <Btn sm v={sent ? 'done' : 'tint'} icon={sent ? 'check' : undefined} label={sent ? 'Sent' : person.rec.actionLabel} onPress={() => setSheet({ t: 'rec', pid: person.id })} />
    </View>
  );
}
