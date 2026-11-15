# UI draft: screen sketches

Rough layouts for discussion, not final designs. There is no Settings screen in this version. Features and rules are in [features.md](features.md); the letters in brackets point to its sections. Names and numbers are examples.

## Participant app

Bottom tabs: **Home · Practice · Events · Volunteer · Chat**

### Home (D1)
```
┌──────────────────────────────┐
│ Good morning, Priya          │
│                              │
│ ┌──────────────────────────┐ │
│ │ 🔥 9-day streak          │ │
│ │ 34 of the last 40 days   │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Today's sadhana          │ │
│ │ Not done yet   [ Start ] │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ ✉ From Anita             │ │  ← only when the teacher
│ │ Sahaj Samadhi, Nov 17    │ │    has sent an invitation
│ │ [Tell me more][Not now]  │ │
│ └──────────────────────────┘ │
│ Next follow-up               │
│ ┌──────────────────────────┐ │
│ │ Weekly SKY follow-up     │ │
│ │ Thu Nov 19 · 7:00 PM     │ │
│ │ Mississauga · 3 km       │ │
│ │            [ I'm going ] │ │
│ └──────────────────────────┘ │
│ Seva near you          See all│
│ ┌────────────┐┌────────────┐ │
│ │ Welcome    ││ Set-up and │ │
│ │ desk Nov 21││ tea Nov 19 │ │
│ └────────────┘└────────────┘ │
│ Milestones  ●7  ○21  ○40     │
├──────────────────────────────┤
│ Home Practice Events Vol Chat│
└──────────────────────────────┘
```

### Daily Practice (D2)
```
┌──────────────────────────────┐
│ Daily practice               │
│                              │
│   ┌──────────────────────┐   │
│   │  ▶ Start guided      │   │
│   │     meditation       │   │
│   │  with Gurudev        │   │
│   └──────────────────────┘   │
│   I practised on my own  ✓   │
│                              │
│ This week                    │
│  M   T   W   T   F   S   S   │
│  ✓   ✓   ✓  (●)  ○   ○   ○   │  ← today highlighted,
│                              │    no crosses for empty days
│ Your course group today      │
│ ┌──────────────────────────┐ │
│ │ 2 of 4 practised today   │ │  ← a count only, no names
│ │ █████████░░░░░░░░░       │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```
The guided session plays the team's chosen recording of Gurudev Sri Sri Ravi Shankar from YouTube. After it ends: "Done for today 🙏", the tick appears, and the streak updates.

### Events (D3)
```
┌──────────────────────────────┐
│ Events near L5B              │
│ (All)(Follow-ups)(Satsangs)  │
│ (Community)(Online)          │
│ ┌──────────────────────────┐ │
│ │ FOLLOW-UP                │ │
│ │ Weekly SKY follow-up     │ │
│ │ Thu, Nov 19 · 7:00 PM    │ │
│ │ Mississauga · 3 km       │ │
│ │            [ I'm going ] │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ COMMUNITY                │ │
│ │ Community games night    │ │
│ │ Sat, Nov 28 · 6:30 PM    │ │
│ │ Mississauga · 3 km       │ │
│ │            [✓ Going    ] │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### Volunteer (D4)
```
┌──────────────────────────────┐
│ Seva near L5B                │
│ ┌──────────────────────────┐ │
│ │ Kitchen seva for the     │ │
│ │ community potluck        │ │
│ │ Sat, Dec 5 · Mississauga │ │
│ │ 0 km                     │ │
│ │ █████░░░  3 of 5 signed up│ │
│ │              [ Sign up ] │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### Chat (D5)
```
┌──────────────────────────────┐   ┌──────────────────────────────┐
│ Chat                         │   │ ‹ Part 1 · Sept 2026         │
│ ┌──────────────────────────┐ │   │                              │
│ │ # Part 1 · Sept 2026     │ │   │ Lucas: Is it fine to         │
│ │ Anita: See you Thursday… │ │   │ practise in the evening?     │
│ └──────────────────────────┘ │   │                              │
│ ┌──────────────────────────┐ │   │      Anita (teacher): Yes…   │
│ │ Anita (your teacher)   ● │ │   │                              │
│ │ I thought of you for…    │ │   │ ┌──────────────────────┐ [➤] │
│ └──────────────────────────┘ │   │ │ Ask a question…      │     │
└──────────────────────────────┘   └──────────────────────────────┘
```
First names only. No phone numbers or emails.

---

## Teacher view

Bottom tabs on the phone (side menu on the web): **Today · People · Reports · Events · Chat**

### Today (E2)
```
┌──────────────────────────────────────────────┐
│ Today · Sat, Nov 14                 Anita ▾  │
│                                              │
│ Practised today                              │
│ ┌────────────────────┐┌────────────────────┐ │
│ │ Part 1 · Sep 2026  ││ Part 1 · Oct 2025  │ │
│ │ 2 of 4             ││ 1 of 1             │ │
│ │                    ││                    │ │
│ └────────────────────┘└────────────────────┘ │
│                                              │
│ A personal note might help               (2) │
│ ┌──────────────────────────────────────────┐ │
│ │ Jack · no practice logged in 3 days      │ │
│ │                  [ Send a personal note ]│ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ Suggested this week                      (5) │
│ ┌──────────────────────────────────────────┐ │
│ │ Priya · Ready to deepen                  │ │
│ │ → Sahaj Samadhi, Brampton East, Nov 17   │ │
│ │ "Practised 35 of 40 days and you noted   │ │
│ │  she's interested in meditation."        │ │
│ │ Draft: Hi Priya, …                       │ │
│ │ via personal message                     │ │
│ │ [Send]  [Edit]  [Other step]  [Later]    │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ Arjun · Practising                       │ │
│ │ Next outreach possible on Nov 15   [ — ] │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ Needs a personal check-in                (2) │
│  Daniel · call      Mei · say hello in person│
└──────────────────────────────────────────────┘
```

