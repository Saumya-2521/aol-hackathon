import { Redirect } from 'expo-router';
import { Loading } from '@/components/ui';
import { useApp } from '@/lib/app';

// The demo opens as the participant (Priya). The first time, that is the sign-up screen; after that, Home.
// The role switcher is behind the round button, top right.
export default function Index() {
  const { signedUp } = useApp();
  if (!signedUp) return <Loading />;
  return <Redirect href={signedUp.p ? '/p' : '/sign-up'} />;
}
