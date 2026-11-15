# Feature spec: Art of Living follow-up app (hackathon MVP)

This is the list of everything we will build, and nothing more. If something isn't in this file, it isn't in scope: ask the team before adding it.

**Sources:** the team's voice notes and decisions of 2026-11-14, [concept.md](concept.md), [DATA_README.md](../data/DATA_README.md), [config.json](../data/config.json) and the working rules in [CLAUDE.md](../CLAUDE.md). Screen sketches are in [ui-draft.md](ui-draft.md).

**Problem:** people experience SKY, stay connected for a while, then quietly drift away, partly because everyone gets the same message.
**Success:** (1) follow-up feels personal rather than broadcast; (2) fewer people drift away after their first course.

Each feature is tagged with the success criterion it serves: **[P]** personal, **[D]** less drift.

> Items marked **ASSUMPTION** are not confirmed. All thresholds live in `data/config.json`, never in code.

---

## 0. The idea in one page

The app is built around three goals:

| Goal | Meaning | Where it lives |
|---|---|---|
| **Sadhana** | Daily practice | Daily Practice tab |
| **Satsang** | Events in good company: follow-ups, satsangs, community events | Events tab |
| **Seva** | Volunteering | Volunteer tab |

**Participant app, 5 tabs:** Home · Daily Practice · Events · Volunteer · Chat
**Teacher view, 5 tabs:** Today · People · Reports · Events · Chat

**How the two sides connect:** the teacher's remarks (skills and interests) plus the participant's practice produce a recommended next step for each person. The teacher sends it, and the participant gets a personal invitation.

- Someone who practises regularly (35 of the last 40 days) is invited to a next course (Part 2 or Sahaj Samadhi).
- Someone who isn't regular is invited into the community: an event or seva that matches their skills.

Platforms: iOS and Android through Expo Go, plus web for the projector. Stack details are in [README.md](../README.md).

---

## A. Foundations

### A1. Demo clock
- "Now" is always `config.demo_today` (2026-11-14), returned by one helper (`lib/clock.ts`). No business logic reads the system clock.
- Times are shown in `America/Toronto`. Course schedules show `timing_text` as given.

### A2. In-memory data store
- On server start, every JSON file in `/data` is loaded into typed, in-memory collections.
- All actions change this store through API routes. No database, and nothing is written back to the JSON files.

### A3. Reset demo
- One button, in both roles, calls `POST /api/reset` and reloads all the JSON.
- **Done when:** after any sequence of actions, Reset brings every persona back to its stage in `expected_outcomes.json`.

### A4. Role switcher
- A toggle switches between **Participant** (pick a persona; Priya by default) and **Teacher** (Anita by default).
- Demo tool only, with no real sign-in. Volunteers have the same permissions as teachers for now.
- **Two devices at once (added 2026-11-15):** a phone shows the participant and the projected laptop browser shows the teacher. Both read the same server store, and each device re-reads its view every 3 seconds, so a message sent by the teacher reaches the participant's phone without a refresh. The role follows the screen's address, so reloading the laptop on a teacher screen stays in the teacher view.

### A5. Courses come only from the cache
- The app reads `data/courses.json` only. It never calls the Unity/Harmony API.

---

## B. Recommendation engine (`lib/engine.ts`)

Pure TypeScript, unit-tested against `data/expected_outcomes.json` for all 18 personas.

### B1. Activity and journey stage [P][D]
**Activity** means a practice log, an event attended, or the app being opened.

Stages are checked in `config.stage_order`, and the first match wins:

| Stage | Rule (config key) |
|---|---|
| `returning` | Activity within `returning_active_within_days` (7) after a gap of at least `returning_min_gap_days` (14) |
| `dormant` | More than `dormant_inactive_days` (30) since last activity |
| `drifting` | `drifting_inactive_days` (14) to 30 days since last activity |
| `new` | At most `new_days_after_part1` (21) days since Part 1 |
| `ready_to_deepen` | At least `ready_min_practice_days` (35) practice days in the last `ready_window_days` (40), **and** an eligible next course not yet taken |
| `seva_inclined` | Tag `seva`, or at least `or_min_events_60_days` (3) events in 60 days |
| `practising` | At least `practising_min_practice_days_30` (8) practice days in 30, or at least 1 event in 30 days |

