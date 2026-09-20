import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { getRecent, getSettings, saveSettings } from "../services/storage";
import type { LookupRecord, Settings } from "../types";
import "./popup.css";

function Popup() {
  const [settings, setSettings] = useState<Settings>();
  const [recent, setRecent] = useState<LookupRecord[]>([]);
  useEffect(() => { getSettings().then(setSettings); getRecent().then(setRecent); }, []);
  async function toggle() { if (!settings) return; const next = { ...settings, enabled: !settings.enabled }; setSettings(next); await saveSettings(next); }
  return <main><header><div><strong>ContextWord</strong><span>Understand what a word means here.</span></div><label className="switch"><input type="checkbox" checked={settings?.enabled ?? true} onChange={toggle}/><span /></label></header><section><h2>Recent lookups</h2>{recent.length ? <ul>{recent.slice(0, 6).map((item) => <li key={item.word}><b>{item.word}</b><small>{item.context}</small></li>)}</ul> : <p className="empty">Double-click a word on a webpage to begin.</p>}</section><footer><a href="options.html" target="_blank">Settings</a></footer></main>;
}
createRoot(document.getElementById("root")!).render(<Popup />);
