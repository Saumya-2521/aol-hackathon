// Banned-phrase filter (features.md C2). Pure: safe to use on the server and in the app.
// Whole words and phrases, case-insensitive, straight and curly apostrophes treated alike.

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const norm = (s: string) => s.replace(/[‘’]/g, "'");

export function bannedIn(text: string, banned: string[]): string[] {
  const t = norm(text);
  return banned.filter((b) => new RegExp('(^|[^a-z])' + esc(norm(b)) + '($|[^a-z])', 'i').test(t));
}

// Sentences in a message, not counting the signature ("- Anita").
export function sentenceCount(text: string): number {
  return norm(text)
    .replace(/\s*[-–—]\s*[A-Z][a-z]+\s*$/, '')
    .split(/[.!?]+(?:\s+|$)/)
    .filter((x) => x.trim()).length;
}

export type Check = { ok: boolean; banned: string[]; sentences: number };

export function checkMessage(text: string, banned: string[], maxSentences: number): Check {
  const b = bannedIn(text, banned);
  const n = sentenceCount(text);
  return { ok: b.length === 0 && n <= maxSentences && text.trim().length > 0, banned: b, sentences: n };
}
