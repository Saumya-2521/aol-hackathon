# UI design

The visual and interaction design for the mobile app, in the colours of the Art of Living websites. Build screens from this file. Features and rules stay in [features.md](features.md); the letters in brackets (D1, E4…) point to its sections. Where this file and `features.md` differ, `features.md` wins.

- **Clickable preview:** open [ui-preview.html](ui-preview.html) in any browser. It runs on the sample data in `/data` and shows every screen below.
- **Scope:** a mobile app only (decision of 2026-11-15). The participant app and the teacher view are both phone layouts with bottom tabs. On the web, for the projector, the same phone layout shows in a centred column (max width 480).
- **Colours and logo:** changed on 2026-11-15 from the first "Saffron Dawn" scheme to the Art of Living brand colours.
- **Earlier sketches:** [ui-draft.md](ui-draft.md) has the first layouts. This file replaces it for visual design.

**Alignment check.** The design serves both success criteria. Personal rather than broadcast: the teacher always acts on one person, with one reason and one editable note, and the participant sees a note from a named teacher. Fewer people drift: practice takes one tap from Home, the teacher's Today tab shows who needs support at a glance, and events, seva and the course group are each one tab away.

---

## 1. Design principles

1. **Calm and light.** Light ground, white cards with thin borders, a lot of space. One bold moment only: the dawn sky on Home.
2. **One clear action per screen.** Each screen has a single deep-purple button. Everything else is quieter.
3. **Nothing reads as a failure.** No red in the participant app. Days not practised stay empty, with no cross. A streak of zero shows a greeting, not a number.
4. **Green means done, purple means an invitation, orange is the sun.** Ticks, "Going" and progress bars are green. Buttons are purple. Orange is kept for the sun, today's ring and small highlights.
5. **The teacher sees a person before a number.** Counts lead to names in one tap, and each name leads to a sentence the teacher could say aloud.

---

## 2. Design tokens

All colours, type and spacing come from these tokens. Don't hard-code hex values in screens.

### Colour

Read from artofliving.org on 2026-11-15: the Canada site (deep purple `#3C285F`, button blue `#7677F4`, green `#67A20B`, light greys) and the US site (orange `#F17225`, which is also the sun in the logo). The tints and the darker text shades are derived from those.

