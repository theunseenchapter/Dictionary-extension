import { DEFAULT_SETTINGS, type LookupRecord, type Settings } from "../types";

const volatileStore: Record<string, unknown> = {};

const get = <T>(key: string): Promise<T | undefined> => new Promise((resolve, reject) => {
  const local = globalThis.chrome?.storage?.local;
  if (!local) { resolve(volatileStore[key] as T | undefined); return; }
  local.get(key, (items) => {
    const runtimeError = globalThis.chrome?.runtime?.lastError;
    if (runtimeError) { reject(new Error(runtimeError.message)); return; }
    resolve(items[key] as T | undefined);
  });
});

const set = (items: Record<string, unknown>): Promise<void> => new Promise((resolve, reject) => {
  Object.assign(volatileStore, items);
  const local = globalThis.chrome?.storage?.local;
  if (!local) { resolve(); return; }
  local.set(items, () => {
    const runtimeError = globalThis.chrome?.runtime?.lastError;
    if (runtimeError) { reject(new Error(runtimeError.message)); return; }
    resolve();
  });
});

export async function getSettings(): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...(await get<Partial<Settings>>("settings")) };
}

export async function saveSettings(settings: Settings): Promise<void> { await set({ settings }); }

export async function addRecent(record: LookupRecord): Promise<void> {
  const settings = await getSettings();
  if (!settings.historyEnabled) return;
  const previous = await get<LookupRecord[]>("recent") ?? [];
  const recent = [record, ...previous.filter((item) => item.word !== record.word)].slice(0, settings.maxHistory);
  await set({ recent });
}

export async function getRecent(): Promise<LookupRecord[]> { return (await get<LookupRecord[]>("recent")) ?? []; }