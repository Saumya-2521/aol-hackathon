import { Redirect } from 'expo-router';

// The demo opens as the participant (Priya); the role switcher is behind the round button, top right.
export default function Index() {
  return <Redirect href="/p" />;
}
