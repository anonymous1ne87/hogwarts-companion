import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves a project site from /<repo-name>/, so builds and `vite preview` use that base.
// ES2022 because ooz-wasm (the save decompressor) uses top-level await.
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  base: command === "serve" && !isPreview ? "/" : "/hogwarts-companion/",
  build: { target: "es2022" },
  optimizeDeps: { esbuildOptions: { target: "es2022" } },
}));
