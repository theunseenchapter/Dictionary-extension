import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  const common = {
    plugins: [react()],
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    build: { outDir: "dist", emptyOutDir: mode === "ui" }
  };
  if (mode === "content") return {
    ...common,
    build: { ...common.build, lib: { entry: resolve(__dirname, "src/content/index.tsx"), name: "ContextWord", formats: ["iife"], fileName: () => "assets/content.js" } }
  };
  if (mode === "background") return {
    ...common,
    build: { ...common.build, lib: { entry: resolve(__dirname, "src/background/index.ts"), formats: ["es"], fileName: () => "assets/background.js" } }
  };
  return {
    ...common,
    build: {
      ...common.build,
      rollupOptions: {
        input: { popup: resolve(__dirname, "popup.html"), options: resolve(__dirname, "options.html") },
        output: { entryFileNames: "assets/[name].js", chunkFileNames: "assets/chunks/[name]-[hash].js", assetFileNames: "assets/[name]-[hash][extname]" }
      }
    }
  };
});
