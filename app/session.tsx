// D2 guided session: the team's chosen recording of Gurudev Sri Sri Ravi Shankar. When it ends, today is marked as done.
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { Player } from '@/components/Player';
import { Body, Btn, Card, LinkBtn, Loading, Screen, T, Tick } from '@/components/ui';
import { useApp } from '@/lib/app';

export default function Session() {
  const { pv, pid, act } = useApp();
  const [state, setState] = useState<'ready' | 'playing' | 'done'>('ready');
  const [elapsed, setElapsed] = useState(0);
  const finished = useRef(false);
  const demoSeconds = pv?.guided.demoSeconds ?? 15;

  const finish = useCallback(async () => {
    if (finished.current) return;
    finished.current = true;
    await act({ type: 'practice', pid });
    setState('done');
  }, [act, pid]);

  // ASSUMPTION (features.md D2): in the live demo a session finishes after config.guided_practice.demo_mode_seconds.
  useEffect(() => {
    if (state !== 'playing') return;
    const t = setInterval(() => setElapsed((e) => e + 0.25), 250);
    return () => clearInterval(t);
  }, [state]);
  useEffect(() => { if (state === 'playing' && elapsed >= demoSeconds) finish(); }, [elapsed, state, demoSeconds, finish]);

  if (!pv) return <Loading />;
  const back = () => router.navigate('/p/practice');
  return (
    <Screen title="Guided practice" back={back}>
      <Body>
        {state === 'done' ? (
          <Card className="items-center py-8">
            <Tick done size={60} />
            <T v="title">Done for today 🙏</T>
            <T v="meta">{pv.streak} {pv.streak === 1 ? 'day' : 'days'} in a row</T>
            <Btn label="Back to practice" onPress={back} />
          </Card>
        ) : (
          <>
            <Player videoId={pv.guided.youtubeId} playing={state === 'playing'} onEnded={finish} />
            <T v="h3">{pv.guided.title}</T>
            {state === 'ready' ? (
              <>
                <Btn wide icon="play" label="Begin" onPress={() => setState('playing')} />
                <T v="small" className="text-center">When the recording ends, today is marked as done for you.</T>
                <View className="items-center"><LinkBtn label="Open the recording on YouTube" onPress={() => Linking.openURL(pv.guided.url)} /></View>
              </>
            ) : (
              <Card>
                <T v="meta">Sit comfortably and follow along.</T>
                <View className="h-2 overflow-hidden rounded-full bg-mist"><View className="h-2 rounded-full bg-green" style={{ width: `${Math.min(100, (elapsed / demoSeconds) * 100)}%` }} /></View>
                <T v="small">Demo mode: the session finishes after {demoSeconds} seconds and marks today as done.</T>
              </Card>
            )}
          </>
        )}
      </Body>
    </Screen>
  );
}
