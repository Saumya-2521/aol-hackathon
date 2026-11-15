import { describe, expect, test } from '@jest/globals';
import expected from '../data/expected_outcomes.json';
import { TODAY } from '../lib/clock';
import { actionLabel, channelFor, daysInWindow, gapUntil, nextStep, stageOf } from '../lib/engine';
import { checkMessage } from '../lib/filter';
import { config, person, resetStore } from '../lib/store';
import { templateDraft } from '../lib/drafter';

const P = (id: string) => person(resetStore(), id)!;

describe('journey stage and channel for all 18 personas', () => {
  for (const o of expected.outcomes) {
    test(`${o.id} ${o.name}: ${o.stage} via ${o.channel}`, () => {
      const s = resetStore();
      const p = person(s, o.id)!;
      const stage = stageOf(s, p);
      expect(stage).toBe(o.stage);
      expect(channelFor(s, p, stage)).toBe(o.channel);
      if ('practice_40' in o) expect(daysInWindow(s, p.id, 40)).toBe((o as any).practice_40);
    });
  }
});

describe('next steps (demo checkpoints, features.md G)', () => {
  test('Priya: logging today makes her ready to deepen, and Sahaj Samadhi in Brampton East is suggested', () => {
    const s = resetStore();
    const p = person(s, 'P01')!;
    expect(nextStep(s, p).item.cat).toBe('follow_up');
    s.logs.P01.push(TODAY);
    const step = nextStep(s, p);
    expect(step.stage).toBe('ready_to_deepen');
    expect(step.item.title).toMatch(/Sahaj Samadhi/);
    expect(step.item.city).toBe('Brampton East');
    expect(step.channel).toBe('in_app_message');
    s.tags.P01.push('meditation');
    expect(nextStep(s, p).reason.some((r) => r.bold && r.text === 'meditation')).toBe(true);
  });
  test('Tom: Sahaj, and the tag silence_retreat switches it to Part 2', () => {
    const s = resetStore();
    const p = person(s, 'P12')!;
    expect(nextStep(s, p).item.cat).toBe('sahaj');
    s.tags.P12.push('silence_retreat');
    expect(nextStep(s, p).item.cat).toBe('part2');
  });
  test('Neha: Part 2 in person in Brampton East', () => {
    const s = resetStore();
    const i = nextStep(s, person(s, 'P11')!).item;
    expect([i.cat, i.online, i.city]).toEqual(['part2', false, 'Brampton East']);
  });
  test('Rahul: a weekend follow-up; Omar: an online one', () => {
    const s = resetStore();
    const r = nextStep(s, person(s, 'P02')!).item;
    expect(['Sat', 'Sun']).toContain(r.day.slice(0, 3));
    expect(nextStep(s, person(s, 'P18')!).item.online).toBe(true);
  });
  test('Meera: kitchen seva; Carlos: music for satsang', () => {
    const s = resetStore();
    expect(nextStep(s, person(s, 'P13')!).item.key).toBe('s:S3');
    expect(nextStep(s, person(s, 'P14')!).item.key).toBe('s:S4');
  });
  test('Daniel: call; Mei: in person', () => {
    const s = resetStore();
    expect(actionLabel(nextStep(s, person(s, 'P03')!))).toBe('Call');
    expect(actionLabel(nextStep(s, person(s, 'P04')!))).toBe('Say hello');
  });
  test('Arjun: the 3-day outreach gap is active until Nov 15', () => {
    expect(gapUntil(resetStore(), 'P08')).toBe('2026-11-15');
  });
  test('a teacher can choose a different step', () => {
    const s = resetStore();
    s.steps.P01 = 's:S3';
    const step = nextStep(s, P('P01'));
    expect(step.item.key).toBe('s:S3');
  });
});

describe('fallback drafts follow the message rules', () => {
  for (const o of expected.outcomes) {
    test(`${o.name}`, () => {
      const s = resetStore();
      const p = person(s, o.id)!;
      const text = templateDraft(s, p, nextStep(s, p));
      const c = checkMessage(text, config.banned_phrases, config.message_rules.max_sentences);
      expect(c).toEqual({ ok: true, banned: [], sentences: c.sentences });
      expect(text).toContain(p.first_name);
    });
  }
});

describe('banned-phrase filter', () => {
  const b = config.banned_phrases;
  test('whole words only', () => {
    expect(checkMessage('I feel this would be ideal for you.', b, 4).ok).toBe(true);
    expect(checkMessage('There is a small fee.', b, 4).banned).toEqual(['fee']);
    expect(checkMessage('Hurry, only a few spots left!', b, 4).banned.sort()).toEqual(['hurry', 'only a few spots']);
  });
  test('curly apostrophes and case', () => {
    expect(checkMessage('We Miss You, and you haven’t come by.', b, 4).banned.sort()).toEqual(['we miss you', "you haven't"]);
  });
  test('at most 4 sentences, not counting the signature', () => {
    expect(checkMessage('One. Two. Three. Four. - Anita', b, 4).ok).toBe(true);
    expect(checkMessage('One. Two. Three. Four. Five. - Anita', b, 4).ok).toBe(false);
  });
});
