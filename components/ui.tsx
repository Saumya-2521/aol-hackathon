// Building blocks from docs/ui-design.md section 4. Screens are composed from these; colours come from theme.js.
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/app';
import type { Stage } from '@/lib/types';
import { colors } from '@/theme';

export type IconName = React.ComponentProps<typeof Feather>['name'];
export const Icon = ({ name, size = 20, color = colors.ink.DEFAULT }: { name: IconName; size?: number; color?: string }) => <Feather name={name} size={size} color={color} />;

/* ---------- text ---------- */
const VARIANT = {
  body: 'font-body text-[14.5px] leading-[21px]',
  strong: 'font-body-semibold text-[14.5px] leading-[21px]',
  meta: 'font-body text-[14px] leading-[20px]',
  small: 'font-body text-[13px] leading-[18px]',
  label: 'font-body-semibold text-[11.5px] leading-[16px] uppercase tracking-[1px]',
  h1: 'font-display text-[24px] leading-[30px]',
  title: 'font-display text-[22px] leading-[28px]',
  h3: 'font-display text-[16.5px] leading-[22px]',
  big: 'font-display text-[30px] leading-[36px]',
  num: 'font-display text-[46px] leading-[50px]',
} as const;
const COLOR = {
  ink: 'text-ink', ink2: 'text-ink-2', ink3: 'text-ink-3', brand: 'text-brand', accent: 'text-accent-deep',
  white: 'text-white', green: 'text-green-deep', sun: 'text-sun-deep', clay: 'text-clay',
} as const;
const DEFAULT_COLOR: Partial<Record<keyof typeof VARIANT, keyof typeof COLOR>> = { meta: 'ink2', small: 'ink3', label: 'ink3' };

export function T({ v = 'body', c, className = '', ...rest }: { v?: keyof typeof VARIANT; c?: keyof typeof COLOR; className?: string } & React.ComponentProps<typeof Text>) {
  return <Text className={`${VARIANT[v]} ${COLOR[c ?? DEFAULT_COLOR[v] ?? 'ink']} ${className}`} {...rest} />;
}

/* ---------- buttons, chips, tags ---------- */
const BTN = {
  pri: ['bg-brand', 'white', colors.card],
  out: ['bg-card border-[1.5px] border-accent', 'accent', colors.accent.deep],
  quiet: ['bg-mist', 'ink2', colors.ink[2]],
  tint: ['bg-accent-tint', 'accent', colors.accent.deep],
  done: ['bg-green-tint', 'green', colors.green.deep],
} as const;

export function Btn({ label, onPress, v = 'pri', sm, wide, disabled, icon }: { label: string; onPress?: () => void; v?: keyof typeof BTN; sm?: boolean; wide?: boolean; disabled?: boolean; icon?: IconName }) {
  const [bg, fg, hex] = BTN[v];
  return (
    <Pressable
      accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
      className={`flex-row items-center justify-center gap-1.5 active:opacity-70 ${sm ? 'min-h-[34px] rounded-[11px] px-3' : 'min-h-[44px] rounded-button px-[18px]'} ${wide ? 'self-stretch' : 'self-start'} ${disabled ? 'bg-mist' : bg}`}>
      {icon ? <Icon name={icon} size={sm ? 15 : 17} color={disabled ? colors.ink[3] : hex} /> : null}
      <T v="strong" c={disabled ? 'ink3' : fg} className={sm ? 'text-[13.5px]' : ''}>{label}</T>
    </Pressable>
  );
}

export const LinkBtn = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} className="active:opacity-60"><T v="strong" c="accent" className="text-[14px]">{label}</T></Pressable>
);

export const Chip = ({ label, on, onPress }: { label: string; on?: boolean; onPress: () => void }) => (
  <Pressable accessibilityRole="button" accessibilityState={{ selected: !!on }} onPress={onPress} className={`rounded-full border px-3 py-1.5 active:opacity-70 ${on ? 'border-ink bg-ink' : 'border-line bg-card'}`}>
    <T v={on ? 'strong' : 'body'} c={on ? 'white' : 'ink2'} className="text-[13.5px]">{label}</T>
  </Pressable>
);