| Token | Hex | Use |
|---|---|---|
| `ground` | `#F7F6FA` | Screen background |
| `card` | `#FFFFFF` | Cards, tab bar, inputs |
| `mist` | `#ECEAF3` | Quiet fills: secondary buttons, empty bars, avatars |
| `line` | `#E0DDEA` | Borders and dividers (1 px) |
| `ink` | `#2B2140` | Main text |
| `ink-2` | `#5E5873` | Secondary text |
| `ink-3` | `#8D88A0` | Hints, placeholders, labels (never body text) |
| `brand` | `#3C285F` | Primary buttons (white text), active tab, "very regular" |
| `brand-soft` / `brand-tint` | `#5A4388` / `#E9E4F3` | Hills in the hero / "very regular" tile |
| `accent` | `#7677F4` | Outline-button border, graphics, "building the habit" |
| `accent-deep` | `#4F50C9` | Links and accent text (the site's blue is too light for small text) |
| `accent-tint` / `accent-wash` | `#E6E6FD` / `#F3F3FE` | Own chat bubble, next-step buttons / invitation card |
| `sun` | `#F17225` | The sun, today's ring, unread dot, "needs support" |
| `sun-core` / `sun-deep` / `sun-tint` | `#FBB040` / `#B8500F` / `#FDE8D8` | Sun centre / orange text / orange fills |
| `green` | `#67A20B` | Progress bars, heat-map cells |
| `green-strong` / `green-deep` / `green-tint` | `#4C7A08` / `#436B07` / `#EFF5E5` | Switch on / done text / done fills, tags |
| `clay` / `clay-tint` | `#B3402A` / `#FBE9E4` | **Teacher view only:** the banned-phrase warning |
| `sky-1`, `sky-2`, `sky-3` | `#F3F3FE`, `#E7E0F7`, `#FBDCC4` | Home hero gradient, top to bottom |

Light theme only. A dark theme is out of scope.

### Logo

- Files: `assets/brand/art-of-living-logo.png` (also `.webp`) and `assets/brand/art-of-living-icon.png`, taken from artofliving.org/ca-en.
- Where it appears: top left of **Home** and of the teacher's **Today** (36 high), and centred at the top of both **sign-up** screens (54 high). Nowhere else. Keep it on a white or `ground` background, never recoloured or cropped.
- The file from the website is small (134 × 57). **Ask Art of Living for the official high-resolution or SVG logo before demo day.**

### Type

| Role | Font | Size / weight |
|---|---|---|
| Display | **Poppins** 600 | Greeting 24 · screen title 22 · streak number 46 · card title 16.5 |
| Body | **Open Sans** 400/500/600 | Body 14.5 · secondary 14 · small 13 · label 11.5 uppercase, letter-spacing 0.08em |

Both are used on the Art of Living sites. Load with `@expo-google-fonts/poppins` and `@expo-google-fonts/open-sans`.

### Shape and spacing

- Spacing scale: 4 · 8 · 12 · 16 · 20 · 24. Screen side padding 18. Gap between cards 14.
- Radius: inputs 10 · small buttons 11 · buttons 14 (as on the site) · cards 16 · hero and the big practice button 24 · chips and tags fully round.
- Borders, not shadows: cards have a 1 px `line` border. Shadows only on the notification banner and sheets.
- Touch targets: at least 42 high (34 for the small buttons inside cards).

### NativeWind setup (`tailwind.config.js`)

```js
theme: {
  extend: {
    colors: {
      ground: '#F7F6FA', card: '#FFFFFF', mist: '#ECEAF3', line: '#E0DDEA',
      ink: { DEFAULT: '#2B2140', 2: '#5E5873', 3: '#8D88A0' },
      brand: { DEFAULT: '#3C285F', soft: '#5A4388', tint: '#E9E4F3' },
      accent: { DEFAULT: '#7677F4', deep: '#4F50C9', tint: '#E6E6FD', wash: '#F3F3FE' },
      sun: { DEFAULT: '#F17225', core: '#FBB040', deep: '#B8500F', tint: '#FDE8D8' },
      green: { DEFAULT: '#67A20B', strong: '#4C7A08', deep: '#436B07', tint: '#EFF5E5' },
      clay: { DEFAULT: '#B3402A', tint: '#FBE9E4' },
    },
    fontFamily: {
      display: ['Poppins_600SemiBold'],
      body: ['OpenSans_400Regular'], 'body-medium': ['OpenSans_500Medium'], 'body-semibold': ['OpenSans_600SemiBold'],
    },
    borderRadius: { input: '10px', button: '14px', card: '16px', hero: '24px' },
  },
}
```

---

## 3. Navigation

```
app/
  _layout.tsx           fonts, app state, notification banner, toast, sheets
  index.tsx             opens the participant app
  sign-up.tsx           D0 participant sign-up
  teacher-sign-up.tsx   E0 teacher sign-up
  p/_layout.tsx         bottom tabs: Home · Practice · Events · Volunteer · Chat
    index.tsx           D1 Home
    practice.tsx        D2 Daily Practice
    events.tsx          D3
    volunteer.tsx       D4
    chat.tsx            D5 list
  session.tsx           D2 guided session (full screen, no tabs)
  chat/[kind].tsx       a conversation, for both roles: /chat/channel or /chat/thread
  t/_layout.tsx         bottom tabs: Today · People · Reports · Events · Chat
    index.tsx           E2 Today
    people.tsx          E3 list
    reports.tsx         E5 Sadhana report
    events.tsx          E6 (add and invite open as sheets)
    chat.tsx            E7
  person/[id].tsx       E3 profile + E4 actions
  new-channel.tsx       E1 (opened from Today and from People)
  api/                  server routes: participant/[id], teacher/[id], action, draft, reset, demo
components/             ui.tsx (building blocks), cards, DawnHero, RecommendationCard, PersonRow, TagPicker, Chat, Sheets, TabBar, Player
lib/                    engine, store, views, actions, drafter, filter, clock (server) · app.tsx, api.ts (app)
theme.js                the tokens in section 2, used by tailwind.config.js and by icons and gradients
```

Rules that keep it easy to navigate:

- Five tabs in each role, always visible except inside a chat, the guided session, a profile, sign-up and the new-channel form. Those show a round back button, top left.
- Nothing is more than two taps from a tab.
- The **round initial button, top right of every screen**, opens the **Demo menu** (a bottom sheet): the Participant / Teacher switch (A4), a picker for the persona or teacher, "See the sign-up screen", and **Reset demo** (A3).
- Each sign-up screen links to the other ("Are you a teacher? Sign up as a teacher").
- Short tasks open as **bottom sheets** instead of new screens: a person's recommendation, add event, add seva, invite, choose a different step, the new join code.
- Feedback for every action is a short **toast** at the bottom ("Sent to Priya"). Automatic notifications arrive as a **banner** at the top (C3).

---

## 4. Components (`components/`)

| Component | What it is | States |
|---|---|---|
| `Screen` | Top bar (title or logo, optional back, Demo-menu button) + scroll area + optional footer | — |
| `Card` | White, 1 px `line` border, radius 16, padding 14×16 | `invite` variant: `accent-wash` background |
| `Button` | Radius 14. `primary` brand purple · `outline` accent border · `quiet` mist · `tint` accent-tint (next-step buttons) · `done` green-tint with a tick | Disabled: mist fill, `ink-3` text |
| `Chip` | Filter chip, fully round | Selected: `ink` fill, white text |
| `Tag` | Skill tag, green-tint | With ×; dashed "+ tag" suggestion |
| `StagePill` | Teacher view only | "Ready to deepen" accent-tint · Drifting and Dormant mist (neutral, never red) · others green-tint |
| `ProgressBar` | 8 high, mist track, green fill | — |
| `DawnHero` | Home hero: lilac-to-peach sky, orange sun, two purple hills | `done`: the sun rises 62 px over 1.1 s (no motion if "reduce motion" is on) |
| `EventCard` | Type label, title, day and time, place and distance, **I'm going** | Going: green "✓ Going"; tap again cancels |
| `SevaCard` | Title, description, when, where, bar, "3 of 5 signed up", **Sign up** | Signed up · "All spots filled" (disabled) · "Completed. Thank you 💛" |
| `WeekRow` | M to S circles | Done: green tick · today: orange ring · not done: empty circle |
| `Shortcut` row | Today tab: icon, small label, one bold line, chevron; three rows in one card | — |
| `GroupTile` | Report: big number, group name, one line of meaning | Selected: 2 px brand border |
| `RecommendationCard` | Person, stage, next step, reason, draft, channel, actions | See section 6, E4 |
| `TagPicker` | Selected tags, suggestions from `tag_vocabulary`, "Or type any other skill" | — |
| `ChatBubble`, `Composer` | Others left on white, own right on accent-tint; round send button | Quick replies row above the composer |
| `Banner` | Simulated push: icon, title, text. Slides down from the top, leaves after 6.5 s or on tap | — |
| `Toast` | Dark pill above the tab bar, 2.6 s | — |
| `Sheet` | Bottom sheet over a dimmed screen, close button top right | — |

Icons: one outline set (for example `lucide-react-native`), 1.8 stroke. Emoji appear only inside message text from the spec (🙏 🌿 🎉 💛), never as icons.

---

## 5. Participant app

### D0 Sign-up
Logo, "Join your course group", then: **First name** and **Last name** (side by side), **Course code from your teacher**, **Postal code** (hint: "Used only to show what's happening near you."), one switch ("Use my area to show nearby events"; the follow-up messages switch was removed, team decision 2026-11-15), and **Join my course group**. Below: "Are you a teacher? Sign up as a teacher". This screen is shown the first time the participant view opens after the app loads (no back button then); after that it is reachable from the Demo menu. Joining opens Home and shows the Welcome banner. Demo: no real account is created.

### D1 Home
Logo top left. Then, in the order of the spec:

1. **DawnHero.** Date, "Good morning, Priya", the streak ("**9** days in a row") and "34 practice days in the last 40".
   - Streak of 0: no number. Show "A fresh morning. Begin whenever you're ready."
   - 0 practice days in 40: leave that line out.
2. **Today's sadhana.** Not done: sunrise icon, "Ready when you are", **Start** (goes to Practice). Done: green tick, "Done for today 🙏", no button.
3. **Invitation from the teacher** (only when one was sent). Accent-wash card: "From Anita", the item, when and where, the message, **Tell me more** and **Not right now**. After a reply: "You replied: “Tell me more”. Thank you for letting Anita know."
4. **Next follow-up.** One `EventCard`.
5. **Seva near you.** Two small cards and "See all" (Volunteer tab).
6. **Milestones.** 7 · 21 · 40 days, reached ones in green, with "Only you see these".

### D2 Daily Practice
1. **Start guided meditation** "with Gurudev Sri Sri Ravi Shankar": the one big purple button on the screen. Opens the session.
2. **I practised on my own**: outline button. One tap marks today. Replaced by a "Done for today 🙏" card afterwards.
3. **This week**: `WeekRow`.
4. **Your course group today**: "**2 of 4** from your course practised today" and a bar. A count only, never names.

**Guided session** (full screen): the YouTube player for `config.guided_practice`, then **Begin**. When the video ends (or after `demo_mode_seconds`), the screen becomes a large green tick, "Done for today 🙏", the streak, and **Back to practice**. The app writes no practice instructions of its own.

### D3 Events
Title "Events near L5B". Filter chips: All · Follow-ups · Satsangs · Community · Online. Then `EventCard`s, nearest first. Show the time only when the data has one. Empty filter: "Nothing here just now. New gatherings appear as teachers add them."

### D4 Volunteer
Title "Seva near L5B". `SevaCard`s, nearest first.

### D5 Chat
- **List:** two rows. "# Part 1 · Sep 2026" with the last message, and "Anita (your teacher)" with an orange dot when there is something new. Footer: "First names only. Nobody's phone number or email is shared."
- **Course channel:** bubbles with first names; teachers and volunteers are labelled "Anita (teacher)". Composer: "Ask a question…".
- **Teacher thread:** the teacher's notes and the participant's replies. When an invitation is waiting, the quick replies **Tell me more** and **Not right now** sit above the composer.

### C3 Notifications
Each one is a `Banner` with the wording from `config.notifications.examples`. Tapping it opens the related screen: invitation → Home, reply → the thread, event notes and reminders → Events, practice note → Practice.

---

## 6. Teacher view

### E0 Teacher sign-up
Logo, "Set up your teacher account", then **First name**, **Last name**, **Email**, **Areas where you teach** (hint: "Used to suggest places when you add events and seva."), and **Create my account**. Below: "Taking a course, not teaching? Sign up as a participant". Creating the account opens **New course channel**, so the first thing a new teacher does is set up their course group.

### E1 New course channel
Opened from the **New course channel** button at the top of Today, or the floating **+ Channel** button in People.

1. One line of help: "For a Part 1 course that has just finished. Add the people who took it, and you'll get a code they use to join."
2. Course, end date and channel name.
3. A card per participant: first name, `TagPicker`, note. "Remove" on each card when there is more than one. **Add another participant** below.
4. **Create channel and get the code.**
5. A sheet confirms it: "Your channel is ready", the **join code** in large letters (for example `NOV26-MIS`), **Copy the code** and **Go to the channel**. People then opens with the new channel selected.

### E2 Today
Kept short on purpose (changed 2026-11-15): practice numbers live in Reports only. Logo and date at the top. Then:

1. **Good morning, Anita**.
2. **New course channel** (outline button, full width).
3. **This week**: one card with three one-line rows, each with an icon and a chevron:
   - "Next event · Sat, Nov 28" / the event title (opens Events).
   - "Open seva · 1 of 2 signed up" / the seva title (opens Events).
   - "Remarks" / "2 of 5 still to add" (opens People).
4. **Reach out personally** (C4): one card, one row per person. People whose channel is a call or a hello in person come first ("A phone call from you", button **Call** or **Say hello**), then people with no practice for 3 days or more ("No practice · 20 days", button **Write a note**). The button opens that person's recommendation sheet.

### E5 Reports ("Sadhana report")
1. **Group** picker: "Part 1 · Sep 2026 · 4 participants".
2. Four `GroupTile`s in a 2 × 2 grid. Tapping one selects it:

   | Tile | Meaning | Colour |
   |---|---|---|
   | Very regular | 35–40 days · suggest the next course | brand-tint |
   | Building the habit | 20–34 days · encourage | accent-tint |
   | Needs support | Below 20 days · check in | sun-tint |
   | App not opened | 5+ days · reach out | mist |

3. The selected group's name with an **Add remarks** link (opens People), then its people. Each row: initials, "Tom W.", "37 of 40 days · practised today", and a **next-step button**: "Invite to Sahaj", "Invite to Part 2", "Invite to seva", "Invite to follow-up", "Invite to satsang", "Invite to event", "Check in", "Call" or "Say hello". It always names what the invitation is to. After sending it reads "✓ Sent".
4. The next-step button opens the **recommendation sheet** (the `RecommendationCard` and "Open the full profile"). The name opens the profile.

The button's label comes from the engine's next step for that person (B3), not from the tile.

### E3 People and profile
- **List** (changed 2026-11-15): one line at the top with the channel chips (All + each channel, scrolling sideways). **+ Channel** is a floating button at the bottom right, above the tab bar. **All** is selected by default. Below it is one continuous list with no channel headings. Each person is one row, the same as in the report: initials, "Priya S.", "34 of 40 days · yesterday", and the next-step button, which opens the recommendation sheet. The name opens the profile. When a single channel is selected, its join code shows under the chips.
- **Profile**, top to bottom: stage, area, channel and **contact details** ("visible only to you, as the assigned teacher") · **Sadhana** ("35 of the last 40 days · 10 in a row" and a 40-cell heat-map, today outlined in orange) · **Next step** (`RecommendationCard`) · **Remarks** (`TagPicker` and the note, with the hint "Interests and practical details only, no health or personal matters. Remarks are never shown to Priya.") · **Timeline**.
- Adding or removing a tag updates the next step, the reason and the draft at once.

### E4 `RecommendationCard`
Shown in the recommendation sheet and on the profile.

| Part | Content |
|---|---|
| Header | Initial, first name, stage pill. Tapping opens the profile. |
| Next step | Title in bold; place, distance and date below. |
| Reason (B4) | One sentence with an accent-tint bar on the left. Tags that steered it are bold. |
| Draft | Two lines, on `ground`. **Edit** turns it into a text box. |
| Channel | "Reaches Priya as a personal message" |
| Actions | **Send** (primary) · **Edit** · **Other step** · **Later** · **Skip** |

States:
- **Outreach gap (B6):** the card is greyed, the line reads "Next outreach possible on Nov 15", and Send is disabled.
- **Banned phrase or more than 4 sentences (C2):** a clay note under the draft ("Please reword: “hurry”…") and Send is disabled until it is fixed. It updates while typing.
- **Call or in person (B5):** no Send. The card shows "An opening line, if it helps" and "Nothing is sent through the app."
- **Sent:** "✓ Sent today", the message, and the next possible date.
- **Other step** opens a sheet grouped as Courses · Events and satsang · Seva · Daily practice, with "Back to the suggested step" when the teacher has changed it.

### E6 Events and seva
- **+ Event** and **+ Seva** open a sheet: title, type, date, time, place, description, skill tags, and for seva the number of people needed.
- Each event card: type, title, when and where, "**2 going**: Tom, Rahul", then **People who might enjoy this** (checkboxes, with the matching tag beside each name), **Invite selected** and "Choose from everyone".
- Each seva card adds the bar, "3 of 5 signed up" and **Mark complete**, which becomes "✓ Completed. Thank-you note sent."
- **Invite selected** opens a sheet with one editable note per person and a Send button each. The outreach gap and the banned-phrase check apply here too.

### E7 Chat
Course channels, then personal threads (an orange dot marks a new reply). Same bubbles and composer as the participant's chat. A teacher's message with a banned phrase is not sent; a toast asks them to reword it.

---

## 7. Feature coverage

| Feature | Where it is in the UI |
|---|---|
| A1 Demo clock | Dates on Home and Today come from `demo_today` |
| A3 Reset demo · A4 Role switcher | Demo menu (round button, top right) |
| B1, B3, B4, B5 Stage, next step, reason, channel | `RecommendationCard`, next-step buttons in the report, People rows |
| B2 Nearby | Distances and order in Events, Volunteer, Home |
| B6 Outreach gap | Gap state of `RecommendationCard` and of the invite sheet |
| C1 Drafts · C2 Banned-phrase filter | Draft and Edit in the card; clay note; chat composer check |
| C3 Participant notifications | `Banner` |
| C4 Teacher alert | "Reach out personally" on Today |
| D0–D5 | Section 5 |
| E0–E7 | Section 6 |
| F Privacy | Contact details only on the teacher's profile screen; first names in chat; the course-group count has no names; remarks appear only in the teacher view |

Section I (future enhancements) has no UI. The team's mock-up showed "2 rides offered" on the satsang card; rides are a future enhancement, so that line is not built.

---

## 8. Participant-facing text

Checked against rule 2 in `CLAUDE.md` and `config.banned_phrases`. Use these strings as written.

| Place | Text |
|---|---|
| Home, streak 0 | A fresh morning. Begin whenever you're ready. |
| Home, practice not done / done | Ready when you are · Done for today 🙏 |
| Invitation buttons | Tell me more · Not right now |
| After replying | You replied: “…”. Thank you for letting Anita know. |
| RSVP toasts | Lovely. Your teacher can see you're going. · No problem. Your RSVP is removed. |
| Seva toasts | Thank you. You're signed up. · No problem. You're no longer signed up. |
| Seva full / complete | All spots filled · Completed. Thank you 💛 |
| Empty lists | Nothing here just now. New gatherings appear as teachers add them. |
| Chat footer | First names only. Nobody's phone number or email is shared. |

The group names in the report ("Needs support", "App not opened") are for teachers only and never appear in the participant app.

The fallback templates for each stage are in the preview (`draftFor` in `ui-preview.html`). Each is at most 4 sentences, signed with the teacher's first name, and easy to decline.

---

## 9. Questions the design raised (for the team)

1. **Report groups.** The mock-up's cut-offs (35 / 20 practice days in 40, app not opened for 5 days) are now in `config.reports` as an assumption. With the sample data most people land in "Needs support" (Arjun has 17 of 40, Emily 19). Are those the right cut-offs?
2. **"Alerted" for app not opened.** The mock-up says "5+ days · alerted". No such notification is in the spec (C3), so the tile says "reach out". Should a notification be added?
3. **Logo.** The website file is small. Can the team get the official high-resolution logo, and confirm the app may use it?
4. **Reason wording.** The spec's example says "she's interested in meditation". The data has no pronouns, so the preview says "your remarks mention **meditation**". Is that fine?
5. **Events have no skill tags** in `community_events.json`, so "People who might enjoy this" has nothing to match for existing events. The preview fills in tags by hand (**ASSUMPTION**). Add a `tags` field to the data?
6. **Some follow-ups have no start time** in `courses.json` (the Mississauga weekly follow-up shows midnight). The card leaves the time out. Confirm the times before the demo.
7. **Projector.** `CLAUDE.md` says the web version is used to project the teacher view. With a mobile-only design it shows as a phone-width column. Is that enough for the demo?
8. **Teacher sign-up fields.** First name, last name, email and areas are my suggestion. Is anything else needed?
