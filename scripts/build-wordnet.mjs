/** Convert official WordNet dictionary files into ContextWord's compact offline format. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve(process.argv[2] ?? "vendor/WordNet-3.0/dict");
const destination = resolve("public/data/wordnet-v2");
const partOfSpeech = { n: "noun", v: "verb", a: "adjective", s: "adjective", r: "adverb" };
const dictionary = new Map();

for (const file of ["data.noun", "data.verb", "data.adj", "data.adv"]) {
  const contents = await readFile(resolve(source, file), "utf8");
  for (const line of contents.split("\n")) {
    if (!line || line.startsWith("  ") || !line.includes(" | ")) continue;
    const [metadata, gloss] = line.split(" | ", 2);
    const fields = metadata.trim().split(/\s+/);
    const type = fields[2];
    const count = Number.parseInt(fields[3], 16);
    if (!partOfSpeech[type] || !Number.isFinite(count)) continue;
    const words = [];
    for (let index = 0; index < count; index += 1) words.push(fields[4 + index * 2].replaceAll("_", " "));
    const definition = gloss.split(";", 1)[0].trim();
    if (!definition || !words.length) continue;
    for (const word of words) {
      const key = word.toLocaleLowerCase();
      const entry = dictionary.get(key) ?? { word: key, definitions: [], synonyms: new Set() };
      if (!entry.definitions.some((item) => item.definition === definition)) entry.definitions.push({ definition, partOfSpeech: partOfSpeech[type] });
      for (const synonym of words) if (synonym !== word) entry.synonyms.add(synonym);
      dictionary.set(key, entry);
    }
  }
}

const buckets = new Map();
for (const [key, entry] of dictionary) {
  const bucket = /^[a-z]{3}/.test(key) ? key.slice(0, 3) : "other";
  const entries = buckets.get(bucket) ?? {};
  entries[key] = {
    word: entry.word,
    partOfSpeech: entry.definitions[0]?.partOfSpeech,
    definitions: entry.definitions.slice(0, 5).map(({ definition }) => ({ definition })),
    synonyms: [...entry.synonyms].slice(0, 8),
    antonyms: []
  };
  buckets.set(bucket, entries);
}
await mkdir(destination, { recursive: true });
for (const [bucket, entries] of buckets) await writeFile(resolve(destination, `bucket-${bucket}.json`), JSON.stringify(entries));
console.log(`Wrote ${dictionary.size} offline dictionary entries to ${destination}`);
