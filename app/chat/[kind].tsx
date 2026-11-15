// A chat conversation, for both roles: /chat/channel (course channel) or /chat/thread (teacher ↔ participant).
// The teacher passes ?c=<channel id> or ?p=<participant id>.
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Bubbles, Composer } from '@/components/Chat';
import { Btn, Loading, Screen } from '@/components/ui';
import { post } from '@/lib/api';
import { useApp } from '@/lib/app';

export default function Conversation() {
  const { kind, c, p } = useLocalSearchParams<{ kind: string; c?: string; p?: string }>();
  const { role, pv, tv, pid, tid, act, refresh } = useApp();
  const threadPid = role === 'p' ? pid : p;

  // Opening a thread marks it as read.
  useEffect(() => {
    if (kind === 'thread' && threadPid) post('/api/action', { type: 'readThread', pid: threadPid, side: role }).then(refresh).catch(() => {});
  }, [kind, threadPid, role, refresh]);

  if (role === 'p') {
    if (!pv) return <Loading />;
    if (kind === 'channel') {
      return (
        <Screen title={pv.cohort.name} back footer={<Composer placeholder="Ask a question…" onSend={async (text) => (await act({ type: 'sayChannel', cohortId: pv.cohort.id, senderId: pid, text })).ok} />}>
          <Bubbles msgs={pv.channel} empty="Ask anything about the course or your practice." footnote="First names only. Nobody’s phone number or email is shared here." />
        </Screen>
      );
    }
    const inv = pv.invitation;
    const answer = (text: string) => act({ type: 'answer', pid, text }, `Sent to ${pv.teacherFirst}`);
    return (
      <Screen title={`${pv.teacherFirst}, your teacher`} back
        footer={<Composer placeholder="Write a reply…" onSend={async (text) => (await act({ type: 'sayThread', pid, side: 'p', text })).ok}
          above={inv && !inv.answer ? <View className="flex-row gap-2 px-3.5 pt-2.5"><Btn sm label="Tell me more" onPress={() => answer('Tell me more')} /><Btn sm v="quiet" label="Not right now" onPress={() => answer('Not right now')} /></View> : undefined} />}>
        <Bubbles msgs={pv.thread} empty={`Personal notes from ${pv.teacherFirst} will appear here.`} />
      </Screen>
    );
  }

  if (!tv) return <Loading />;
  if (kind === 'channel') {
    const cohort = tv.cohorts.find((x) => x.id === c);
    if (!cohort) return <Loading />;
    return (
      <Screen title={cohort.name} back footer={<Composer placeholder="Answer or announce…" onSend={async (text) => (await act({ type: 'sayChannel', cohortId: cohort.id, senderId: tid, text })).ok} />}>
        <Bubbles msgs={cohort.channel} empty="No messages yet. A welcome is a lovely start." />
      </Screen>
    );
  }
  const person = tv.people.find((x) => x.id === p);
  if (!person) return <Loading />;
  return (
    <Screen title={person.first} back footer={<Composer placeholder="Write a personal note…" onSend={async (text) => (await act({ type: 'sayThread', pid: person.id, side: 't', teacherId: tid, text })).ok} />}>
      <Bubbles msgs={person.thread} empty={`Notes between you and ${person.first} will appear here.`} />
    </Screen>
  );
}
