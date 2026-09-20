import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { DictionaryEntry } from "../types";

interface Props { word: string; context: string; theme: "system" | "light" | "dark"; entry?: DictionaryEntry; error?: string; onClose: () => void; }

export function DefinitionPanel({ word, context, theme, entry, error, onClose }: Props) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>();
  useEffect(() => { closeButton.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as Element).closest("button")) return;
    const panel = event.currentTarget.closest(".cw-panel") as HTMLElement | null;
    if (!panel) return;
    const bounds = panel.getBoundingClientRect();
    const offsetX = event.clientX - bounds.left;
    const offsetY = event.clientY - bounds.top;
    const move = (pointer: globalThis.PointerEvent) => setPosition({
      x: Math.max(8, Math.min(pointer.clientX - offsetX, window.innerWidth - bounds.width - 8)),
      y: Math.max(8, Math.min(pointer.clientY - offsetY, window.innerHeight - bounds.height - 8))
    });
    const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", end, { once: true });
  }
  const first = entry?.definitions[0];
  const style: CSSProperties | undefined = position ? { left: position.x, top: position.y, right: "auto", bottom: "auto" } : undefined;
  return <aside className={`cw-panel${theme === "system" ? "" : ` cw-theme-${theme}`}`} style={style} role="dialog" aria-modal="false" aria-label={`Definition of ${word}`}>
    <div className="cw-head" onPointerDown={startDrag} title="Drag to move"><div><h1 className="cw-word">{word}</h1>{entry?.phonetic && <span className="cw-muted">{entry.phonetic}</span>}{entry?.audio && <button className="cw-audio" aria-label={`Play pronunciation of ${word}`} onClick={() => new Audio(entry.audio).play().catch(() => undefined)}>🔊</button>}{entry?.partOfSpeech && <div className="cw-pos">{entry.partOfSpeech}</div>}</div><button ref={closeButton} className="cw-close" onClick={onClose} aria-label="Close definition panel">×</button></div>
    {!entry && !error && <div className="cw-loading" role="status"><span className="cw-dot" /> Loading definition…</div>}
    {error && <p className="cw-error" role="alert">{error}</p>}
    {first && <>
      <section className="cw-section"><span className="cw-label">Definition</span><p className="cw-definition">{first.definition}</p>{first.example && <p className="cw-example">“{first.example}”</p>}</section>
      <section className="cw-section"><span className="cw-label">Original context</span><p className="cw-context">“{context}”</p></section>
      {entry.synonyms.length > 0 && <section className="cw-section"><span className="cw-label">Similar words</span><div className="cw-chips">{entry.synonyms.map((word) => <span key={word} className="cw-chip">{word}</span>)}</div></section>}
    </>}
  </aside>;
}
