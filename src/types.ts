export interface DictionaryDefinition {
  definition: string;
  example?: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  audio?: string;
  partOfSpeech?: string;
  definitions: DictionaryDefinition[];
  synonyms: string[];
  antonyms: string[];
}

export interface LookupRecord {
  word: string;
  context: string;
  lookedUpAt: string;
}

export interface Settings {
  enabled: boolean;
  theme: "system" | "light" | "dark";
  apiFallback: boolean;
  historyEnabled: boolean;
  maxHistory: number;
  /** Number of seconds the definition panel remains visible; 0 disables auto-close. */
  autoCloseDelaySeconds: number;
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  theme: "light",
  apiFallback: false,
  historyEnabled: true,
  maxHistory: 100,
  autoCloseDelaySeconds: 10
};
