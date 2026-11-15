// E7 Chat: the teacher's course channels and personal threads.
import { router } from 'expo-router';
import { ChatRow } from '@/components/Chat';
import { Body, Loading, Screen, Section, T } from '@/components/ui';
import { useApp } from '@/lib/app';

export default function Chat() {
  const { tv } = useApp();
  if (!tv) return <Loading />;
  const threads = tv.people.filter((p) => p.thread.length);
  return (
    <Screen title="Chat">
      <Body>
        <Section title="Course channels" />
        {tv.cohorts.map((c) => {
          const last = c.channel[c.channel.length - 1];
          return <ChatRow key={c.id} avatar="#" title={c.name} preview={last ? `${last.who.split(' ')[0]}: ${last.text}` : 'No messages yet'} onPress={() => router.navigate(`/chat/channel?c=${c.id}`)} />;
        })}
        <Section title="Personal threads" />
        {threads.length ? threads.map((p) => (
          <ChatRow key={p.id} avatar={p.initials} title={p.first} preview={p.thread[p.thread.length - 1].text} unread={p.threadUnread} onPress={() => router.navigate(`/chat/thread?p=${p.id}`)} />
        )) : <T v="small">Threads appear once you send someone a note.</T>}
      </Body>
    </Screen>
  );
}
