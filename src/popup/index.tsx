import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { getRecent, getSettings, saveSettings } from "../services/storage";
import type { LookupRecord, Settings } from "../types";
import "./popup.css";

function Popup() {
  const [settings, setSettings] = useState<Settings>();
  const [recent, setRecent] = useState<LookupRecord[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([getSettings(), getRecent()]).then(([nextSettings, nextRecent]) => {
      if (!mounted) return;
      setSettings(nextSettings);
      setRecent(nextRecent);
    }).catch((error) => console.error("Unable to load ContextWord popup data", error));
    return () => { mounted = false; };
  }, []);

  async function toggle() {
    if (!settings) return;
    const next = { ...settings, enabled: !settings.enabled };
    setSettings(next);
    try { await saveSettings(next); } catch (error) {
      console.error("Unable to save ContextWord settings", error);
      setSettings(settings);
    }
  }

  const isEnabled = settings?.enabled ?? true;

  return <main>
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">W</span>
        <div><strong>ContextWord</strong><span>Meaning, in context</span></div>
      </div>
      <label className="switch" title={isEnabled ? "Pause ContextWord" : "Enable ContextWord"}>
        <input type="checkbox" checked={isEnabled} onChange={toggle} aria-label="Enable ContextWord" />
        <span aria-hidden="true" />
      </label>
    </header>

    <div className="active-state" aria-live="polite"><span aria-hidden="true" />{isEnabled ? "Active" : "Paused"}</div>

    <section className={`status-card${isEnabled ? "" : " status-card-paused"}`}>
      <span className="status-icon" aria-hidden="true">{isEnabled ? "✦" : "Ⅱ"}</span>
      <div><b>{isEnabled ? "Ready when you are" : "ContextWord is paused"}</b><p>{isEnabled ? "Double-click any word to understand it in context." : "Turn it on to look up words on any webpage."}</p></div>
    </section>

    <section className="lookup-section">
      <div className="section-heading"><h2>Recent lookups</h2><span>{recent.length}</span></div>
      {recent.length ? <ul>{recent.slice(0, 6).map((item) => <li key={item.word}>
        <span className="word-avatar" aria-hidden="true">{item.word.slice(0, 1).toUpperCase()}</span>
        <div className="lookup-copy"><b title={item.word}>{item.word}</b><small title={item.context}>{item.context}</small></div>
      </li>)}</ul> : <div className="empty"><span aria-hidden="true">⌁</span><p>Your looked-up words will appear here.</p></div>}
    </section>

    <footer><a href="options.html" target="_blank" rel="noreferrer"><span>Settings</span><span aria-hidden="true">→</span></a></footer>
  </main>;
}

createRoot(document.getElementById("root")!).render(<Popup />);