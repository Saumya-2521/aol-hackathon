---
name: aol-copy-check
description: Check participant-facing text (message drafts, notification wording, templates, button labels, empty states) against the Art of Living tone rules and the banned-phrase list. Use before adding or changing any text a participant will read, or when asked to review or write a message or notification.
---

# Art of Living copy check

Every text a participant reads must feel like a warm invitation that is easy to decline.

## Steps

1. Read the current rules: working rule 2 in `CLAUDE.md`, and `banned_phrases` and `message_rules` in `data/config.json`. Use those lists, not memory, because they change.

2. Check each text. It fails if it:
   - contains a banned phrase (case-insensitive), or a close variant with the same meaning;
   - mentions price, fees, discounts, missed days, a gap, a broken streak or inactivity, including soft forms such as "it's been a while", "we miss you" or "you haven't";
   - uses guilt, FOMO, urgency, scarcity or sales language;
   - has no easy way to decline, where it asks for something;
   - is longer than `message_rules.max_sentences` (teacher messages), or isn't signed with the teacher's first name (teacher messages);
   - shows practice numbers as anything but appreciation;
   - reveals a teacher's remark, the reason sentence, or another participant's details;
   - uses an Art of Living term or program name that isn't in `data/courses.json`, `data/config.json` or the docs. Don't guess: flag it for the team.

3. Match the tone to the stage (see "Tone by stage" in `docs/features.md`, C1). A returning person is welcomed with no mention of the gap. A drifting person gets a check-in with no ask.

4. For UI text, the same spirit applies: empty days are left blank rather than marked as missed, and counts are shown as encouragement.

## Output
For each text: **pass** or **fail**, the exact phrase that fails and the rule it breaks, and a rewrite that keeps the meaning. Example:

- "Hi Jack, it's been a few days, even a short practice today counts." → fail: "it's been a few days" mentions inactivity. Rewrite: "Hi Jack, even a short practice today counts. 🙏"

If the user wants wording the rules forbid, say which rule it breaks and that changing the rule is a team decision. Don't quietly change either the text or the rule.
