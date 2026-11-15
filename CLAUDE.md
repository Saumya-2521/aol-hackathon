# Art of Living follow-up app (hackathon MVP)

## Problem statement (verbatim, the source of truth)
"Help more people stay connected to the wisdom. People experience SKY and its transformation, stay connected for a while, and then get caught up in life and quietly drift away. Part of the reason is that our follow-up treats everyone as one group. The same message goes to everyone, regardless of where they are in their journey.
Build: A system that maps each participant's journey from their history (courses taken, events attended, last contact, engagement signals) and, for each person, predicts a fitting next step: a follow-on course, a retreat, a seva role, or re-engagement if they've gone quiet. For each prediction it drafts a personalized message and suggests a channel. Built and demoed on the sample participant data provided.
Success: follow-up feels personal rather than broadcast, and fewer people drift away after their first course."

## Read these first
- `docs/features.md`: the feature spec, open decisions, future enhancements and build order. Build only what is listed there.
- `docs/ui-design.md`: the UI design in the Art of Living brand colours: tokens, components and every screen. Build screens from it. Mobile only. A clickable preview is in `docs/ui-preview.html`.
- `docs/ui-draft.md`: the first screen sketches, replaced by `ui-design.md` for visual design.
- `docs/concept.md`: the agreed design (journey stages, next-step rules, messages, channels, screens, demo script). Follow it.
- `data/DATA_README.md`: the data files, the personas and the date and time rules.
- `docs/brief.md` and `docs/team-ideas.pdf`: the team's original brief and notes, for background.

## Working rules
1. **Alignment check:** before designing or building any feature, re-read the problem statement. In 1–2 lines, say whether the work serves both success criteria (personal rather than broadcast; fewer people drift after the first course). Say so plainly if we're drifting off course.
2. **Spirit of Art of Living:** messages are warm, respectful and never pushy. No guilt, FOMO, urgency or sales language. Every message is an invitation that's easy to decline. Never mention price, missed days or inactivity. This rule always wins: if example wording from the team breaks it, reword the example and say so. Use Art of Living terms correctly, and ask the team instead of guessing. Guided practice plays the recording of Gurudev Sri Sri Ravi Shankar that the team chose (`config.guided_practice`); the app never writes its own practice instructions.
3. **Privacy:**
   - Use only the data you need.
   - Keep at most one personal message from the teacher per person every 3 days (`outreach.min_days_between_outreach`).
   - A participant's practice is visible to their own teacher and to nobody else. The practice-sharing switch was removed (team decision, 2026-11-14).
   - Opt-out, "pause messages", quiet hours, the Settings screen and the approval step were removed for the hackathon (team decision, 2026-11-14). Don't build them, and don't remove them from the future-enhancements list.
   - Participant contact details are visible only to the assigned teacher.
   - No phone numbers are shared between participants. Chat shows first names only.
   - Teacher remarks are never shown to participants. The cohort practice count is a number only, never names.
   - The only automatic notifications are the ones listed in `docs/features.md` (C3). They follow rule 2 like every other message, and every text a participant sees goes through the banned-phrase filter.
4. **Honesty:** never invent participant data, program names or Art of Living facts. Mark assumptions as assumptions. All thresholds live in `data/config.json`.
5. **Unity/Harmony API is a shared production dependency.** The app must never call it. Use the cached `data/courses.json`. Refresh it only by hand: 3 calls, once.
6. **Hackathon scope:** this is built in days, not months, by a team of 3 (2 technical) mostly through AI coding. Prefer simple and demoable. Don't add new features without asking.

## Stack (decided by the team on 2026-11-14; change only if the team asks)
- Expo (React Native) + Expo Router + TypeScript + NativeWind (Tailwind classes). One codebase for iOS, Android and web.
- Demo: Expo Go on real phones (scan the QR code); the same app runs on the web for projecting the teacher view. The role switcher lives inside the app.
- Server: Expo Router API routes (`app/api/**/*+api.ts`, `web.output: "server"`). The Claude API key and the in-memory store live only on the server, never in the client bundle (no `EXPO_PUBLIC_` prefix on secrets).
- No database. JSON files in `/data` are loaded on the server into an in-memory store. Actions such as logging practice, sending a message, adding a remark, an RSVP or a seva sign-up change that store. A "Reset demo" button reloads the JSON.
- "Now" is always `config.demo_today` (2026-11-14), never the system clock.
- Next-step logic is **deterministic rules** (`lib/engine.ts`), unit-tested against `data/expected_outcomes.json`.
- An LLM (Claude API, key in `.env.local`) only drafts message text. If there is no key, a template fallback writes the message. Every draft goes through the banned-phrase filter in `config.banned_phrases`.

## Project skills (`.claude/skills/`)
- `notes-to-spec`: turn a voice transcript or meeting notes into updates to the spec and design docs.
- `aol-copy-check`: check any participant-facing text against the tone rules and the banned phrases.

## Commands
- `npx expo start` — dev server, API routes and QR code (`w` for web)
- `npm test` — Jest: engine, drafts and filter against `data/expected_outcomes.json`
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript

Layout: `app/` screens and `app/api/` routes, `components/`, `lib/` (engine, store, views, actions, drafter, filter), `theme.js` (design tokens).