- **ASSUMPTION:** someone who matches no stage falls back to `practising`.

### B2. Nearby filter [P]
- Uses the straight-line distance between the participant's home area (from the postal code given at sign-up) and the event's location. Items within `nearby_radius_km` (25 km) count as nearby.
- Online items are always included.
- Excluded: courses whose registration is closed or full, and courses starting in fewer than `min_days_notice_for_courses` (2) days.
- Sorted nearest first, then by earliest start.
- Respects the tags `weekends_only` / `weekdays_only` and `no_car` + `online_ok`.

### B3. Next step for each person [P][D]
The next step combines **practice** and **the teacher's remarks (skills and interests)**.

| Stage | Next step |
|---|---|
| new | The practice habit plus the nearest follow-up |
| practising | A nearby follow-up or satsang. If a skill tag matches an event or seva (for example `singing` → sing at the next satsang), that one is preferred. |
| ready_to_deepen | A course from `next_courses_after[last course]`. An interest tag picks it (`meditation` → Sahaj; `deeper_practice` or `silence_retreat` → Part 2). Otherwise the earliest in-person course nearby, then online. |
| seva_inclined | A seva opportunity matched to skill tags (`cooking`, `music`…) |
| drifting / dormant | Community first: a real follow-up, satsang or community event, matched to skill tags where possible, and honouring the schedule and transport tags |
| returning | A welcome back plus a follow-up |

- Step types a teacher can invite someone to: **a course, seva, satsang or event, or daily practice**.
- A teacher can always choose a different step.
- Skills the teacher typed in themselves (E1) are matched to an event's or seva's tags by exact text.
- **ASSUMPTION:** skill matching only changes the choice when a matching item exists nearby. Otherwise the result is the same as before.

### B4. One-sentence reason [P]
- Every recommendation comes with one plain sentence a teacher could say aloud, e.g. *"Priya has practised on 35 of the last 40 days and you noted she's interested in meditation, so we suggest Sahaj Samadhi Meditation in Brampton East on Nov 17."*
- It quotes the tags that steered the choice, so adding a tag visibly changes it.
- For the teacher only. It is never sent to the participant.

### B5. Channel [P][D]
- Default by stage from `config.channels`: new → feed card; practising → feed card + push; ready, seva, drifting, returning → personal in-app message from the teacher; dormant → teacher call.
- Overrides: push disabled, or no app open in 30 days, or tag `prefers_call` → teacher call. Dormant with tag `community_events` → in person.
- For **teacher call** and **in person**, nothing is sent through the app. The card tells the teacher to reach out and offers an opening line.

### B6. Outreach gap
- At most 1 personal message from the teacher per person every `min_days_between_outreach` (3) days. If it's too soon, the card shows "Next outreach possible on <date>" and Send is disabled (Arjun).
- No approval step for now (`outreach.requires_approval` is false): when the teacher taps Send, the message is delivered at once.
- **ASSUMPTION:** an invitation to an event or seva (E6) counts as a personal message, so the 3-day gap applies to it. Automatic notifications (C3) don't count.

---

## C. Messages and notifications

### C1. Draft writer (`lib/drafter.ts`) [P]
- **Inputs:** first name, last course and how long ago, practice count (as appreciation only), teacher's first name, the recommended item with date and place, the stage's tone, the teacher's remark text.
- **Tone by stage:** new: warm welcome · practising: light and friendly · ready to deepen: personal invitation · seva: "we'd love your help" · drifting: gentle check-in, no ask · dormant: "thinking of you, the door is open" · returning: "lovely to see you", no mention of the gap.
- **Rules:** at most 4 sentences, signed with the teacher's first name, always an easy way to decline, never mention price, missed days or inactivity.
- **Claude API** (server only) writes the text. Without a key, or if the call fails, a **template** for each stage writes it.

### C2. Banned-phrase filter
- Every text that reaches a participant (AI draft, template, teacher edit, automatic notification) is checked against `config.banned_phrases`, and teacher messages also against the 4-sentence limit.
- Matching is on whole words and phrases, ignoring case, so "fee" doesn't block "feel".
- A failing AI draft is regenerated once, then replaced by the template. A failing teacher edit highlights the phrase and disables Send.
- With the approval step removed, this filter is the only check on wording, so it runs on every send.

