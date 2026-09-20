import { build } from "vite";

const watch = process.argv.includes("--watch") ? {} : undefined;
// The content script must be an IIFE: Chrome manifest content scripts cannot use imports.
await build({ mode: "ui", build: { watch } });
await build({ mode: "content", build: { watch } });
await build({ mode: "background", build: { watch } });