export const Tag = ({ label, onRemove, onAdd }: { label: string; onRemove?: () => void; onAdd?: () => void }) => (
  <Pressable disabled={!onRemove && !onAdd} onPress={onRemove ?? onAdd} accessibilityRole={onRemove || onAdd ? 'button' : undefined} accessibilityLabel={onRemove ? `Remove ${label}` : onAdd ? `Add ${label}` : undefined}
    className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${onAdd ? 'border border-dashed border-green' : 'bg-green-tint'}`}>
    <T v="small" c="green" className="font-body-medium">{onAdd ? '+ ' : ''}{label}</T>
    {onRemove ? <Icon name="x" size={13} color={colors.green.deep} /> : null}
  </Pressable>
);

// Teacher view only. Drifting and Dormant are neutral, never red.
const PILL: Partial<Record<Stage, [string, 'accent' | 'ink2']>> = { ready_to_deepen: ['bg-accent-tint', 'accent'], drifting: ['bg-mist', 'ink2'], dormant: ['bg-mist', 'ink2'] };
export const StagePill = ({ stage, label }: { stage: Stage; label: string }) => {
  const [bg, fg] = PILL[stage] ?? ['bg-green-tint', 'green' as const];
  return <View className={`rounded-full px-2.5 py-0.5 ${bg}`}><T v="small" c={fg as any} className="font-body-semibold text-[11.5px]">{label}</T></View>;
};

/* ---------- layout ---------- */
export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <View className={`gap-2 rounded-card border border-line bg-card px-4 py-3.5 ${className}`}>{children}</View>
);
export const Row = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <View className={`flex-row items-center gap-3 ${className}`}>{children}</View>;
export const Section = ({ title, right }: { title: string; right?: React.ReactNode }) => (
  <View className="mt-1.5 flex-row items-baseline justify-between gap-2"><T v="h3" className="text-[16px]">{title}</T>{right}</View>
);
export const ProgressBar = ({ value, max }: { value: number; max: number }) => (
  <View className="h-2 overflow-hidden rounded-full bg-mist"><View className="h-2 rounded-full bg-green" style={{ width: `${max ? Math.min(100, (value / max) * 100) : 0}%` }} /></View>
);
export const Avatar = ({ text, onPress, label }: { text: string; onPress?: () => void; label?: string }) => (
  <Pressable disabled={!onPress} onPress={onPress} accessibilityLabel={label} className="h-[38px] w-[38px] items-center justify-center rounded-full bg-mist">
    <T v="h3" c="ink2" className={text.length > 1 ? 'text-[13px]' : 'text-[15px]'}>{text}</T>
  </Pressable>
);
export const Tick = ({ done, size = 36 }: { done: boolean; size?: number }) => (
  <View className={`items-center justify-center rounded-full ${done ? 'bg-green-tint' : 'bg-sun-tint'}`} style={{ width: size, height: size }}>
    <Icon name={done ? 'check' : 'sunrise'} size={size * 0.55} color={done ? colors.green.deep : colors.sun.DEFAULT} />
  </View>
);
export const Empty = ({ text }: { text: string }) => <T v="small" className="mt-6 text-center">{text}</T>;

// `half` is for two fields side by side in a row.
export function Field({ label, hint, half, ...input }: { label: string; hint?: string; half?: boolean } & TextInputProps) {
  return (
    <View className={half ? 'flex-1 gap-1.5' : 'gap-1.5'}>
      <T v="small" c="ink2" className="font-body-semibold">{label}</T>
      <TextInput accessibilityLabel={label} placeholderTextColor={colors.ink[3]} {...input}
        className={`rounded-input border border-line bg-card px-3 font-body text-[14.5px] text-ink ${input.multiline ? 'min-h-[110px] py-2.5' : 'h-[44px]'}`}
        style={input.multiline ? { textAlignVertical: 'top' } : undefined} />
      {hint ? <T v="small">{hint}</T> : null}
    </View>
  );
}

/* ---------- screen ---------- */
const LOGO = require('@/assets/brand/art-of-living-logo.png');
export const Logo = ({ height = 36 }: { height?: number }) => <Image source={LOGO} accessibilityLabel="The Art of Living" resizeMode="contain" style={{ height, width: (height * 134) / 57 }} />;

export function Screen({ title, back, logo, right, footer, children }: { title?: string; back?: boolean | (() => void); logo?: boolean; right?: React.ReactNode; footer?: React.ReactNode; children: React.ReactNode }) {
  const { role, pv, tv, setSheet } = useApp();
  const initial = (role === 'p' ? pv?.first : tv?.first)?.[0] ?? '·';
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-ground">
      <View className="flex-row items-center gap-2.5 px-[18px] pb-2.5 pt-3">
        {back ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={typeof back === 'function' ? back : () => (router.canGoBack() ? router.back() : router.replace(role === 'p' ? '/p' : '/t'))} className="h-9 w-9 items-center justify-center rounded-full bg-mist active:opacity-70">
            <Icon name="chevron-left" size={20} />
          </Pressable>
        ) : null}
        <View className="flex-1">{logo ? <Logo /> : <T v="title" numberOfLines={1}>{title}</T>}</View>
        {right}
        <Pressable accessibilityRole="button" accessibilityLabel="Switch role or reset the demo" onPress={() => setSheet({ t: 'demo' })} className="h-9 w-9 items-center justify-center rounded-full bg-accent-tint active:opacity-70">
          <T v="h3" c="accent" className="text-[14px]">{initial}</T>
        </Pressable>
      </View>
      {children}
      {footer}
    </SafeAreaView>
  );
}

export function Body({ children }: { children: React.ReactNode }) {
  return <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 4, paddingBottom: 24, gap: 14 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
}

// Shown while a role's data is loading, or when the server can't be reached.
export function Loading() {
  const { error, refresh } = useApp();
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-ground px-8">
      {error ? (<><T v="meta" className="text-center">{error}</T><Btn label="Try again" v="out" onPress={refresh} /></>) : <ActivityIndicator color={colors.brand.DEFAULT} />}
    </View>
  );
}

/* ---------- overlays ---------- */
export function SheetFrame({ title, onClose, children }: { title?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-end">
        <Pressable accessibilityLabel="Close" onPress={onClose} className="absolute inset-0 bg-ink/40" />
        <View className="max-h-[88%] w-full max-w-[480px] rounded-t-[24px] bg-ground pb-6">
          <View className="flex-row items-center justify-between gap-3 px-[18px] pb-1 pt-4">
            <T v="h3" className="flex-1 text-[19px] leading-[25px]">{title ?? ''}</T>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} className="h-8 w-8 items-center justify-center rounded-full bg-mist active:opacity-70"><Icon name="x" size={16} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 8, gap: 12 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function Toast() {
  const { toastText } = useApp();
  if (!toastText) return null;
  return (
    <View pointerEvents="none" className="absolute bottom-[92px] left-0 right-0 items-center px-6">
      <View className="rounded-full bg-ink px-4 py-2.5"><T v="small" c="white" className="text-center text-[13.5px]">{toastText}</T></View>
    </View>
  );
}

// `NoteCard` (ui-design.md section 4): a sun-tint card with a sun icon and warm text.
// Teacher's Today: the cheering note. Participant's Home: the latest notification, two lines at most, with a close button; tapping it opens the detail sheet.
export function NoteCard({ text, sub, onPress, onClose }: { text: string; sub?: string; onPress?: () => void; onClose?: () => void }) {
  return (
    <View className="flex-row gap-3 rounded-card bg-sun-tint p-4">
      <Icon name="sun" size={20} color={colors.sun.deep} />
      <Pressable disabled={!onPress} onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={onPress ? `Read this note in full: ${text}` : undefined} className="flex-1 gap-1.5 active:opacity-70">
        <T numberOfLines={onPress ? 2 : undefined}>{text}</T>
        {sub ? <T v="meta" className="italic">{sub}</T> : null}
      </Pressable>
      {onClose ? <Pressable accessibilityRole="button" accessibilityLabel="Close this note" onPress={onClose} hitSlop={10} className="self-start active:opacity-60"><Icon name="x" size={16} color={colors.sun.deep} /></Pressable> : null}
    </View>
  );
}