The list in `config.banned_phrases`:

| Group | Phrases |
|---|---|
| Urgency and scarcity | last chance · limited seats · only a few spots · don't miss · hurry · act now · register today · final call · ends soon · filling fast · book now · sign up now · limited time · don't forget |
| Sales and price | discount · deal · special offer · offer ends · price · fee · fees · cost · payment · course credit |
| Missed days and inactivity | you missed · you haven't · why haven't · we noticed you stopped · streak broken · it's been a while · it's been a few days · we missed you · we miss you · haven't seen you · where have you been · you stopped · you forgot · lost your streak · fell behind · falling behind · you should have |

### C3. Notifications to the participant [P][D]
All wording follows rule 2 in `CLAUDE.md`: warm, easy to ignore, and never about missed days, gaps or price. Triggers are in `config.notifications`, with the example texts.

| Notification | Trigger | Example |
|---|---|---|
| Welcome | The participant joins their course channel | "Welcome, Aisha. We're so glad you're here. Your course group and Anita are close by whenever you have a question. 🙏" |
| First practice | The first practice is logged | "Aisha, your first practice is logged. A lovely way to begin. 🌿" |
| Practice note | 3 days with no practice logged | "Hi Priya, a few quiet minutes are here for you whenever you'd like. 🌿" |
| Streak milestone | 7, 21 or 40 days in a row | "21 days in a row, Priya. That's a real habit taking root. 🎉" |
| Event note | No event attended for 3 weeks | "Priya, there's a satsang this Thursday, 10 min from you. You'd be very welcome." |
| Course group is going | 2 or more people from their course channel RSVP to the same event | "Rahul and 2 others from your course are going to Friday's games night. Come along if you'd like, Priya." |
| New event nearby | A teacher adds an event within 25 km | "Priya, Full moon meditation is happening this Saturday near you. Would you like a reminder?" |
| Event reminder | The day before an event they RSVP'd to or asked a reminder for | "Priya, tomorrow is Weekly follow-up, 7:00 PM in Mississauga. Looking forward to seeing you." |
| After seva | Their seva is marked complete | "Thank you for your seva today, Priya. You helped make it happen. 💛" |
| Course anniversary | 1, 3, 6 and 12 months after the course | "Priya, today marks 1 month since your course. Look how far you've come: 24 practice days. 🙏" |
| Invitation from the teacher | The teacher sends a recommendation or an invite | "Priya, Anita thought of you and sent an invitation to Sahaj Samadhi Meditation." (a note with no item: "Priya, Anita wrote you a personal note.") |
| Reply | Someone replies to them in chat | "Anita replied to you, Priya." |

**Warmer, personal wording (changed 2026-11-15):** every notification uses the participant's first name and, where it fits, the teacher's first name. Checked against rule 2 and `config.banned_phrases`. To implement: update `config.notifications.examples` to these texts (new placeholder `{teacher}` in the welcome), and the invitation and reply texts in `lib/actions.ts`. Note for wording: the filter matches parts of words, so "feel like it" is caught by the banned word "fee"; use "whenever you'd like".

**Where they appear (changed 2026-11-15):** the latest notification is shown at the **top of the participant's Home**, as a note card directly under the greeting, the same style as the teacher's warm note on Today. It stays until the participant closes it or a newer one replaces it. There is **no pop-up banner** at the top (team decision, 2026-11-15). **Tapping the card opens the notification in full** in a bottom sheet. For an invitation from the teacher, the sheet shows who it is from, the item with when and where, the teacher's whole message and the two replies (Tell me more, Not right now). The message is shown there **without the "- Anita" signature**, because the sheet already says "From Anita"; the stored message is still signed. The separate invitation card on Home was removed (2026-11-15), so the invitation is not shown twice.

Changes made to the team's example wording, to keep to rule 2:
- **Practice note:** "it's been a few days" is left out, because it points at the gap.
- **Event note:** "We missed you at satsang" became an open invitation, for the same reason.
- **"You're 20 points from your next course credit"** is not built. Points and rewards are a future enhancement (section I), and wording about course credit touches price. Decide the wording when gamification is designed.

