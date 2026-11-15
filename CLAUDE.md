# Art of Living follow-up app (hackathon MVP)

## Problem statement (verbatim, the source of truth)
"Help more people stay connected to the wisdom. People experience SKY and its transformation, stay connected for a while, and then get caught up in life and quietly drift away. Part of the reason is that our follow-up treats everyone as one group. The same message goes to everyone, regardless of where they are in their journey.
Build: A system that maps each participant's journey from their history (courses taken, events attended, last contact, engagement signals) and, for each person, predicts a fitting next step: a follow-on course, a retreat, a seva role, or re-engagement if they've gone quiet. For each prediction it drafts a personalized message and suggests a channel. Built and demoed on the sample participant data provided.
Success: follow-up feels personal rather than broadcast, and fewer people drift away after their first course."

## Read these first
- `docs/concept.md`: the agreed design (journey stages, next-step rules, messages, channels, screens, demo script). Follow it.
- `data/DATA_README.md`: the data files, the personas and the date and time rules.
- `docs/brief.md` and `docs/team-ideas.pdf`: the team's original brief and notes, for background.

## Working rules
1. **Alignment check:** before designing or building any feature, re-read the problem statement. In 1–2 lines, say whether the work serves both success criteria (personal rather than broadcast; fewer people drift after the first course). Say so plainly if we're drifting off course.
2. **Spirit of Art of Living:** messages are warm, respectful and never pushy. No guilt, FOMO, urgency or sales language. Every message is an invitation that's easy to decline. Never mention price, missed days or inactivity. Use Art of Living terms correctly, and ask the team instead of guessing.
3. **Privacy:**
   - Use only the data you need.
   - Honour opt-out and "pause messages".
   - Keep at most one outreach per person every 14 days, and respect quiet hours.
   - Hide practice data from teachers when `share_practice_with_teacher` is false.
   - Participant contact details are visible only to the assigned teacher.
   - No phone numbers are shared between participants.
4. **Honesty:** never invent participant data, program names or Art of Living facts. Mark assumptions as assumptions. All thresholds live in `data/config.json`.
5. **Unity/Harmony API is a shared production dependency.** The app must never call it. Use the cached `data/courses.json`. Refresh it only by hand: 3 calls, once.
6. **Hackathon scope:** this is built in days, not months, by a team of 3 (2 technical) mostly through AI coding. Prefer simple and demoable. Don't add new features without asking.

## Stack (decided by the team on 2026-11-14; change only if the team asks)
- Expo (React Native) + Expo Router + TypeScript + NativeWind (Tailwind classes). One codebase for iOS, Android and web.
- Demo: Expo Go on real phones (scan the QR code); the same app runs on the web for projecting the teacher view. The role switcher lives inside the app.
- Server: Expo Router API routes (`app/api/**/*+api.ts`, `web.output: "server"`). The Claude API key and the in-memory store live only on the server, never in the client bundle (no `EXPO_PUBLIC_` prefix on secrets).
- No database. JSON files in `/data` are loaded on the server into an in-memory store. Actions such as logging practice, approving or sending a message, adding a note, or pausing change that store. A "Reset demo" button reloads the JSON.
- "Now" is always `config.demo_today` (2026-11-14), never the system clock.
- Next-step logic is **deterministic rules** (`lib/engine.ts`), unit-tested against `data/expected_outcomes.json`.
- An LLM (Claude API, key in `.env.local`) only drafts message text. If there is no key, a template fallback writes the message. Every draft goes through the banned-phrase filter in `config.banned_phrases`.

## Commands
(Fill in once the project is scaffolded: dev, test, lint.)
