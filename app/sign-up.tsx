// D0 Sign-up. Demo scope: the screen works but creates no real account; the role switcher picks the persona.
// Shown once per demo run: the app opens here until the participant has joined, then never sends them back.
import { router } from 'expo-router';
import { useState } from 'react';
import { Switch, View } from 'react-native';
import { Body, Btn, Card, Field, LinkBtn, Loading, Logo, Screen, T } from '@/components/ui';
import { useApp } from '@/lib/app';
import { colors } from '@/theme';

export default function SignUp() {
  const { pv, pid, act, switchRole, signedUp } = useApp();
  const [f, setF] = useState<Record<string, string>>({});
  const [location, setLocation] = useState(true);
  if (!pv) return <Loading />;
  const v = (k: string, d: string) => f[k] ?? d;
  const set = (k: string) => (t: string) => setF((x) => ({ ...x, [k]: t }));
  const join = async () => { await act({ type: 'join', pid }); router.replace('/p'); };
  return (
    <Screen title="Welcome" back={!!signedUp?.p}>
      <Body>
        <View className="items-center gap-2.5 pt-1.5"><Logo height={54} /><T v="title" className="text-center">Join your course group</T><T v="meta" className="text-center">A few details and you’re in.</T></View>
        <View className="flex-row gap-2.5"><Field half label="First name" value={v('first', pv.first)} onChangeText={set('first')} autoComplete="given-name" /><Field half label="Last name" value={v('last', pv.last)} onChangeText={set('last')} autoComplete="family-name" /></View>
        <Field label="Course code from your teacher" value={v('code', pv.cohort.joinCode)} onChangeText={set('code')} autoCapitalize="characters" />
        <Field label="Postal code" value={v('postal', pv.fsa)} onChangeText={set('postal')} autoCapitalize="characters" hint="Used only to show what’s happening near you." />
        <Card>
          <View className="flex-row items-center gap-3"><Switch value={location} onValueChange={setLocation} trackColor={{ true: colors.green.strong, false: colors.line }} thumbColor={colors.card} {...({ activeThumbColor: colors.card } as object)} accessibilityLabel="Use my area to show nearby events" /><T className="flex-1">Use my area to show nearby events</T></View>
        </Card>
        <Btn wide label="Join my course group" onPress={join} />
        <View className="flex-row flex-wrap items-center justify-center gap-1.5"><T v="small">Are you a teacher?</T><LinkBtn label="Sign up as a teacher" onPress={() => switchRole('t')} /></View>
        <T v="small" className="text-center">Demo: this screen creates no real account.</T>
      </Body>
    </Screen>
  );
}
