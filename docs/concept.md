# Concept: the agreed design

## Decisions already made
| Topic | Decision |
|---|---|
| Hero of the demo | **The participant app.** The teacher view is the second surface. |
| Onboarding | After the course, participants download the app and sign up, joining their course group with a code from the teacher. |
| Channels | Follow-up happens **in the app**, with no WhatsApp groups: feed card, push notification, personal in-app message from the teacher. For dormant people the system suggests a **teacher call** or an **in-person** hello, because push won't reach them. |
| Sending | Messages really are sent in the demo (in-app). |
| Roles | Volunteers have the same permissions as teachers for now (to be restricted later). |
| Courses | From Harmony via the Unity API, filtered to the participant's area (25 km radius) plus online courses. Cached snapshot only. |
| Teacher notes | Each participant can have notes with **tags** (used by the rules) and **free text** (used only for message wording). Hint text: "Interests and practical details only, no health or personal matters." |
| Recommendations | Built from practice days, course history, teacher notes and events. They cover **courses, seva opportunities, follow-ups and satsangs, and re-engagement**. |
| Gamification | Private milestones only (7, 21 and 40 practice days). No leaderboards, no points that count toward course fees. |
| Limits | At most 1 outreach every 14 days, quiet hours from 21:00 to 08:00, pause and opt-out. |
| Data | JSON dummy data plus the real cached courses. No database. |
| Demo | 5 minutes, live. |
| Cut from scope | Eventbrite import, carpooling, "Guru assistant", course-fee points. |

## Journey stages
Stages are checked in this order and the first match wins. Thresholds are in `config.json` and are assumptions.

| Stage | Signals |
|---|---|
| opted_out / paused | Participant settings |
| returning | Activity in the last 7 days after a gap of 14 days or more |
| dormant | More than 30 days since the last activity |
| drifting | 14–30 days since the last activity |
| new | 21 days or fewer since Part 1 |
| ready_to_deepen | At least 20 practice days in the last 30, and an eligible next course not yet taken |
| seva_inclined | Tag `seva`, or 3 or more events in 60 days |
| practising | At least 8 practice days in 30, or 1 or more events in 30 days |

**Activity** means a practice log (only if shared with the teacher), an event attended, or the app being opened.

## Next step for each stage
- **new** → the practice habit plus the nearest follow-up.
- **practising** → a nearby follow-up or satsang.
- **ready_to_deepen** → a course from `config.next_courses_after`:
  - If the person has an interest tag, it chooses the course: `meditation` → Sahaj Samadhi; `deeper_practice` or `silence_retreat` → Part 2.
  - Otherwise, the earliest in-person course nearby; if there is none, an online course.
  - Courses starting in fewer than 2 days are skipped.
- **seva_inclined** → a seva opportunity nearby, matched to tags (cooking, music…).
- **drifting / dormant** → re-engagement: a real follow-up or satsang from `courses.json` (`category` follow_up or satsang). Respect the `weekends_only` and `no_car`/`online_ok` tags.
- **returning** → a welcome back plus a follow-up.

Every recommendation comes with a **one-sentence reason a teacher could say aloud**, e.g. "Priya has practised on 20 of the last 30 days and you noted she's interested in meditation, so we suggest Sahaj Samadhi Meditation in Brampton East on Nov 17."

## Messages
- **Inputs:** first name, last course and how long ago, practice count (used only as appreciation), teacher's first name, the recommended item with date and place, the stage's tone, the teacher's note text.
- **Rules:** at most 4 sentences, signed by the teacher, always an easy way to decline, run through the banned-phrase filter, and never mention price, missed days or inactivity.
- **Tone by stage:**
  - new: a warm welcome
  - practising: light and friendly
  - ready to deepen: a personal invitation
  - seva: "we'd love your help"
  - drifting: a gentle check-in with no ask
  - dormant: "thinking of you, the door is open"
  - returning: "lovely to see you", with no mention of the gap

## Channels
Defaults are in `config.channels`:
- new → feed card
- practising → feed card + push
- ready / seva / drifting / returning → in-app message from the teacher
- dormant → teacher call

**Overrides:**
- push disabled, or no app open for 30 days, or tag `prefers_call` → teacher call
- dormant with tag `community_events` → in person

## Teacher in the loop
- The **"Suggested this week"** queue shows cards with the stage, the next step and its reason, the draft, and the channel.
- For each card the teacher can approve and send, edit, choose a different step, snooze, or skip.
- No outreach goes out without approval. Only reminders the participant set themselves and the feed are automatic.

## Screens
**Participant app:**
1. **Sign-up:** course code, area or postal code, consent switches.
2. **Home:** a one-tap "I did my practice" button, streak and day count, milestones, and a "Your next step" card.
3. **Near me:** courses, follow-ups, satsangs, community events and seva, nearest first, with a filter for other locations and online.
4. **Messages:** notes from the teacher, with replies.
5. **Settings:** reminder time, pause, opt-out, and the practice-sharing switch.

**Teacher view:**
1. **Dashboard:** how many people are in each stage, plus "Needs a personal check-in".
2. **Participant page:** timeline (courses, events, practice heat-map), notes and tags, recommendation with reason, draft, channel, approve.
3. **Add a seva opportunity or event.**

A role switcher (participant ↔ teacher) makes it easy to move between views during the demo.

## Five-minute demo script
| Time | What we show |
|---|---|
| 0:00–0:40 | The problem: broadcast messages and WhatsApp groups that go quiet. |
| 0:40–1:50 | **Priya (participant):** home screen at 19 days. Tap "I did my practice" → 20 days. Her "Near me" list shows real local courses and follow-ups. |
| 1:50–3:20 | **Teacher (Anita):** the dashboard by stage. Priya is now "ready to deepen" → Sahaj Samadhi, with its one-line reason. Add the tag `meditation` and the reason now cites it. Edit the draft, approve, send. Then add `silence_retreat` to Tom → his recommendation switches to Part 2. |
| 3:20–4:10 | **Contrast:** Rahul (drifting) gets a gentle check-in about a weekend follow-up. Daniel (dormant) gets "call him". Arjun is blocked by the 14-day limit. Emily's practice isn't shared. |
| 4:10–4:40 | **Priya** receives the message and taps "Tell me more". **Vikram's** paused setting is honoured. |
| 4:40–5:00 | How this meets both success criteria, and what a pilot would measure. |

## Unique selling points
1. Next steps that take practice into account (practice, history and notes together).
2. Teacher notes that steer the recommendation.
3. A one-sentence reason for every suggestion.
4. Tone that changes by stage, plus a filter that blocks sales language.
5. The channel matches whether a message can reach the person, including "teacher calls them".
6. A one-tap tracker with private milestones.
7. Privacy built in: no shared phone numbers, pause and opt-out, the 14-day limit, consent to share practice.

## Open assumptions (confirm with a teacher)
- The thresholds, especially 20 of 30 practice days.
- Next courses: Part 1 → Sahaj or Part 2; Sahaj → Part 2.
- "Retreat" in the problem statement maps to Part 2.
- The seva opportunities and community events are invented examples.
