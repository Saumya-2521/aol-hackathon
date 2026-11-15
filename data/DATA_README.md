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
| `seva_opportunities.json` | 7 seva opportunities entered in the app | Dummy |
| `community_events.json` | 5 community events entered in the app (games night, satsang, full moon meditation…) | Dummy |
| `messages.json` | Outreach history (used for the timeline and the 14-day limit) | Dummy |
| `config.json` | Thresholds, stage order, course type codes, channel rules, banned phrases | Assumptions, editable |
| `expected_outcomes.json` | The stage, next step and channel each participant should get | Computed and verified |

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
  - Use the haversine distance from the participant's `home_lat`/`home_lng` to the course's `lat`/`lng`. The radius is `config.nearby_radius_km` (25 km).
  - Online courses (`is_online: true`) are shown to everyone.
  - Skip courses whose registration is closed or full, and courses starting in fewer than `min_days_notice_for_courses` days.
- **Privacy:**
  - Participants are stored by area centroid and postal FSA only, never a street address.
  - `contact` is visible only to the assigned teacher.
  - If `share_practice_with_teacher` is false, the teacher view must hide that person's practice logs.
  - An opted-out participant keeps only the minimum needed to honour the opt-out.
- **Refreshing the course data:** if you need fresher courses before the demo, make **3 calls once**, one each for Part 1, Part 2 and Sahaj. Rebuild `courses.json` with the same fields, and move `demo_today` to the refresh date. Never poll the API from the app.

## Personas: one for each stage

| ID | Name | Area | Stage | Expected next step | Channel |
|---|---|---|---|---|---|
| P01 | Priya | Mississauga | practising (19/30 days) | Live demo: logging today → **ready to deepen** → Sahaj Samadhi | feed → in-app message |
| P02 | Rahul | Etobicoke | drifting (20 days quiet) | Weekend follow-up nearby | in-app message |
| P03 | Daniel | Scarborough | dormant (54 days) | Re-engagement | teacher call |
| P04 | Mei | North York | dormant (40 days) | Community event or satsang | in person |
| P05–P07 | Aisha, Lucas, Sofia | Brampton, Downtown, Vaughan | new | Practice habit + nearest follow-up | feed card |
| P08 | Arjun | Markham | practising | Follow-up; **14-day limit is active** | — |
| P09 | Emily | Oakville | practising | Follow-up; **practice not shared** | feed + push |
| P10 | Kwame | Midtown | practising | Follow-up or satsang | feed + push |
| P11 | Neha | Brampton | ready to deepen | **Part 2** (Sahaj already done, asked about it) | in-app message |
| P12 | Tom | Etobicoke | ready to deepen | Sahaj; add the tag `silence_retreat` → switches to **Part 2** | in-app message |
| P13 | Meera | Mississauga | seva-inclined | Kitchen seva (tag `cooking`) | in-app message |
| P14 | Carlos | North York | seva-inclined | Music for satsang (tag `music`) | in-app message |
| P15 | Hannah | Leslieville | returning | Welcome back + follow-up | in-app message |
| P16 | Vikram | Mississauga | paused until Dec 10 | Nothing | — |
| P17 | Grace | Oakville | opted out | Nothing | — |
| P18 | Omar | Scarborough | drifting (16 days) | **Online** follow-up (tags `no_car`, `online_ok`) | in-app message |

## Assumptions to confirm with a teacher
1. All thresholds in `config.stages`, especially 20 practice days in the last 30 for "ready to deepen".
2. `config.next_courses_after`: Part 1 → Sahaj Samadhi or Part 2, and Sahaj → Part 2.
3. Mapping the problem statement's "retreat" to Art of Living Part 2.
4. The seva opportunities and community events are invented examples. Replace them with real local ones if you have them.
