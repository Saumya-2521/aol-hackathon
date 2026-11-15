// E3 Participant profile: contact (assigned teacher only), sadhana, next step, remarks, timeline.
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { RecommendationCard, recKey } from '@/components/RecommendationCard';
import { TagPicker } from '@/components/TagPicker';
import { Body, Card, Loading, Screen, Section, StagePill, T } from '@/components/ui';
import { useApp } from '@/lib/app';
import { colors } from '@/theme';

export default function Profile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tv, act } = useApp();
  const person = tv?.people.find((p) => p.id === id);
  const [note, setNote] = useState<string | null>(null);
  if (!tv || !person) return <Loading />;
  return (
    <Screen title={`${person.first} ${person.last}`} back>
      <Body>
        <Card>
          <View className="flex-row flex-wrap items-center justify-between gap-2"><StagePill stage={person.rec.stage} label={person.rec.stageLabel} /><T v="small">{person.area} · {person.cohortName}</T></View>
          <T v="meta" selectable>{person.email}{'\n'}{person.phone}</T>
          <T v="small">Contact details are visible only to you, as the assigned teacher.</T>
        </Card>

        <Section title="Sadhana" />
        <Card>
          <T><T v="strong">{person.days40} of the last 40 days</T>{person.streak ? ` · ${person.streak} in a row` : ''}</T>
          <View className="gap-[3px]" accessibilityLabel={`Practised on ${person.days40} of the last 40 days`}>
            {[0, 20].map((start) => (
              <View key={start} className="flex-row gap-[3px]">
                {person.heat.slice(start, start + 20).map((on, i) => <View key={i} className={`h-[13px] flex-1 rounded-[4px] ${on ? 'bg-green' : 'bg-mist'} ${start + i === 39 ? 'border-[1.5px] border-sun' : ''}`} />)}
              </View>
            ))}
          </View>
          <T v="small">Oldest first, today outlined.</T>
        </Card>

        <Section title="Next step" />
        <RecommendationCard key={recKey(person)} person={person} />

        <Section title="Remarks" />
        <Card>
          <T v="label">Skills and interests</T>
          {/* Adding or removing a tag recomputes the next step at once. */}
          <TagPicker tags={person.tags} vocabulary={tv.tagVocabulary} onChange={(tags) => act({ type: 'setTags', pid: person.id, tags })} />
          <T v="small" c="ink2" className="mt-1.5 font-body-semibold">Note</T>
          <TextInput multiline value={note ?? person.note} onChangeText={setNote} onBlur={() => { if (note != null && note !== person.note) act({ type: 'setNote', pid: person.id, text: note }, 'Note saved'); }}
            placeholder="e.g. Free on weekends" accessibilityLabel="Note" placeholderTextColor={colors.ink[3]}
            className="min-h-[72px] rounded-input border border-line bg-card px-3 py-2.5 font-body text-[14.5px] text-ink" style={{ textAlignVertical: 'top' }} />
          <T v="small">Interests and practical details only, no health or personal matters. Remarks are never shown to {person.first}.</T>
        </Card>

        <Section title="Timeline" />
        <Card>
          {person.timeline.map((x, i) => (
            <View key={i} className="flex-row gap-2.5"><T v="meta" c="ink3" className="w-[56px]">{x.date}</T><T v="meta" c="ink" className="flex-1">{x.text}</T></View>
          ))}
        </Card>
      </Body>
    </Screen>
  );
}
