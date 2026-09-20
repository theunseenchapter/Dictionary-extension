export const panelCss = `
:host { all: initial; color-scheme: light dark; }
* { box-sizing: border-box; }
.cw-panel { --accent:#5f6672; --accent-soft:#e9ebee; --accent-light:#f5f6f7; --surface:#fcfcfb; --surface-secondary:#f5f5f3; --text-primary:#1e2329; --text-secondary:#626a73; --border:#dfe2e5; --highlight:#f0f1f2; position:fixed; right:24px; bottom:24px; z-index:2147483647; width:min(500px,calc(100vw - 32px)); max-height:calc(100vh - 48px); overflow-y:auto; padding:24px; border:1px solid var(--border); border-radius:20px; background:var(--surface); color:var(--text-primary); box-shadow:0 24px 70px rgba(21,38,61,.2),0 2px 6px rgba(21,38,61,.06); font:14px/1.5 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; animation:cw-in .18s ease-out; }
.cw-panel.cw-theme-dark { color-scheme:dark; }
.cw-notice { position:fixed; right:24px; bottom:24px; z-index:2147483647; max-width:330px; padding:12px 14px; border-radius:10px; background:#202328; color:#f8f8f5; box-shadow:0 12px 30px rgba(0,0,0,.26); font:13px/1.4 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; animation:cw-in .18s ease-out; }
@keyframes cw-in { from { opacity:0; transform:translateX(12px) scale(.98); } to { opacity:1; transform:none; } }
.cw-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; cursor:grab; user-select:none; }
.cw-head:active { cursor:grabbing; }
.cw-title-block { min-width:0; }
.cw-eyebrow { display:block; margin-bottom:9px; color:var(--text-secondary); font-size:10px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
.cw-eyebrow i { color:var(--border); font-style:normal; }
.cw-word { margin:0; font-size:32px; line-height:1; letter-spacing:-.035em; text-transform:lowercase; }
.cw-meta { display:flex; align-items:center; gap:9px; margin-top:10px; min-height:20px; }
.cw-phonetic { color:var(--text-secondary); font-family:Georgia,serif; font-size:15px; }
.cw-close,.cw-audio { border:0; background:transparent; color:inherit; cursor:pointer; border-radius:9px; padding:5px; font:inherit; transition:background-color .18s ease,color .18s ease; }
.cw-close { font-size:22px; line-height:1; }
.cw-close:hover,.cw-audio:hover { background:var(--highlight); color:var(--accent); }
.cw-muted { color:var(--text-secondary); }
.cw-pos { padding:3px 8px; border-radius:5px; background:var(--accent-soft); color:var(--accent); font-size:11px; font-weight:700; letter-spacing:.02em; text-transform:capitalize; }
.cw-audio { margin-left:0; color:var(--accent); }
.cw-language { color:var(--text-secondary); font-size:11px; font-weight:700; }
.cw-audio-playing { background:var(--accent); color:var(--surface); }
.cw-rule { height:1px; margin:20px 0 18px; background:var(--border); }
.cw-section { margin-top:20px; }
.cw-label { display:block; margin-bottom:8px; color:var(--text-secondary); font-size:10px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
.cw-context-section { margin-bottom:22px; }
.cw-context { margin:0; padding:13px 15px; border-left:3px solid var(--accent); border-radius:0 10px 10px 0; background:var(--accent-light); color:var(--text-primary); font-family:Georgia,serif; font-size:15px; line-height:1.55; }
.cw-bifurcation { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr); gap:23px; }
.cw-meaning { padding-right:23px; border-right:1px solid var(--border); }
.cw-section-heading { display:flex; align-items:center; gap:9px; margin-bottom:13px; }
.cw-section-heading .cw-label { margin:0; }
.cw-index { display:grid; place-items:center; width:22px; height:22px; border-radius:6px; background:var(--accent); color:var(--surface); font-size:10px; font-weight:800; }
.cw-sense+.cw-sense { margin-top:17px; padding-top:17px; border-top:1px solid var(--border); }
.cw-definition { margin:0; font-size:15px; line-height:1.55; }
.cw-example { margin:8px 0 0; color:var(--text-secondary); font-family:Georgia,serif; font-size:13px; font-style:italic; line-height:1.45; }
.cw-relations { min-width:0; }
.cw-relation+.cw-relation { margin-top:19px; }
.cw-relation-label { display:block; margin-bottom:8px; color:var(--accent); font-size:11px; font-weight:700; }
.cw-opposite-label { color:var(--text-secondary); }
.cw-chips { display:flex; flex-wrap:wrap; gap:6px; }
.cw-chip { padding:4px 9px; border:1px solid var(--accent); border-radius:6px; background:var(--accent-soft); color:var(--accent); cursor:default; font-size:12px; transition:background-color .18s ease,transform .18s ease; }
.cw-chip:hover { background:var(--accent-light); transform:translateY(-1px); }
.cw-chip-opposite { border-color:var(--border); background:var(--surface-secondary); color:var(--text-secondary); }
.cw-empty { margin:0; font-size:13px; }
.cw-loading { display:flex; gap:8px; align-items:center; padding:22px 0 8px; color:var(--text-secondary); }
.cw-loading-tail { opacity:.45; }
.cw-dot { width:8px; height:8px; border-radius:50%; background:var(--accent); animation:cw-pulse 1s infinite alternate; }
@keyframes cw-pulse { to { opacity:.2; transform:scale(.65); } }
.cw-error { display:flex; flex-direction:column; gap:4px; color:#9f352b; background:#fff1ef; border:1px solid #f2d5d0; border-radius:10px; padding:12px; }
.cw-error strong { font-size:13px; }
@media (max-width:520px) { .cw-panel { right:10px; bottom:10px; width:min(500px,calc(100vw - 20px)); padding:20px; } .cw-bifurcation { grid-template-columns:1fr; gap:21px; } .cw-meaning { padding-right:0; padding-bottom:20px; border-right:0; border-bottom:1px solid var(--border); } .cw-word { font-size:29px; } }
`;