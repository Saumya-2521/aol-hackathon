// D5 Chat: the course channel and the personal thread with the teacher. First names only.
import { router } from 'expo-router';
import { ChatRow } from '@/components/Chat';
import { Body, Loading, Screen, T } from '@/components/ui';
import { useApp } from '@/lib/app';

export default function Chat() {
  const { pv } = useApp();
  if (!pv) return <Loading />;
  const lastChannel = pv.channel[pv.channel.length - 1];
  const lastThread = pv.thread[pv.thread.length - 1];
  return (
    <Screen title="Chat">
      <Body>
        <ChatRow avatar="#" title={pv.cohort.name} preview={lastChannel ? `${lastChannel.who.split(' ')[0]}: ${lastChannel.text}` : 'Your course group'} onPress={() => router.navigate('/chat/channel')} />
        <ChatRow avatar={pv.teacherFirst[0]} title={pv.teacherFirst} sub="(your teacher)" preview={lastThread ? lastThread.text : 'Personal notes appear here'} unread={pv.threadUnread} onPress={() => router.navigate('/chat/thread')} />
        <T v="small" className="text-center">First names only. Nobody’s phone number or email is shared.</T>
      </Body>
    </Screen>
  );
}
