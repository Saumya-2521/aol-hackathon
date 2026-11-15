# Art of Living follow-up app (hackathon MVP)

A participant app (iOS, Android and web) that helps people stay connected after their first course, built around sadhana (daily practice), satsang (events) and seva (volunteering). For each participant it suggests a fitting next step, with a one-line reason, a personal message draft and a channel. The teacher can edit each personal message and sends it with one tap.

- Problem statement and working rules: [CLAUDE.md](CLAUDE.md)
- Feature spec, open decisions and future enhancements: [docs/features.md](docs/features.md)
- UI design and clickable preview: [docs/ui-design.md](docs/ui-design.md), [docs/ui-preview.html](docs/ui-preview.html) (open in a browser)
- Screen sketches: [docs/ui-draft.md](docs/ui-draft.md)
- Agreed design and demo script: [docs/concept.md](docs/concept.md)
- Demo data and personas: [data/DATA_README.md](data/DATA_README.md)

> **Status (2026-11-15):** the app is scaffolded on Expo SDK 58 and every screen in [docs/ui-design.md](docs/ui-design.md) is built. Engine tests, type-check and lint pass. Every screen and the full demo path were checked in a browser at phone width. Expo Go on a real phone has not been run yet.

## Tech stack

| Layer | Choice |
|---|---|
| App | [Expo](https://expo.dev) (React Native) + Expo Router + TypeScript |
| Styling | NativeWind (Tailwind classes) |
| Server | Expo Router API routes (`app/api/**/*+api.ts`), with an in-memory store loaded from `/data/*.json` (no database) |
| Next-step logic | Deterministic rules in `lib/engine.ts`, unit-tested with Jest against `data/expected_outcomes.json` |
| Message drafts | Claude API (server only), with a template fallback when there is no key, and a banned-phrase filter |
| Demo | Expo Go on real phones, plus the web version on the projector for the teacher view |

"Now" is always `config.demo_today` (2026-11-14), never the system clock.

## Prerequisites

- **Node.js 20 LTS or newer** and npm (`node -v` to check)
- **Git**
- **Expo Go** on each demo phone, from the App Store or Google Play. It must support the project's Expo SDK version.
- Optional: an **Anthropic API key**. Without one, messages are written from templates.

Built on **Expo SDK 58** (React Native 0.88, React 19) with NativeWind 4 and Tailwind 3.
- Optional: Xcode (iOS Simulator, Mac only) or Android Studio (Android Emulator), if you'd rather not use a physical phone.

## Setup

```bash
git clone <repo-url> aol-hackathon
cd aol-hackathon
npm install
```

Create `.env.local` in the project root (it's git-ignored):

```bash
# Server only. Do NOT prefix with EXPO_PUBLIC_, or it will be bundled into the app.
ANTHROPIC_API_KEY=sk-ant-...
```

## Run

```bash
npx expo start            # starts the dev server and the API routes, and shows a QR code
```

- **Phone (iOS or Android):** open Expo Go (Android) or the Camera app (iOS) and scan the QR code. The phone and laptop must be on the **same Wi-Fi**.
- **Venue Wi-Fi blocks it?** Use `npx expo start --tunnel` instead.
- **Web (projector / teacher view):** press `w` in the terminal, or open the URL it prints.
- **Simulators:** press `i` (iOS Simulator) or `a` (Android Emulator).

Use the **role switcher** in the app to move between participant and teacher. **Reset demo** reloads all the JSON data and undoes every change made during the session.

## Test and lint

```bash
npm test                  # Jest: engine tests against data/expected_outcomes.json
npm run lint              # ESLint (expo lint)
npx tsc --noEmit          # type-check
```

## Demo-day checklist

1. `git pull && npm install` on the demo laptop.
2. Run `npm test` and make sure everything passes.
3. Start `npx expo start` (or `--tunnel`) and connect both phones in Expo Go.
4. Open the web version on the projector and switch it to the teacher role.
5. Tap **Reset demo** right before going on stage.
6. Follow the 5-minute script in [docs/concept.md](docs/concept.md#five-minute-demo-script).

**Backup if the network fails:** deploy the web version and API routes beforehand with EAS Hosting (`npx expo export --platform web && npx eas-cli deploy`), and set `origin` in the `expo-router` plugin config to that URL so the phones call the hosted API.

## Rules to keep in mind while building

- The app **never** calls the Unity/Harmony API. It uses only the cached `data/courses.json` (see [data/DATA_README.md](data/DATA_README.md)).
- All thresholds live in `data/config.json`.
- Messages stay warm and never pushy, and every draft goes through the banned-phrase filter. Details in [CLAUDE.md](CLAUDE.md).
