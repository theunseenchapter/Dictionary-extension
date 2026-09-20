import type { DictionaryEntry } from "../types";

const CACHE_TTL = 1000 * 60 * 60 * 24 * 7;
type Cached = { data: DictionaryEntry; cachedAt: number };
const memoryCache = new Map<string, Cached>();
const pendingLookups = new Map<string, Promise<DictionaryEntry>>();
const offlineBuckets = new Map<string, Promise<Record<string, DictionaryEntry>>>();

function getOfflineBucket(word: string): Promise<Record<string, DictionaryEntry>> {
  const bucket = /^[a-z]{3}/.test(word) ? word.slice(0, 3) : "other";
  const existing = offlineBuckets.get(bucket);
  if (existing) return existing;
  const request = fetch(chrome.runtime.getURL(`data/wordnet-v2/bucket-${bucket}.json`))
    .then((response) => response.ok ? response.json() as Promise<Record<string, DictionaryEntry>> : {})
    .catch(() => ({}));
  offlineBuckets.set(bucket, request);
  return request;
}

function wordForms(word: string): string[] {
  const forms = [word];
  if (word.endsWith("ies") && word.length > 4) forms.push(`${word.slice(0, -3)}y`);
  if (word.endsWith("es") && word.length > 3) forms.push(word.slice(0, -2));
  if (word.endsWith("s") && word.length > 3) forms.push(word.slice(0, -1));
  if (word.endsWith("ing") && word.length > 5) { const stem = word.slice(0, -3); forms.push(stem, `${stem}e`); }
  if (word.endsWith("ed") && word.length > 4) { const stem = word.slice(0, -2); forms.push(stem, `${stem}e`); }
  return [...new Set(forms)];
}

function responseToEntry(payload: unknown, requestedWord: string): DictionaryEntry {
  if (!Array.isArray(payload) || !payload[0] || typeof payload[0] !== "object") throw new Error("No dictionary entry found.");
  const root = payload[0] as Record<string, unknown>;
  const meanings = Array.isArray(root.meanings) ? root.meanings as Array<Record<string, unknown>> : [];
  const firstMeaning = meanings[0];
  const definitions = meanings.flatMap((meaning) => Array.isArray(meaning.definitions)
    ? (meaning.definitions as Array<Record<string, unknown>>).filter((definition) => typeof definition.definition === "string").map((definition) => ({
      definition: definition.definition as string,
      example: typeof definition.example === "string" ? definition.example : undefined
    })) : []).slice(0, 5);
  if (!definitions.length) throw new Error("No dictionary definition found.");
  const phonetics = Array.isArray(root.phonetics) ? root.phonetics as Array<Record<string, unknown>> : [];
  const phonetic = typeof root.phonetic === "string" ? root.phonetic : phonetics.find((item) => typeof item.text === "string")?.text as string | undefined;
  const audio = phonetics.find((item) => typeof item.audio === "string" && item.audio)?.audio as string | undefined;
  const words = (property: "synonyms" | "antonyms") => [...new Set(meanings.flatMap((meaning) => Array.isArray(meaning[property]) ? meaning[property] as string[] : []))].slice(0, 8);
  return { word: typeof root.word === "string" ? root.word : requestedWord, phonetic, audio, partOfSpeech: typeof firstMeaning?.partOfSpeech === "string" ? firstMeaning.partOfSpeech : undefined, definitions, synonyms: words("synonyms"), antonyms: words("antonyms") };
}

export async function lookupDictionary(word: string): Promise<DictionaryEntry> {
  const key = `dictionary:${word}`;
  const inMemory = memoryCache.get(word);
  if (inMemory && Date.now() - inMemory.cachedAt < CACHE_TTL) return inMemory.data;
  const pending = pendingLookups.get(word);
  if (pending) return pending;

  const lookup = fetchAndCache(word, key);
  pendingLookups.set(word, lookup);
  try { return await lookup; } finally { pendingLookups.delete(word); }
}

async function fetchAndCache(word: string, key: string): Promise<DictionaryEntry> {
  const local = chrome.storage?.local;
  const cached = local ? await new Promise<Cached | undefined>((resolve) => local.get(key, (items) => resolve(items[key] as Cached | undefined))) : undefined;
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    memoryCache.set(word, cached);
    return cached.data;
  }
  let offlineEntry: DictionaryEntry | undefined;
  for (const form of wordForms(word)) {
    const entries = await getOfflineBucket(form);
    if (entries[form]) { offlineEntry = entries[form]; break; }
  }
  if (offlineEntry) {
    memoryCache.set(word, { data: offlineEntry, cachedAt: Date.now() });
    return offlineEntry;
  }
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
  if (!response.ok) throw new Error(response.status === 404 ? "This word was not found in the dictionary." : "Dictionary service is temporarily unavailable.");
  const data = responseToEntry(await response.json(), word);
  const entry = { data, cachedAt: Date.now() };
  memoryCache.set(word, entry);
  if (local) await new Promise<void>((resolve) => local.set({ [key]: entry }, resolve));
  return data;
}
