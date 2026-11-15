// One person's next step for the teacher (features.md E4): stage, step, reason, draft, channel and the actions.
import React, { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { post } from '@/lib/api';
import { useApp } from '@/lib/app';
import { checkMessage } from '@/lib/filter';
import type { ActionResult, PersonView } from '@/lib/types';
import { colors } from '@/theme';
import { whenText, whereText } from './cards';
import { Avatar, Btn, Card, Icon, StagePill, T } from './ui';

export function RecommendationCard({ person, startEditing, inSheet }: { person: PersonView; startEditing?: boolean; inSheet?: boolean }) {
  const { tv, tid, act, setSheet } = useApp();
  const r = person.rec;
  const [text, setText] = useState(r.draft);
  const [edited, setEdited] = useState(false);
  const [editing, setEditing] = useState(!!startEditing);
  const [writing, setWriting] = useState(!!tv?.aiDrafts && !r.direct && !r.sentText);
  const [busy, setBusy] = useState(false);

  // Ask the draft writer (Claude API on the server) for a personal note; the template stays if there is no key or the call fails.
  useEffect(() => {
    if (!tv?.aiDrafts || r.direct || r.sentText || edited) return;
    let live = true;
    post<ActionResult>('/api/draft', { pid: person.id, teacherId: tid })
      .then((res) => { if (live && res.ok && res.draft && !edited) setText(res.draft); })
      .catch(() => {})
      .finally(() => { if (live) setWriting(false); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!tv) return null;
  const check = checkMessage(text, tv.bannedPhrases, tv.maxSentences);
  const item = r.item;
  const send = async () => {
    setBusy(true);
    await act({ type: 'send', teacherId: tid, pid: person.id, text }, `Sent to ${person.first}`);
    setBusy(false);
    setEditing(false);
  };
  const hide = (how: 'later' | 'skip') => { act({ type: 'hide', pid: person.id, how }, how === 'later' ? 'Snoozed for 7 days' : 'Skipped'); if (inSheet) setSheet(null); };

  return (
    <Card className={r.gapUntil && !r.sentText ? 'bg-ground' : ''}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Open the profile of ${person.first}`} onPress={() => { setSheet(null); router.navigate(`/person/${person.id}`); }} className="flex-row items-center gap-2.5 active:opacity-70">
        <Avatar text={person.initials} />
        <T v="h3" className="text-[16px]">{person.first}</T>
        <StagePill stage={r.stage} label={r.stageLabel} />
      </Pressable>

      <View>
        <T v="strong">{r.habit ? 'Practice habit + ' : ''}{item.title}</T>
        {item.kind === 'practice' ? null : <T v="meta" className="text-[13.5px]">{whereText(item)} · {whenText(item)}</T>}
      </View>

      {/* The reason is for the teacher only; it is never sent to the participant. */}
      <View className="border-l-[3px] border-accent-tint pl-2.5">
        <T v="meta">{r.reason.map((part, i) => (part.bold ? <T key={i} v="strong" c="accent" className="text-[14px]">{part.text}</T> : part.text))}</T>
      </View>

      {r.sentText ? (
        <>
          <View className="flex-row items-center gap-1.5"><Icon name="check" size={16} color={colors.green.deep} /><T v="strong" c="green">Sent today</T></View>
          <View className="rounded-input bg-ground px-3 py-2.5"><T v="meta" c="ink">{r.sentText}</T></View>
          {r.gapUntil ? <T v="small">Next outreach possible on {r.gapUntil}</T> : null}
        </>
      ) : r.direct ? (
        <>
          <View className="gap-1 rounded-input bg-ground px-3 py-2.5"><T v="small" className="font-body-semibold text-[12px]">An opening line, if it helps</T><T v="meta" c="ink">{text}</T></View>
          <T v="small">Reach {person.first} with {r.channelLabel}. Nothing is sent through the app.</T>
          {person.phone ? <T v="small" c="ink2">{person.phone}</T> : null}
          <View className="flex-row flex-wrap gap-2">
            <Btn sm v="quiet" label="Other step" onPress={() => setSheet({ t: 'other', pid: person.id, back: !!inSheet })} />
            <Btn sm v="quiet" label="Later" onPress={() => hide('later')} />
            <Btn sm v="quiet" label="Skip" onPress={() => hide('skip')} />
          </View>
        </>
      ) : (
        <>
          {editing ? (
            <TextInput multiline value={text} onChangeText={(t) => { setText(t); setEdited(true); }} accessibilityLabel="Message draft" placeholderTextColor={colors.ink[3]}
              className="min-h-[130px] rounded-input border border-line bg-card px-3 py-2.5 font-body text-[14.5px] leading-[21px] text-ink" style={{ textAlignVertical: 'top' }} />
          ) : (
            <Pressable onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel="Edit the draft" className="rounded-input bg-ground px-3 py-2.5">
              <T v="meta" c="ink" numberOfLines={inSheet ? undefined : 3}>{text}</T>
            </Pressable>
          )}
          {writing ? <T v="small">Writing a personal draft…</T> : null}
          {check.banned.length ? (
            <View className="rounded-input bg-clay-tint px-2.5 py-2"><T v="small" c="clay">Please reword: “{check.banned.join('”, “')}”. Messages stay free of pressure, price and missed days.</T></View>
          ) : check.sentences > tv.maxSentences ? (
            <View className="rounded-input bg-clay-tint px-2.5 py-2"><T v="small" c="clay">This is {check.sentences} sentences. Personal messages stay within {tv.maxSentences}.</T></View>
          ) : null}
          <T v="small">Reaches {person.first} as {r.channelLabel}{r.gapUntil ? ` · Next outreach possible on ${r.gapUntil}` : ''}</T>
          {person.hidden ? <T v="small" c="ink2">{person.hidden === 'later' ? 'Snoozed for 7 days.' : 'Skipped.'} Sending brings it back.</T> : null}
          <View className="flex-row flex-wrap gap-2">
            <Btn sm label="Send" disabled={busy || !!r.gapUntil || !check.ok} onPress={send} />
            <Btn sm v="out" label={editing ? 'Done editing' : 'Edit'} onPress={() => setEditing(!editing)} />
            <Btn sm v="quiet" label="Other step" onPress={() => setSheet({ t: 'other', pid: person.id, back: !!inSheet })} />
            <Btn sm v="quiet" label="Later" onPress={() => hide('later')} />
            <Btn sm v="quiet" label="Skip" onPress={() => hide('skip')} />
          </View>
        </>
      )}
    </Card>
  );
}

// The key makes the card start fresh when the step or the remarks change, so the draft updates at once.
export const recKey = (p: PersonView) => [p.id, p.rec.item.key, p.rec.stage, p.tags.join(','), p.rec.sentText ? 'sent' : ''].join('|');