Limits:
- At most `max_automatic_per_day` (1) automatic notification per person per day (**ASSUMPTION**). Replies and the teacher's invitation are not limited by this.
- The practice note goes out once per gap, never daily.
- The course anniversary shows the practice count only as appreciation. **ASSUMPTION:** if there are no practice days, the count is left out.
- "Course group is going" names only people from the same course channel, by first name.
- For the demo, a notification shows as the note card at the top of Home. On a phone it also goes out as a **real system notification** (tray and sound) through `expo-notifications` (added 2026-11-15). These are local notifications: the app raises one when it sees a new note, so they arrive while the app is open or was recently in the background. Tapping one opens the note in full. Reaching a closed app needs remote push and installed builds (section I). On the web only the note card shows.
- **Demo setting (team decision, 2026-11-15):** with `notifications.demo_teacher_sent_only` on, a notification appears only for what the teacher sends (invitation, reply, new event nearby, after seva) and for the participant's own first practice and streak milestones. The **practice note** (3 days with no practice) is also on (added 2026-11-15), so Carlos (P14), who last practised 3 days ago, opens with one. The welcome and the other time-based notifications (event note, course group is going, event reminder, course anniversary) are off, so every other participant's first view opens with no note. They stay in this spec and return when the setting is off.

### C4. Notifications to the teacher [D]
- When a participant has logged no practice for `teacher_alert_after_days_without_practice` (3) days, the teacher sees "Jack hasn't logged a practice in 3 days" with a **Send a personal note** button, which opens a draft (C1).
- Shown in the Today tab (E2).

---

## D. Participant app

Tabs: **Home · Daily Practice · Events · Volunteer · Chat.** There is no Settings screen in this version.

### D0. Sign-up
- Fields: first name, last name, course code from the teacher (joins the course channel), postal code (used for everything "near you"), and one consent switch: location for nearby events (the follow-up messages switch was removed, 2026-11-15). (First and last name added 2026-11-15.)
- **Demo scope:** the screen works but creates no real account. The role switcher picks the persona.
- **Shown once per demo run (added 2026-11-15):** the app opens on this screen until the participant has joined. After that it opens on Home, and switching roles never brings the screen back. Reset demo starts a new run, so the screen shows again.

### D1. Home [P][D]
In this order:
1. **Streak:** how many days in a row they have done their sadhana. Encouraging only; never "streak broken" or missed-day wording.
2. **A note for you** (changed 2026-11-15), when there is a notification: the latest one as an orange note card (C3). Tapping it opens the notification in full. An invitation from the teacher is read and answered there ("Tell me more", "Not right now"); the separate invitation card on Home was removed.
3. **Today's practice:** done or not, with a button to the Daily Practice tab.
4. **Next follow-up meditation:** when, where and how far, with **I'm going** (RSVP).
5. **Seva near you:** the next 2–3 opportunities, linking to the Volunteer tab.
6. **Private milestones** at 7, 21 and 40 practice days. No leaderboards, no points.

### D2. Daily Practice [D]
- **Start guided practice:** a guided meditation by Gurudev Sri Sri Ravi Shankar. When the session finishes, today is marked complete automatically.
  - The app plays the recording from its source (`config.guided_practice`). It doesn't copy the audio or write its own instructions.
  - The recording is the one the team chose: <https://www.youtube.com/watch?v=TQVbZIfe7Dg>. It is played inside the app with the YouTube player, which tells the app when the video ends, so the day can be marked complete.
  - It needs an internet connection during the demo. Check before demo day that the video allows playback inside other apps.
  - **ASSUMPTION:** in the live demo a session can be finished after `demo_mode_seconds` (15), so completing a practice can be shown quickly.
  - **ASSUMPTION:** a one-tap "I practised on my own" button also marks the day, so Priya's live step (34 → 35) takes one tap.
- **This week:** Monday to Sunday with a tick on completed days and today highlighted. Days not done stay empty, with no cross or red mark.
- **Your course group today:** "2 of 4 from your course practised today", on a card the participant can tap. Tapping it lists the **first names of the people in their course channel who have practised today** (changed 2026-11-15, team decision; it used to be an anonymous count). It never lists who hasn't practised, and shows no streaks, counts or history. **ASSUMPTION:** the count includes everyone in the course channel.

