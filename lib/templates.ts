// Wording shared by the server's draft writer and the invite sheet. Pure and client-safe.
// Checked against CLAUDE.md rule 2: warm, easy to decline, no price, missed days or urgency.
export type InviteTarget = { kind: string; title: string; day: string; place: string };

export function inviteText(first: string, item: InviteTarget, teacherFirst: string): string {
  if (item.kind === 'practice') return `Hi ${first}, just a little note to say that even a few quiet minutes of practice are worth it. Wishing you a peaceful week. No need to reply. - ${teacherFirst}`;
  const tail = item.kind === 'seva' ? 'We’d love your help if you feel like it.' : item.kind === 'course' ? 'If you’d like to know more, just say so.' : 'It would be lovely to have you there.';
  return `Hi ${first}, I thought of you for ${item.title} on ${item.day} ${item.place}. ${tail} Please feel free to say no. - ${teacherFirst}`;
}
