import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../services/storage";
import type { Settings } from "../types";
import "./options.css";

function Options() {
  const [settings, setSettings] = useState<Settings>();
  useEffect(() => {
    let mounted = true;
    getSettings().then((nextSettings) => { if (mounted) setSettings(nextSettings); }).catch((error) => console.error("Unable to load ContextWord settings", error));
    return () => { mounted = false; };
  }, []);
  async function update(partial: Partial<Settings>) {
    if (!settings) return;
    const next = { ...settings, ...partial };
    setSettings(next);
    try { await saveSettings(next); } catch (error) { console.error("Unable to save ContextWord settings", error); setSettings(settings); }
  }
  function updateAutoCloseDelay(value: string) {
    const delay = Number(value);
    update({ autoCloseDelaySeconds: Number.isFinite(delay) ? Math.max(0, Math.min(3600, Math.floor(delay))) : 0 });
  }
  if (!settings) return null;
  return <main><p className="eyebrow">CONTEXTWORD</p><h1>Settings</h1><section><h2>General</h2><label className="row"><span><b>Enable double-click lookup</b><small>Show the panel when you select a word.</small></span><input type="checkbox" checked={settings.enabled} onChange={(e) => update({ enabled: e.target.checked })}/></label><label className="row"><span><b>Save lookup history</b><small>Keep recent words locally on this device.</small></span><input type="checkbox" checked={settings.historyEnabled} onChange={(e) => update({ historyEnabled: e.target.checked })}/></label><label className="row"><span><b>Close definitions automatically</b><small>Close the definition panel after this many seconds. Use 0 to keep it open.</small></span><input className="timer-input" type="number" min="0" max="3600" step="1" value={settings.autoCloseDelaySeconds} onChange={(e) => updateAutoCloseDelay(e.target.value)} aria-label="Auto-close delay in seconds"/><span className="timer-unit">seconds</span></label></section><section><h2>Appearance</h2><label>Theme <select value={settings.theme} onChange={(e) => update({ theme: e.target.value as Settings["theme"] })}><option value="light">Light</option><option value="system">System</option><option value="dark">Dark</option></select></label></section><section><h2>Dictionary source</h2><label className="row"><span><b>Use online dictionary for missing words</b><small>Off by default. When enabled, only an unknown selected word is sent to dictionaryapi.dev.</small></span><input type="checkbox" checked={settings.apiFallback} onChange={(e) => update({ apiFallback: e.target.checked })}/></label></section><section><h2>Privacy</h2><p>ContextWord uses its bundled offline dictionary by default. No webpage text is sent anywhere.</p></section></main>;
}
createRoot(document.getElementById("root")!).render(<Options />);
