import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/discogs-images": {
        target: "https://i.discogs.com",
        changeOrigin: true,
        rewrite: (path) => path.replace("/discogs-images", ""),
        headers: {
          "User-Agent": "SpaceIsThePlace/1.0",
          Referer: "https://www.discogs.com",
        },
      },
    },
  },
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
