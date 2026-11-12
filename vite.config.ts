import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        specforge: resolve(import.meta.dirname, "work/specforge/index.html"),
        vphy: resolve(import.meta.dirname, "work/vphy-lab/index.html"),
        focus: resolve(import.meta.dirname, "work/focus-mode/index.html"),
        skills: resolve(import.meta.dirname, "skills/index.html"),
        education: resolve(import.meta.dirname, "education/index.html"),
      },
    },
  },
});
