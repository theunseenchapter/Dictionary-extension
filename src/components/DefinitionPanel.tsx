import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { AdaptivePalette } from "../utils/adaptiveTheme";
import type { DictionaryEntry } from "../types";

interface Props { word: string; context: string; theme: "system" | "light" | "dark"; palette: AdaptivePalette; entry?: DictionaryEntry; error?: string; onClose: () => void; }

export function DefinitionPanel({ word, context, theme, palette, entry, error, onClose }: Props) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>();
  const [isSpeaking, setIsSpeaking] = useState(false);
  useEffect(() => { closeButton.current?.focus(); }, []);
  useEffect(() => () => {
    audio.current?.pause();
    window.speechSynthesis?.cancel();
  }, []);
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
  function playPronunciation() {
    if (isSpeaking) {
      audio.current?.pause();
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }
    const speak = () => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    };
    if (!entry?.audio) { speak(); return; }
    audio.current?.pause();
    const pronunciation = new Audio(entry.audio);
    audio.current = pronunciation;
    pronunciation.onended = () => setIsSpeaking(false);
    pronunciation.onerror = () => { setIsSpeaking(false); speak(); };
    setIsSpeaking(true);
    pronunciation.play().catch(speak);
  }
  const style: CSSProperties & Record<`--${string}`, string> = {
    "--accent": palette.accent,
    "--accent-soft": palette.accentSoft,
    "--accent-light": palette.accentLight,
    "--surface": palette.surface,
    "--surface-secondary": palette.surfaceSecondary,
    "--text-primary": palette.textPrimary,
    "--text-secondary": palette.textSecondary,
    "--border": palette.border,
    "--highlight": palette.highlight,
    ...(position ? { left: position.x, top: position.y, right: "auto", bottom: "auto" } : {})
  };
  return <aside className={`cw-panel${theme === "dark" ? " cw-theme-dark" : ""}`} style={style} role="dialog" aria-modal="false" aria-label={`Definition of ${word}`}>
    <div className="cw-head" onPointerDown={startDrag} title="Drag to move"><div className="cw-title-block"><span className="cw-eyebrow">ContextWord <i>·</i> word insight</span><h1 className="cw-word">{word}</h1><div className="cw-meta">{entry?.phonetic && <span className="cw-phonetic">{entry.phonetic}</span>}{entry?.partOfSpeech && <span className="cw-pos">{entry.partOfSpeech}</span>}{entry && <button className={`cw-audio${isSpeaking ? " cw-audio-playing" : ""}`} aria-label={`${isSpeaking ? "Stop" : "Play"} pronunciation of ${word}`} aria-pressed={isSpeaking} onClick={playPronunciation}>{isSpeaking ? "■" : "🔊"}</button>}</div></div><button ref={closeButton} className="cw-close" onClick={onClose} aria-label="Close definition panel">×</button></div>
    <div className="cw-rule" />
    {!entry && !error && <div className="cw-loading" role="status"><span className="cw-dot" /> Loading definition<span className="cw-loading-tail">...</span></div>}
    {error && <p className="cw-error" role="alert"><strong>Lookup unavailable</strong>{error}</p>}
    {entry && <>
      <section className="cw-context-section"><span className="cw-label">In your sentence</span><p className="cw-context">“{context}”</p></section>
      <div className="cw-bifurcation">
        <section className="cw-meaning"><div className="cw-section-heading"><span className="cw-index">01</span><span className="cw-label">Meaning</span></div>{entry.definitions.map((definition, index) => <article className="cw-sense" key={`${definition.definition}-${index}`}><p className="cw-definition">{definition.definition}</p>{definition.example && <p className="cw-example">“{definition.example}”</p>}</article>)}</section>
        <section className="cw-relations"><div className="cw-section-heading"><span className="cw-index">02</span><span className="cw-label">Word map</span></div>{entry.synonyms.length > 0 && <div className="cw-relation"><span className="cw-relation-label">Similar</span><div className="cw-chips">{entry.synonyms.map((synonym) => <span key={synonym} className="cw-chip">{synonym}</span>)}</div></div>}{entry.antonyms.length > 0 && <div className="cw-relation"><span className="cw-relation-label cw-opposite-label">Opposite</span><div className="cw-chips">{entry.antonyms.map((antonym) => <span key={antonym} className="cw-chip cw-chip-opposite">{antonym}</span>)}</div></div>}{entry.synonyms.length === 0 && entry.antonyms.length === 0 && <p className="cw-muted cw-empty">No close word relationships found.</p>}</section>
      </div>
    </>}
  </aside>;
}
