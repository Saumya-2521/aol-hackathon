# Demo data: Art of Living follow-up MVP

Plain JSON files. The app loads them at startup, so no database is needed.
**Everything except `courses.json` is dummy data.** All people, emails and phone numbers are fictional: emails use `example.com` and phone numbers use the 555-01xx range.

## Files

| File | What it holds | Source |
|---|---|---|
| `courses.json` | 228 courses, follow-ups, satsangs and events across Canada | Real: a cached snapshot of the 4 Unity API responses you shared, cut down |
| `participants.json` | 18 participants in the GTA | Dummy |
| `practice_logs.json` | Dates of logged home practice for each participant | Dummy |
| `teachers.json` | 3 teachers + 1 volunteer | Dummy |
| `cohorts.json` | 8 course channels: teacher, course end date, join code, members | Dummy |
| `chat.json` | Messages in the course channels | Dummy |
| `rsvps.json` | "I'm going" RSVPs to follow-ups and community events | Dummy |
| `seva_opportunities.json` | 7 seva opportunities entered in the app, with how many people are needed and have signed up | Dummy |
| `community_events.json` | 5 community events entered in the app (games night, satsang, full moon meditation…) | Dummy |
| `messages.json` | Personal messages from teachers (used for the timeline and the 3-day outreach gap) | Dummy |
| `config.json` | Thresholds, stage order, course type codes, channel rules, banned phrases, notifications, guided practice | Assumptions and team decisions, editable |
| `expected_outcomes.json` | The stage, next step and channel each participant should get | Stages recomputed on 2026-11-14 |

## Key rules

- **"Today" is fixed at `config.demo_today` = 2026-11-14.** Every date is set relative to it, so the stages stay correct whatever day you present. Use this date wherever the app needs "now".
- **Courses snapshot:**
  - Personal contact fields (teacher and organizer names, emails, phones) and every fee field were removed.
  - `category` comes from the `mctype` codes in `config.course_categories`.
  - `follow_up` (mctype 1006/1018) and `satsang` (1008) are real weekly sessions. Use them for re-engagement suggestions.
- **Times:**
  - `start_date_utc` is in UTC.
  - The `sessions[].start` times appear to have been stored as Toronto local time even for courses outside Ontario. Render everything in `America/Toronto` and show `timing_text` (e.g. "Fri : 07:30 PM - 09:30 PM") as the human-readable schedule.
  - For a recurring follow-up with no `sessions`, `start_date_utc` is its next occurrence.
- **Nearby:**
  - Use the straight-line distance from the participant's `home_lat`/`home_lng` to the item's `lat`/`lng`. The radius is `config.nearby_radius_km` (25 km).
  - Online items (`is_online: true`) are shown to everyone.
  - Skip courses whose registration is closed or full, and courses starting in fewer than `min_days_notice_for_courses` days.
- **Ready for a next course:** at least `stages.ready_min_practice_days` (35) practice days in the last `stages.ready_window_days` (40), counting today.
- **Course channels (`cohorts.json`):**
  - Every participant is in exactly one channel, the one for their Part 1 course. The channel's `course_ended_on` equals the participant's Part 1 `completed_on`.
  - A channel with one member stands for a course whose other participants aren't in the demo data.
  - "X of Y practised today" counts the channel's members. On the demo date only Tom has practised so far, so Priya's channel shows 1 of 4, then 2 of 4 once she logs hers.
- **RSVPs (`rsvps.json`):** `item_type` is `course` (an `id` in `courses.json`) or `community_event` (an `id` in `community_events.json`). An RSVP is not attendance.
- **Seva:** `spots` is how many people are needed. `signed_up_count` is the total signed up, and `signed_up_ids` lists the demo personas among them. S7 is full.
- **Event tags:** `community_events.json` has a `tags` list on each event (added 2026-11-15, **ASSUMPTION**). They are matched to participants' skill tags for "People who might enjoy this" and for skill-based next steps.
- **Skills:** tags on `teacher_notes`. `config.tag_vocabulary` is a list of suggestions; a teacher can type any other skill (Grace has `photography`).
- **Outreach gap:** at most one personal teacher message per person every `outreach.min_days_between_outreach` (3) days, counted from `messages.json`.
- **Privacy:**
  - Participants are stored by area centroid and postal FSA only, never a street address.
  - `contact` is visible only to the assigned teacher.
  - A participant's practice logs are visible to their own teacher. People in the same course channel see only the first names of those who have practised today (team decision, 2026-11-15). The practice-sharing switch was removed for the hackathon.
  - There is no `settings` object any more. Pause, opt-out and reminder time were removed for the hackathon.
