# Concept: the agreed design

> Updated on 2026-11-14 from the team's voice notes and decisions. The full feature list is in [features.md](features.md) and the screen sketches are in [ui-draft.md](ui-draft.md). Where this file and `features.md` differ, `features.md` wins.

## The three goals
The app is built around **sadhana** (daily practice), **satsang** (events in good company) and **seva** (volunteering).
- Participant tabs: Home · Daily Practice · Events · Volunteer · Chat.
- Teacher tabs: Today · People · Reports · Events · Chat.

## Decisions already made
| Topic | Decision |
|---|---|
| Hero of the demo | **The participant app.** The teacher view is the second surface. |
| Onboarding | When a course ends, the teacher creates a course channel and adds the participants. Participants download the app and sign up with the channel's code and their postal code. |
| Channels | Follow-up happens **in the app**, with no WhatsApp groups: feed card, push notification, personal in-app message from the teacher, and a course channel in the Chat tab for questions. For dormant people the system suggests a **teacher call** or an **in-person** hello, because push won't reach them. |
| Sending | Messages really are sent in the demo (in-app). |
| Roles | Volunteers have the same permissions as teachers for now (to be restricted later). |
| Courses | From Harmony via the Unity API, filtered to the participant's area (25 km radius) plus online courses. Cached snapshot only. |
| Teacher remarks | Each participant has remarks: **skill and interest tags** (used by the rules and for invitations) and **free text** (used only for message wording). The teacher can pick a skill from the list or type a new one. Hint text: "Interests and practical details only, no health or personal matters." |
| Recommendations | Built from practice days, course history, teacher remarks (skills) and events. Regular practice (35 of the last 40 days) leads to a next course; otherwise the person is invited into the community through an event or seva that fits their skills. They cover **courses, seva, follow-ups and satsangs, daily practice, and re-engagement**. |
| RSVP and sign-up | Participants tap "I'm going" on events and "Sign up" on seva. Seva cards show how many people have signed up out of how many are needed. |
| Notifications | Gentle automatic notifications: welcome, practice note after 3 days without practice, streak milestones, event notes, "people from your course are going", new events nearby, event reminders, a thank-you after seva and course anniversaries. None of them mentions missed days or gaps. The teacher is also told when someone hasn't practised for 3 days, so they can send a personal note. |
| Guided practice | A guided meditation by Gurudev Sri Sri Ravi Shankar, played in the app from YouTube (<https://www.youtube.com/watch?v=TQVbZIfe7Dg>). Finishing it marks the day as done. |
| Gamification | For now: streak, private milestones (7, 21 and 40 practice days) and an anonymous "how many of your course practised today" count. No leaderboards, no points that count toward course fees. Rewards for daily and monthly goals are a future enhancement. |
| Limits | At most 1 personal message from the teacher every 3 days. For the hackathon there are no quiet hours, no pause or opt-out, no Settings screen and no approval step. |
| Data | JSON dummy data plus the real cached courses. No database. |
| Demo | 5 minutes, live. |
| Cut from scope | Eventbrite import. Carpooling, event groups, rewards and the "Guru" assistant are future enhancements (see the end of this file). |

## Journey stages
Stages are checked in this order and the first match wins. Thresholds are in `config.json` and are assumptions.

| Stage | Signals |
|---|---|
| returning | Activity in the last 7 days after a gap of 14 days or more |
| dormant | More than 30 days since the last activity |
| drifting | 14–30 days since the last activity |
| new | 21 days or fewer since Part 1 |
| ready_to_deepen | At least 35 practice days in the last 40, and an eligible next course not yet taken |
| seva_inclined | Tag `seva`, or 3 or more events in 60 days |
| practising | At least 8 practice days in 30, or 1 or more events in 30 days |

**Activity** means a practice log, an event attended, or the app being opened.

## Next step for each stage
- **new** → the practice habit plus the nearest follow-up.
- **practising** → a nearby follow-up or satsang. If a skill tag matches an event or seva (for example `singing`), that one is preferred.
- **ready_to_deepen** → a course from `config.next_courses_after`:
  - If the person has an interest tag, it chooses the course: `meditation` → Sahaj Samadhi; `deeper_practice` or `silence_retreat` → Part 2.
  - Otherwise, the earliest in-person course nearby; if there is none, an online course.
  - Courses starting in fewer than 2 days are skipped.
- **seva_inclined** → a seva opportunity nearby, matched to tags (cooking, music…).
- **drifting / dormant** → re-engagement through the community: a real follow-up or satsang from `courses.json` (`category` follow_up or satsang) or a community event, matched to skill tags where possible. Respect the `weekends_only` and `no_car`/`online_ok` tags.
- **returning** → a welcome back plus a follow-up.

Every recommendation comes with a **one-sentence reason a teacher could say aloud**, e.g. "Priya has practised on 35 of the last 40 days and you noted she's interested in meditation, so we suggest Sahaj Samadhi Meditation in Brampton East on Nov 17."

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
- For each card the teacher can send, edit, choose a different step, snooze, or skip. There is no separate approval step for now: Send delivers the message at once.
- Automatic items: the feed and the notifications listed in `features.md` (C3). They follow the same wording rules as every other message, and every text goes through the banned-phrase filter.
- The teacher gets an alert when a participant hasn't practised for 3 days, with a button to send a personal note.

## Screens
Details are in [features.md](features.md); sketches are in [ui-draft.md](ui-draft.md).

**Participant app (5 tabs):**
1. **Home:** streak, today's practice, the teacher's invitation, the next follow-up with RSVP, seva nearby, milestones.
2. **Daily Practice:** start a guided meditation by Gurudev (the day is marked done when it ends), this week's ticks, and how many of the course group practised today.
3. **Events:** follow-ups, satsangs and community events near the participant's postal code, with filters and an "I'm going" button.
4. **Volunteer:** seva opportunities nearby, with how many have signed up and a "Sign up" button.
5. **Chat:** the course channel and the personal thread with the teacher.

Plus **Sign-up** (course code, postal code, and consent switches). There is no Settings screen in this version.

**Teacher view (5 tabs):**
1. **Today:** who practised today per course, alerts, the "Suggested this week" queue, and "Needs a personal check-in".
2. **People:** each channel's participants with a quick recommendation; tap for the full profile (sadhana, timeline, remarks, recommendation with reason, draft, channel, send). Create a channel and add remarks here.
3. **Reports:** per course, how many are doing their sadhana, not doing it, need support or haven't opened the app, with a suggestion for each person.
4. **Events:** add events and seva, see RSVPs and sign-ups, and invite people by skill.
5. **Chat:** course channels and personal threads.

A role switcher (participant ↔ teacher) makes it easy to move between views during the demo.

## Five-minute demo script
| Time | What we show |
|---|---|
| 0:00–0:40 | The problem: broadcast messages and WhatsApp groups that go quiet. |
| 0:40–1:50 | **Priya (participant):** home screen at 34 of the last 40 days. She marks today's practice → 35. Her Events tab shows real local follow-ups and satsangs, and she taps "I'm going". |
| 1:50–3:20 | **Teacher (Anita):** the dashboard by stage. Priya is now "ready to deepen" → Sahaj Samadhi, with its one-line reason. Add the tag `meditation` and the reason now cites it. Edit the draft and send. Then add `silence_retreat` to Tom → his recommendation switches to Part 2. |
| 3:20–4:10 | **Contrast:** Rahul (drifting) gets a gentle check-in about a weekend follow-up. Daniel (dormant) gets "call him". Arjun was messaged 2 days ago, so Send is disabled until the 3-day gap has passed. Grace's profile shows a skill the teacher typed in. |
| 4:10–4:40 | **Priya** receives the message and taps "Tell me more". Her course channel shows that Tom and Rahul are going to the games night. |
| 4:40–5:00 | How this meets both success criteria, and what a pilot would measure. |

## Unique selling points
1. Next steps that take practice into account (practice, history and notes together).
2. Teacher notes that steer the recommendation.
3. A one-sentence reason for every suggestion.
4. Tone that changes by stage, plus a filter that blocks sales language.
5. The channel matches whether a message can reach the person, including "teacher calls them".
6. A one-tap tracker with private milestones.
7. Privacy built in: no shared phone numbers, contact details only for the assigned teacher, and a filter that keeps every message free of pressure.

## Open assumptions (confirm with a teacher)
- The thresholds. "Ready for a next course" is 35 of the last 40 practice days (team decision).
- Next courses: Part 1 → Sahaj or Part 2; Sahaj → Part 2.
- "Retreat" in the problem statement maps to Part 2.
- The seva opportunities and community events are invented examples.

## Future enhancements (not built in the hackathon)
1. **Event groups:** RSVPing adds the person to a group chat for that event, so people can coordinate and ask for help.
2. **Channels for community and volunteering events.**
3. **Rides:** "I'm looking for a ride" or "I'm driving and have space" for any event or seva, with a map of drivers nearby and contact inside the app.
4. **Gamification:** rewards for daily and monthly goals and for consistency. The design is open; it must stay private and free of pressure.
5. **"Guru" assistant:** a chatbot with AI guardrails that answers participants' questions at any time.
6. **A trained recommendation model:** today the next step comes from rules; later a model can be trained on real journey data.
7. **Settings and message controls:** reminder time, pause, opt-out, quiet hours, a choice about sharing practice with the teacher, and an approval step, which were removed for the hackathon.

## Still to confirm
See section J of [features.md](features.md).
