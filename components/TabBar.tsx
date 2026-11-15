// Bottom tabs for both roles: five tabs, always visible on the tab screens.
import { TabList, Tabs, TabSlot, TabTrigger, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';
import { Icon, T, type IconName } from './ui';

export type TabDef = { name: string; href: string; label: string; icon: IconName };

function TabButton({ icon, label, isFocused, ...props }: TabTriggerSlotProps & { icon: IconName; label: string }) {
  return (
    <Pressable {...(props as object)} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: !!isFocused }} style={{ flex: 1 }}>
      <View className="items-center gap-0.5 py-1.5">
        <View className={`rounded-full px-3.5 py-1 ${isFocused ? 'bg-accent-tint' : ''}`}><Icon name={icon} size={20} color={isFocused ? colors.brand.DEFAULT : colors.ink[3]} /></View>
        <T v="small" c={isFocused ? 'brand' : 'ink3'} className={`text-[11.5px] ${isFocused ? 'font-body-semibold' : ''}`}>{label}</T>
      </View>
    </Pressable>
  );
}

function Bar(props: TabListProps) {
  const insets = useSafeAreaInsets();
  return <View {...(props as object)} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 6, paddingTop: 6, paddingBottom: Math.max(insets.bottom, 10) }} />;
}

export function TabBar({ tabs }: { tabs: TabDef[] }) {
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <Bar>
          {tabs.map((t) => (
            <TabTrigger key={t.name} name={t.name} href={t.href as any} asChild>
              <TabButton icon={t.icon} label={t.label} />
            </TabTrigger>
          ))}
        </Bar>
      </TabList>
    </Tabs>
  );
}
