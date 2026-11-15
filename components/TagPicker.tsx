// Skills and interests (features.md E1): pick from the suggestions or type any other skill.
import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { colors } from '@/theme';
import { Btn, Tag } from './ui';

export function TagPicker({ tags, vocabulary, onChange }: { tags: string[]; vocabulary: string[]; onChange: (tags: string[]) => void }) {
  const [text, setText] = useState('');
  const add = (raw: string) => {
    const t = raw.trim().toLowerCase().replace(/\s+/g, '_');
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setText('');
  };
  return (
    <View className="gap-2">
      {tags.length ? <View className="flex-row flex-wrap gap-1.5">{tags.map((t) => <Tag key={t} label={t} onRemove={() => onChange(tags.filter((x) => x !== t))} />)}</View> : null}
      <View className="flex-row flex-wrap gap-1.5">{vocabulary.filter((t) => !tags.includes(t)).slice(0, 10).map((t) => <Tag key={t} label={t} onAdd={() => add(t)} />)}</View>
      <View className="flex-row items-center gap-2">
        <TextInput value={text} onChangeText={setText} onSubmitEditing={() => add(text)} placeholder="Or type any other skill" accessibilityLabel="Type a skill" placeholderTextColor={colors.ink[3]} autoCapitalize="none" returnKeyType="done"
          className="h-[40px] flex-1 rounded-input border border-line bg-card px-3 font-body text-[14px] text-ink" />
        <Btn sm v="quiet" label="Add" onPress={() => add(text)} />
      </View>
    </View>
  );
}
