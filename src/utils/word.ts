const WORD_PATTERN = /^[\p{L}]+(?:[\p{L}'’-]*[\p{L}])?$/u;

export function normaliseWord(value: string): string | null {
  const word = value.trim().replace(/[“”]/g, "").replace(/[.,!?;:()[\]{}]+$/g, "");
  if (!word || word.length > 80 || /:\/\//.test(word) || !WORD_PATTERN.test(word)) return null;
  return word.toLocaleLowerCase();
}