### People (E3): list with a quick recommendation
```
┌──────────────────────────────────────────────┐
│ People     [ Part 1 · Sept ▾ ] [ + Channel ] │
│ ┌──────────────────────────────────────────┐ │
│ │ Priya S.    🔥5   Ready to deepen        │ │
│ │ → Invite to Sahaj Samadhi              › │ │
│ ├──────────────────────────────────────────┤ │
│ │ Rahul M.          Drifting               │ │
│ │ → Weekend follow-up nearby             › │ │
│ ├──────────────────────────────────────────┤ │
│ │ Meera K.    🔥2   Seva-inclined · cooking│ │
│ │ → Kitchen seva                         › │ │
│ ├──────────────────────────────────────────┤ │
│ │ Vikram P.         Drifting               │ │
│ │ → Follow-up nearby                     › │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Participant profile (E3, E4)
```
┌──────────────────────────────────────────────┐
│ ‹ Priya Sharma · Mississauga                 │
│ Ready to deepen · Part 1, Sept 20            │
│ ✉ priya…@example.com  ☎ 416-555-01xx         │  ← assigned teacher only
│                                              │
│ Sadhana    🔥 10-day streak · 35 of 40 days  │
│ ▢▣▣▢▣▣▣▢▣▣▣▣▢▣▣▣▢▣▣▣▣▢▣▣▢▣▣▣▣▣  (heat-map)   │
│                                              │
│ Next step                                    │
│ Sahaj Samadhi Meditation · Brampton East     │
│ "Priya has practised on 35 of the last 40…"  │
│ Draft  [ Hi Priya, …                 ] ✎     │
│ via personal message                         │
│ [Send] [Edit] [Other step] [Later] [Skip]    │
│                                              │
│ Remarks                                      │
│ Skills: (meditation) (+ add)                 │
│ Note: Asked how to go deeper with meditation │
│                                              │
│ Timeline                                     │
│ Nov 2  Weekly follow-up · attended           │
│ Oct 5  Message from Anita · read             │
│ Sep 20 Part 1 completed                      │
└──────────────────────────────────────────────┘
```

### Create a channel and add remarks (E1)
```
┌──────────────────────────────────────────────┐
│ New course channel                           │
│ Course  [ Part 1 ▾ ]   Ended [ Nov 8, 2026 ] │
│ Name    [ Part 1 · Nov 2026              ]   │
│ Join code   SKY-4821                         │
│                                              │
│ Participants                         [+ Add] │
│ ┌──────────────────────────────────────────┐ │
│ │ Aisha                                    │ │
│ │ Skills: (music)(cooking)(+ type a skill) │ │
│ │ Note: [ Free on weekends             ]   │ │
│ └──────────────────────────────────────────┘ │
│ Interests and practical details only,        │
│ no health or personal matters. A skill that  │
│ isn't in the list can be typed in.           │
│                           [ Create channel ] │
└──────────────────────────────────────────────┘
```

### Reports (E5)
```
┌──────────────────────────────────────────────┐
│ Reports            [ Part 1 · Sept 2026 ▾ ]  │
│ ┌────────┐┌────────┐┌────────┐┌────────┐     │
│ │ Doing  ││ Not    ││ Need   ││ Haven't│     │
│ │ sadhana││ doing  ││ support││ opened │     │
│ │   9    ││   5    ││   3    ││   2    │     │
│ └────────┘└────────┘└────────┘└────────┘     │
│                                              │
│ Name     Group          Suggested next step  │
│ Priya    Doing sadhana  Sahaj Samadhi      › │
│ Rahul    Need support   Weekend follow-up  › │
│ Daniel   Need support   Call him           › │
│ Meera    Doing sadhana  Kitchen seva       › │
└──────────────────────────────────────────────┘
```

### Events: add and invite (E6)
```
┌──────────────────────────────────────────────┐
│ Events & seva           [ + Event ][ + Seva ]│
│ ┌──────────────────────────────────────────┐ │
│ │ Community potluck and satsang · Dec 5    │ │
│ │ 6 going                                  │ │
│ │ People who might enjoy this:             │ │
│ │ ☐ Carlos · music   ☐ Meera · cooking     │ │
│ │                    [ Invite selected ]   │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ Kitchen seva · Dec 5 · 3 of 5 signed up  │ │
│ │ [ Invite ]            [ Mark complete ]  │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```
"Invite selected" opens a draft for each person, which the teacher can edit and send. "Mark complete" sends the thank-you note to everyone who signed up.

### Chat (E7)
The same layout as the participant's Chat: the teacher's course channels, then personal threads.
