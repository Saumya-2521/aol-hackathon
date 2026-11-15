// Web version of the guided-practice player: the same YouTube recording in an iframe.
import React from 'react';
import { View } from 'react-native';
import { colors } from '@/theme';
import { Icon, T } from './ui';

export function Player({ videoId, playing }: { videoId: string; playing: boolean; onEnded: () => void }) {
  return (
    <View className="overflow-hidden rounded-card bg-ink" style={{ aspectRatio: 16 / 9 }}>
      {playing
        ? React.createElement('iframe', { src: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`, title: 'Guided meditation', allow: 'autoplay; encrypted-media', allowFullScreen: true, style: { width: '100%', height: '100%', border: 0 } })
        : <View className="flex-1 items-center justify-center gap-2 px-6"><Icon name="play" size={32} color={colors.card} /><T v="small" c="white" className="text-center">The recording plays here from YouTube.</T></View>}
    </View>
  );
}
