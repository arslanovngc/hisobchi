import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          chakra: ["@chakra-ui/react", "@emotion/react", "@emotion/styled", "framer-motion"],
          i18n: ["i18next", "i18next-http-backend", "react-i18next"],
        },
      },
    },
  },
});