- **Refreshing the course data:** if you need fresher courses before the demo, make **3 calls once**, one each for Part 1, Part 2 and Sahaj. Rebuild `courses.json` with the same fields, and move `demo_today` to the refresh date. Never poll the API from the app.

## Personas

| ID | Name | Area | Channel | Stage | Expected next step | How it reaches them |
|---|---|---|---|---|---|---|
| P01 | Priya | Mississauga | CH1 | practising (34 of 40 days) | Live demo: logging today → 35 → **ready to deepen** → Sahaj Samadhi | feed → in-app message |
| P02 | Rahul | Etobicoke | CH1 | drifting (20 days quiet) | Weekend follow-up nearby | in-app message |
| P03 | Daniel | Scarborough | CH3 | dormant (54 days) | Re-engagement | teacher call |
| P04 | Mei | North York | CH3 | dormant (40 days) | Community event or satsang | in person |
| P05 | Aisha | Brampton | CH7 | new | Practice habit + nearest follow-up | feed card |
| P06 | Lucas | Downtown | CH5 | new | Practice habit + nearest follow-up | feed card |
| P07 | Sofia | Vaughan | CH7 | new | Practice habit + nearest follow-up | feed card |
| P08 | Arjun | Markham | CH6 | practising | Follow-up; **messaged 2 days ago, so the 3-day gap is active** | — |
| P09 | Emily | Oakville | CH6 | practising | Follow-up (she has RSVP'd to the Oakville one) | feed + push |
| P10 | Kwame | Midtown | CH4 | practising | Follow-up or satsang | feed + push |
| P11 | Neha | Brampton | CH8 | ready to deepen (37 of 40) | **Part 2** (Sahaj already done, asked about it) | in-app message |
| P12 | Tom | Etobicoke | CH1 | ready to deepen (37 of 40, already practised today) | Sahaj; add the tag `silence_retreat` → switches to **Part 2** | in-app message |
| P13 | Meera | Mississauga | CH2 | seva-inclined | Kitchen seva (tag `cooking`) | in-app message |
| P14 | Carlos | North York | CH3 | seva-inclined | Music for satsang (tag `music`) | in-app message |
| P15 | Hannah | Leslieville | CH3 | returning | Welcome back + follow-up | in-app message |
| P16 | Vikram | Mississauga | CH1 | drifting (25 days quiet) | Follow-up or satsang nearby | in-app message |
| P17 | Grace | Oakville | CH6 | practising | Follow-up; has the typed-in skill `photography` | feed + push |
| P18 | Omar | Scarborough | CH4 | drifting (16 days) | **Online** follow-up (tags `no_car`, `online_ok`) | in-app message |

## What changed on 2026-11-14

After the team's decisions, the dummy data was adjusted so that it still tells the same stories:
- **Threshold:** Priya, Tom and Neha's recent practice logs were filled in to fit the 35-of-40 rule.
- **Course channels:** some Part 1 dates were aligned so that people share a course (Rahul, Tom and Vikram with Priya; Daniel, Mei and Carlos with Hannah; Omar with Kwame; Arjun with Emily; Aisha with Sofia). Practice logs and events from before the new course date were removed for Rahul, Tom, Vikram and Daniel.
- **Vikram** was "paused" and is now drifting. **Grace** was "opted out" with an empty record and now has a full profile.
- **Arjun's** last message moved from Nov 9 to Nov 12, so the 3-day gap still blocks him.
- All 18 stages were re-checked with a reference script. The next steps for Vikram and Grace are descriptive and need checking against `courses.json` when the engine is built.

## Assumptions to confirm with a teacher
1. All thresholds in `config.stages`.
2. `config.next_courses_after`: Part 1 → Sahaj Samadhi or Part 2, and Sahaj → Part 2.
3. Mapping the problem statement's "retreat" to Art of Living Part 2.
4. The seva opportunities and community events are invented examples. Replace them with real local ones if you have them.
5. The notification triggers and wording in `config.notifications`.
6. That the recording in `config.guided_practice` is the right one for a daily guided practice.