### D3. Events (satsang) [P][D]
- Lists what's happening near the participant's postal code: follow-up meditations, satsangs and community events (for example a games night). It shows events, not courses. Courses reach a participant only as a teacher's invitation (D1).
- **Filter chips** at the top: All · Follow-ups · Satsangs · Community · Online.
- **Event card:** title, type, date and day of the week, time, place, distance, and an **I'm going** button. Tapping again cancels.
- RSVPs are visible to the teacher. **ASSUMPTION:** an RSVP is not counted as "attended" by the engine.

### D4. Volunteer (seva) [P][D]
- Lists seva opportunities near the participant's postal code.
- **Seva card:** title, what it's about, place, distance, date, and how full it is ("3 of 5 signed up"), with a **Sign up** button. Tapping again withdraws.
- Sign-up is disabled when the spots are full.

### D5. Chat [D]
- **Course channel:** the teacher adds the participant when the course ends. Participants can ask questions about the course or their practice, and the teacher and volunteers answer.
- **Teacher thread:** personal notes from the teacher (invitations, check-ins), with replies and the quick replies "Tell me more" and "Not right now".
- Privacy: the channel shows first names only. No phone numbers or emails are visible to other participants.

---

## E. Teacher view

Tabs: **Today · People · Reports · Events · Chat.** Layout sketches are in [ui-draft.md](ui-draft.md).

### E0. Teacher sign-up (added 2026-11-15)
- Fields: first name, last name, email, and the areas where they teach. After signing up, the teacher lands on the Today tab (changed 2026-11-15; it used to open "New course channel"). The **New course channel** button is at the top of Today (E1).
- **Demo scope:** the screen works but creates no real account. The role switcher picks the teacher.
- **Shown once per demo run (added 2026-11-15):** the first switch to the Teacher role opens this screen. After that the switch opens Today. Reset demo starts a new run, so the screen shows again.

### E1. Create a course channel and add remarks [P]
- When a Part 1 course has just finished, the teacher creates a **channel** for it and adds the participants. A **New course channel** button sits at the top of the Today tab (and in People).
- When the channel is created, a **join code is generated** and shown with a copy button. Participants enter it at sign-up.
- While adding each participant, the teacher writes **remarks**:
  - **Skills and interests** as tags. The teacher picks from the suggestions in `tag_vocabulary` (music, singing, dance, cooking…) or **types any other skill**, which is saved on the participant's profile like any other tag (Grace: `photography`).
  - **Free-text note** for practical details. Used only for message wording. Hint text: "Interests and practical details only, no health or personal matters."
- Remarks can be edited later on the participant's profile. Adding a tag recomputes the recommendation at once.

