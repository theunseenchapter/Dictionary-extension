import { lookupDictionary } from "../services/dictionary";
import { addRecent, getSettings } from "../services/storage";
import type { LookupRecord } from "../types";

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  const request = message as { type?: string; word?: string; record?: LookupRecord };
  if (request.type === "lookup" && request.word) {
    lookupDictionary(request.word).then((entry) => sendResponse({ ok: true, entry })).catch((error: Error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (request.type === "record" && request.record) {
    addRecent(request.record).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (request.type === "settings") {
    getSettings().then((settings) => sendResponse({ ok: true, settings }));
    return true;
  }
  return false;
});
