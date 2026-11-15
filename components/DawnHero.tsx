// The one bold moment in the app: a dawn sky on Home. The sun rises when today's practice is done.
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import { colors } from '@/theme';

export function DawnHero({ done, children }: { done: boolean; children: React.ReactNode }) {
  const [rise] = useState(() => new Animated.Value(done ? 1 : 0));
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) rise.setValue(done ? 1 : 0);
      else Animated.timing(rise, { toValue: done ? 1 : 0, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
    return () => { cancelled = true; };
  }, [done, rise]);
  return (
    <View className="overflow-hidden rounded-hero">
      <LinearGradient colors={colors.sky as [string, string, string]} locations={[0, 0.62, 1]} style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 }}>
        <Animated.View pointerEvents="none" style={{ position: 'absolute', right: -14, bottom: -78, width: 234, height: 234, alignItems: 'center', justifyContent: 'center', transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [42, -4] }) }] }}>
          <View style={{ position: 'absolute', width: 234, height: 234, borderRadius: 117, backgroundColor: colors.sun.DEFAULT, opacity: 0.08 }} />
          <View style={{ position: 'absolute', width: 186, height: 186, borderRadius: 93, backgroundColor: colors.sun.DEFAULT, opacity: 0.12 }} />
          <LinearGradient colors={[colors.sun.core, colors.sun.DEFAULT]} style={{ width: 150, height: 150, borderRadius: 75 }} />
        </Animated.View>
        <View pointerEvents="none" style={{ position: 'absolute', left: '-25%', bottom: -62, width: '95%', height: 100, borderRadius: 999, backgroundColor: colors.hill }} />
        <View pointerEvents="none" style={{ position: 'absolute', right: '-22%', bottom: -70, width: '80%', height: 100, borderRadius: 999, backgroundColor: colors.brand.soft }} />
        {children}
      </LinearGradient>
    </View>
  );
}
