// Chat bubbles and the composer, shared by the course channel and the teacher thread, for both roles.
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Msg } from '@/lib/types';
import { colors } from '@/theme';
import { Avatar, Icon, T } from './ui';

export function Bubbles({ msgs, empty, footnote }: { msgs: Msg[]; empty: string; footnote?: string }) {
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(() => { const t = setTimeout(() => ref.current?.scrollToEnd({ animated: false }), 50); return () => clearTimeout(t); }, [msgs.length]);
  return (
    <ScrollView ref={ref} className="flex-1" contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 8, gap: 10 }}>
      {msgs.length === 0 ? <T v="small" className="mt-8 text-center">{empty}</T> : null}
      {msgs.map((m) => (
        <View key={m.id} className={`max-w-[84%] border px-3.5 py-2.5 ${m.mine ? 'self-end rounded-[16px] rounded-br-[4px] border-accent-tint bg-accent-tint' : 'self-start rounded-[16px] rounded-bl-[4px] border-line bg-card'}`}>
          {m.mine ? null : <T v="small" c="ink2" className="font-body-semibold text-[12px]">{m.who}</T>}
          <T>{m.text}</T>
        </View>
      ))}
      {footnote ? <T v="small" className="mt-1 text-center">{footnote}</T> : null}
    </ScrollView>
  );
}

export function Composer({ placeholder, onSend, above }: { placeholder: string; onSend: (text: string) => Promise<boolean>; above?: React.ReactNode }) {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();
  const send = async () => { const t = text.trim(); if (t && (await onSend(t))) setText(''); };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="border-t border-line bg-card" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
        {above}
        <View className="flex-row items-center gap-2 px-3.5 pt-2.5">
          <TextInput value={text} onChangeText={setText} onSubmitEditing={send} placeholder={placeholder} accessibilityLabel={placeholder} placeholderTextColor={colors.ink[3]} returnKeyType="send"
            className="h-[42px] flex-1 rounded-full border border-line bg-card px-4 font-body text-[14.5px] text-ink" />
          <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={send} className="h-[42px] w-[42px] items-center justify-center rounded-full bg-brand active:opacity-70"><Icon name="send" size={17} color={colors.card} /></Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// A row in the chat list.
export function ChatRow({ avatar, title, sub, preview, unread, onPress }: { avatar: string; title: string; sub?: string; preview: string; unread?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="flex-row items-center gap-3 rounded-card border border-line bg-card px-4 py-3.5 active:opacity-70">
      <Avatar text={avatar} />
      <View className="flex-1">
        <T v="h3">{title}{sub ? <T v="small"> {sub}</T> : null}</T>
        <T v="meta" numberOfLines={1}>{preview}</T>
      </View>
      {unread ? <View accessibilityLabel="New message" className="h-[9px] w-[9px] rounded-full bg-sun" /> : <Icon name="chevron-right" size={18} color={colors.ink[3]} />}
    </Pressable>
  );
}

