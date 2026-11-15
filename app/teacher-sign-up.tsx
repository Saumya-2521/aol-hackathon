// E0 Teacher sign-up. Demo scope: the screen works but creates no real account. Next stop: New course channel.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Body, Btn, Field, LinkBtn, Loading, Logo, Screen, T } from '@/components/ui';
import { useApp } from '@/lib/app';

export default function TeacherSignUp() {
  const { tv, toast, switchRole } = useApp();
  const [f, setF] = useState<Record<string, string>>({});
  if (!tv) return <Loading />;
  const v = (k: string, d: string) => f[k] ?? d;
  const set = (k: string) => (t: string) => setF((x) => ({ ...x, [k]: t }));
  return (
    <Screen title="Welcome" back>
      <Body>
        <View className="items-center gap-2.5 pt-1.5"><Logo height={54} /><T v="title" className="text-center">Set up your teacher account</T><T v="meta" className="text-center">Next, you’ll create a channel for your latest course.</T></View>
        <View className="flex-row gap-2.5"><Field half label="First name" value={v('first', tv.first)} onChangeText={set('first')} autoComplete="given-name" /><Field half label="Last name" value={v('last', tv.last)} onChangeText={set('last')} autoComplete="family-name" /></View>
        <Field label="Email" value={v('email', tv.email)} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Areas where you teach" value={v('areas', tv.areas.join(', '))} onChangeText={set('areas')} hint="Used to suggest places when you add events and seva." />
        <Btn wide label="Create my account" onPress={() => { toast(`Welcome, ${tv.first}. Your account is ready.`); router.replace('/new-channel'); }} />
        <View className="flex-row flex-wrap items-center justify-center gap-1.5"><T v="small">Taking a course, not teaching?</T><LinkBtn label="Sign up as a participant" onPress={() => { switchRole('p'); router.navigate('/sign-up'); }} /></View>
        <T v="small" className="text-center">Demo: this screen creates no real account.</T>
      </Body>
    </Screen>
  );
}
