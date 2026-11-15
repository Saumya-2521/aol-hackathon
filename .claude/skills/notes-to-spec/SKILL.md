---
name: notes-to-spec
description: Turn a voice transcript, meeting notes or a brain-dump about the app into updates to the feature spec and design docs. Use when the user pastes or attaches a transcript or notes and asks to extract features, future enhancements or design changes, or says "update the spec/features from this".
---

# Notes to spec

Turn spoken or rough notes into changes to the project's design docs, without losing anything the speaker said and without adding anything they didn't.

## Steps

1. **Read the current state first:** `CLAUDE.md` (problem statement and working rules), `docs/features.md`, `docs/concept.md`, `docs/ui-draft.md`, `data/DATA_README.md` and `data/config.json`.

2. **Extract from the notes.** Transcripts ramble and self-correct ("the courses, not the courses, the events"), so take the corrected version. Sort every point into one of:
   - a feature for now, by surface (participant app, teacher view, engine, notifications, data);
   - a future enhancement (the speaker says "future", "later", "enhancement", or "we need to find a way");
   - a rule or threshold (numbers such as "3 days" or "35 out of 40");
   - example wording (notification or message text);
   - an open question (the speaker is unsure, or a detail needed to build it is missing).

3. **Do the alignment check** (working rule 1): in 1–2 lines, does the new material serve both success criteria? Say so plainly if it drifts.

4. **Check every point against the working rules and the existing spec.** Look for:
   - wording that mentions missed days, inactivity, price or urgency (rule 2);
   - anything that breaks the privacy rules or the outreach gap in rule 3;
   - practice data or contact details shown to someone who shouldn't see them;
   - thresholds that differ from `data/config.json` or would change `data/expected_outcomes.json`;
   - Art of Living terms or facts that aren't confirmed (rule 4: don't guess, mark it);
   - features earlier cut from scope.

   Don't silently drop or silently accept a conflicting point. Write the spec so it stays within the rules, and list the conflict under "Decision needed" with both options.

5. **Update the files:**
   - `docs/features.md`: features under the right section, each tagged [P] and/or [D]; future enhancements in their own table; decisions and assumptions in the open-decisions section; build order adjusted.
   - `docs/ui-draft.md`: add or change the sketch of every screen that changed.
   - `docs/concept.md`: decisions table, next steps, screens, demo script if the flow changed.
   - `data/config.json`: new thresholds only, each under a key with an `_ASSUMPTION` note. Never change an existing threshold without the team's decision.
   - `data/DATA_README.md`: data that will be needed but doesn't exist yet goes under "Planned additions".
   - `CLAUDE.md` and `README.md`: only if a rule, the stack or the reading list changed.

6. **Don't write app code** as part of this skill, and don't commit unless asked.

7. **Report back** briefly: what was added per surface, the future enhancements, the decisions needed (most important first), and the assumptions you made.

## Checks before finishing
- Every point in the notes appears in the spec, in future enhancements, or in open decisions.
- Nothing in the spec is new that the notes or earlier docs don't support, unless it's marked ASSUMPTION.
- No threshold appears as a bare number without its `config.json` key.
- Example message text passes the `aol-copy-check` skill.
