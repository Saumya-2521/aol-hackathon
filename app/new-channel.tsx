// E1 New course channel: for a Part 1 course that has just finished. Creating it generates the join code.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { TagPicker } from '@/components/TagPicker';
import { Body, Btn, Card, Field, LinkBtn, Loading, Screen, Section, T } from '@/components/ui';
import { useApp } from '@/lib/app';

type Guest = { name: string; tags: string[]; note: string };
const blank = (): Guest => ({ name: '', tags: [], note: '' });

export default function NewChannel() {
  const { tv, tid, act, setSheet } = useApp();
  const [name, setName] = useState('Part 1 · Nov 2026');
  const [endedOn, setEndedOn] = useState('2026-11-08');
  const [guests, setGuests] = useState<Guest[]>([blank()]);
  const [busy, setBusy] = useState(false);
  if (!tv) return <Loading />;
  const edit = (i: number, patch: Partial<Guest>) => setGuests((g) => g.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const create = async () => {
    setBusy(true);
    const res = await act({ type: 'createChannel', teacherId: tid, name, endedOn, guests });
    setBusy(false);
    if (res.ok && res.code) {
      router.replace('/t/people');
      setSheet({ t: 'code', code: res.code, name, n: guests.filter((g) => g.name.trim()).length });
    }
  };
  return (
    <Screen title="New course channel" back>
      <Body>
        <T v="meta">For a Part 1 course that has just finished. Add the people who took it, and you’ll get a code they use to join.</T>
        <Card>
          <View className="flex-row gap-2.5"><Field half label="Course" value="Part 1" editable={false} /><Field half label="Ended on (YYYY-MM-DD)" value={endedOn} onChangeText={setEndedOn} /></View>
          <Field label="Channel name" value={name} onChangeText={setName} />
        </Card>

        <Section title="Participants" right={<T v="small">{guests.length}</T>} />
        {guests.map((g, i) => (
          <Card key={i}>
            <View className="flex-row items-center justify-between"><T v="label">Participant {i + 1}</T>{guests.length > 1 ? <LinkBtn label="Remove" onPress={() => setGuests((x) => x.filter((_, j) => j !== i))} /> : null}</View>
            <Field label="First name" value={g.name} onChangeText={(t) => edit(i, { name: t })} placeholder="First name" />
            <T v="label">Skills and interests</T>
            <TagPicker tags={g.tags} vocabulary={tv.tagVocabulary} onChange={(tags) => edit(i, { tags })} />
            <Field label="Note" value={g.note} onChangeText={(t) => edit(i, { note: t })} placeholder="e.g. Free on weekends" />
          </Card>
        ))}
        <Btn wide v="quiet" icon="plus" label="Add another participant" onPress={() => setGuests((g) => [...g, blank()])} />
        <T v="small">Interests and practical details only, no health or personal matters. A skill that isn’t in the list can be typed in. You can add remarks later too.</T>
        <Btn wide label="Create channel and get the code" disabled={busy} onPress={create} />
      </Body>
    </Screen>
  );
}