### E2. Today [D]
Changed on 2026-11-15: kept short and easy to read. The report information (practice groups, practised today, app not opened) was removed from Today and lives only in Reports (E5).
- **New course channel** button at the top (E1).
- **A warm note for the teacher** (added 2026-11-15): one cheering line written from real numbers (for example a participant's steady practice, or how many practised today). A **wisdom note** can be shown under it once the team adds quotes and their sources to `config.teacher_note.wisdom_notes`; the list is empty for now, because the app never writes its own wisdom (rule 4).
- **This week:** two tiles, the teacher's next event (when, how many are going) and the open seva (how full it is). The remarks line was removed from Today (2026-11-15); remarks are added from People.
- **Reach out personally:** one list of people whose channel is a teacher call or in person, and participants with no practice in 3 days (C4), each with one button.

### E3. People and the participant profile [P][D]
- **List:** each channel's participants, each with a **quick recommendation** line (stage plus next step), so the teacher can act without opening the profile.
- **Profile (tap for detail):**
  - Sadhana: streak, practice days in the last 40, and a heat-map.
  - Timeline: courses, events attended, RSVPs, seva, messages and replies.
  - Remarks and tags (E1).
  - Recommendation with its reason, the draft, the channel, and the actions in E4.
  - Contact details, shown only to the assigned teacher.

### E4. Recommendation actions [P]
For each recommendation the teacher can:
- **Send:** the participant gets a notification and the message appears in their teacher thread.
- **Edit** the draft (re-checked by C2).
- **Choose a different step:** another course, an event, seva, or a daily-practice encouragement.
- **Snooze** (**ASSUMPTION:** 7 days) or **Skip**.

### E5. Reports [D]
For each course (channel):
Changed on 2026-11-15 (the "Sadhana report"):
- **Groups**, by practice days in the last 40, with definitions in `config.reports` (**ASSUMPTION**, from the team's mock-up): **very regular** 35 to 40 days · **building the habit** 20 to 34 days · **needs support** below 20 days · **app not opened** for 5 or more days. A person can be in "app not opened" and one other group.
- **Everyone first (added 2026-11-15):** selecting a course lists all its participants. Tapping a group narrows the list to that group; tapping it again, or "Show everyone", lists everyone again.
- Tapping a group lists its people: name, practice days out of 40, when they last practised, and a button with their next step ("Invite to Sahaj", "Invite to Part 2", "Invite to seva", "Invite to follow-up", "Check in", "Call"). An invitation always names what it is to. The button opens the recommendation with its reason, draft and actions (E4). The name opens the profile.
- The next step always comes from the engine (B3), not from the group: someone "very regular" who has taken every course is invited to seva, not to a course.

### E6. Events and seva: add and invite [P]
- **Add an event or a seva opportunity:** title, type, date and time, place, description, skill tags, and for seva the number of people needed. It appears at once in the participants' Events or Volunteer tab.
- **Invite by skill:** each event or seva shows "People who might enjoy this", chosen by matching skill tags (for example `singing` for a satsang). The teacher picks people and sends a personal invitation, drafted by C1.
- **Mark seva complete:** sends the thank-you note (C3) to everyone who signed up. **ASSUMPTION:** this is how the thank-you is triggered in the demo.
- The teacher can see who has RSVP'd or signed up.

### E7. Chat
- The teacher's course channels and personal threads with participants.

---

## F. Privacy (applies everywhere)

| Rule | Where it's enforced |
|---|---|
| Use only the data needed | API responses are shaped per screen. Claude gets only the drafting inputs (C1). |
| At most 1 personal teacher message every 3 days | Outreach gap (B6) |
| Practice is seen by the participant and their own teacher; course-mates see only who has practised today | Teacher APIs return practice only for the teacher's own participants; other participants in the same course channel see the count and the first names of those who practised today, nothing else (D2, changed 2026-11-15) |
| Contact details only for the assigned teacher | Teacher API returns `contact` only when `teacher_id` matches |
| No phone numbers shared between participants | Chat shows first names only; participant APIs never return contact details |
| Cohort practice shows only who has practised today | D2 shows a number and, on tap, first names of those who practised today; never who hasn't (changed 2026-11-15) |
| Teacher remarks are never shown to participants | E1, B4 |
| Locations | Area centroid and postal FSA only, never a street address |

**Removed for the hackathon (team decision, 2026-11-14):** opt-out, "pause messages", quiet hours, the Settings screen, the practice-sharing switch and the teacher's approval step. A teacher now sees the practice of everyone in their channels. A participant currently has no way to stop notifications inside the app. See section I, row 8.

---

## G. Demo checkpoints

| Persona | What must happen |
|---|---|
| Priya (P01) | 34 of 40 → marks practice → 35 → `ready_to_deepen` → Sahaj Samadhi (Brampton East). Teacher adds `meditation` → the reason cites it → edit, send → Priya gets the notification and taps "Tell me more" |
| Tom (P12) | Sahaj → add `silence_retreat` → Part 2 |
| Rahul (P02) / Vikram (P16) | Drifting → gentle check-in about a follow-up nearby (weekend for Rahul) |
| Daniel (P03) | Dormant → teacher call |
| Mei (P04) | Dormant + `community_events` → in person |
| Meera (P13) / Carlos (P14) | Skill tags `cooking` / `music` → kitchen seva / music for satsang |
| Grace (P17) | Practising, with the typed-in skill `photography` on her profile |
| Arjun (P08) | Messaged 2 days ago → Send disabled, "next outreach possible on Nov 15" |
| Emily (P09) | Practising → a follow-up nearby (she has RSVP'd to the Oakville follow-up) |
| Omar (P18) | Drifting + `no_car`/`online_ok` → online follow-up |

The demo script is in [concept.md](concept.md).

---

## H. Demo data

All of it is dummy data except `courses.json`. Details and personas are in [DATA_README.md](../data/DATA_README.md).

| File | What was added or changed for this spec |
|---|---|
| `cohorts.json` (new) | 8 course channels: teacher, course end date, join code and members. Every participant is in exactly one. |
| `chat.json` (new) | 19 channel messages: welcomes, a few questions and answers, event announcements. |
| `rsvps.json` (new) | 6 RSVPs to real follow-ups and to community events. |
| `seva_opportunities.json` | `signed_up_count` and `signed_up_ids` next to `spots` (people needed). One seva is full. |
| `participants.json` | `settings` removed, including the practice-sharing switch. Part 1 dates aligned so people share a course channel. Vikram is now drifting; Grace has a full profile with a typed-in skill. |
| `practice_logs.json` | Priya has 34 of the last 40 days, Tom and Neha 37. Tom has already practised on the demo date, so Priya's channel goes from 1 of 4 to 2 of 4 when she logs hers. |
| `messages.json` | Arjun's last message moved to Nov 12, so the 3-day gap is visible. |
| `config.json` | 35-of-40 threshold, 3-day outreach gap, no approval, no quiet hours, no paused or opted-out stages, longer banned-phrase list, `notifications`, `guided_practice`, `reports`, extra skill tags. |
| `expected_outcomes.json` | Recomputed for all 18 personas. |

---

## I. Future enhancements (not built in the hackathon)

| # | Enhancement | Notes |
|---|---|---|
| 1 | **Event groups** | When someone RSVPs, they join a group chat for that event to coordinate and ask for help. This builds community inside the app. |
| 2 | **Channels for community and volunteering events** | The same idea for seva: a channel per event or seva opportunity. |
| 3 | **Rides (carpooling)** | For any event or seva: "I'm looking for a ride" or "I'm driving and have space". Riders see drivers nearby on a map and contact them inside the app; they can also be added to the event's group. Contact stays in the app, with no phone numbers shared and only approximate locations. |
| 4 | **Gamification and rewards** | Reward daily and monthly goals and consistency, for example points towards a reward. The design is still open. It should stay private and free of pressure, and any wording about course credit has to be squared with rule 2. |
| 5 | **"Guru" assistant** | A chatbot that answers participants' questions at any time. It has AI guardrails: it answers only from approved Art of Living material, doesn't teach techniques that need a certified teacher, gives no medical advice, and hands over to the teacher when unsure. |
| 6 | **A trained recommendation model** | Today the next step comes from rules. Later, a model can be trained on real journey data and outcomes (who accepted which invitation, who stayed). This needs real, consented data; the dummy data can't train it. The one-sentence reason should stay. |
| 7 | Real push notifications, real sign-in, a database, store builds | Technical follow-ups after the hackathon. |
| 8 | Settings and message controls | Reminder time, pause, opt-out, quiet hours, a choice about sharing practice with the teacher, and an optional approval step were removed for the hackathon. A real launch needs a way for people to stop messages. |
| 9 | Narrower permissions for volunteers | Today they have the same permissions as teachers. |

---

## J. Assumptions to confirm

With a teacher, where it's about Art of Living:
1. All stage thresholds. Next courses: Part 1 → Sahaj or Part 2; Sahaj → Part 2. "Retreat" in the problem statement maps to Part 2.
2. That the chosen recording is the right one for a daily guided practice (D2).
3. Notification triggers, limits and wording (C3).
4. The seva opportunities and community events are invented examples.

Within the team:
5. Invitations count towards the 3-day gap; automatic notifications don't (B6).
6. The course-group count on Daily Practice includes everyone (D2). Since 2026-11-15 it shows the first names of those who practised today.
7. Report group definitions (E5).
8. Smaller ones: fallback stage (B1), demo-mode session length and the one-tap practice button (D2), RSVP not counted as attended (D3), snooze length (E4), thank-you trigger (E6).

## K. Build order

1. Scaffold (A1)
2. Data store and reset (A2, A3, A5), loading all the files in H
3. Stages (B1) + tests
4. Nearby filter, next step with skill matching, reason (B2–B4) + tests
5. Channel, outreach gap and notification rules (B5, B6, C3, C4) + tests
6. Drafter and banned-phrase filter (C1, C2) + tests
7. Participant tabs: Home → Daily Practice → Events → Volunteer → Chat, then sign-up
8. Teacher tabs: Today → People and profile → Reports → Events and invite → Chat, create channel
9. Role switcher and demo run-through (A4, G)
10. README and hosting backup
