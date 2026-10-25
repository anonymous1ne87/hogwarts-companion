import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves a project site from /<repo-name>/, so builds and `vite preview` use that base.
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  base: command === "serve" && !isPreview ? "/" : "/hogwarts-companion/",
}));
