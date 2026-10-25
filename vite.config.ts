import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves a project site from /<repo-name>/, so production builds use that base.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/hogwarts-companion/" : "/",
}));
