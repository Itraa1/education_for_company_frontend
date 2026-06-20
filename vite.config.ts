import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    proxy: {
      "/api": {
        target: "http://185.167.98.251:1337",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://185.167.98.251:1337",
        changeOrigin: true,
      },
    },
  },
});
