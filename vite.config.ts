import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      srcDir: "src",
      filename: "sw.ts",
      strategies: "injectManifest",
      includeAssets: ["favicon.ico", "favicon.svg", "favicon-96x96.png", "apple-touch-icon.png"],
      manifest: {
        name: "chardy safe",
        short_name: "safe",
        description: "Client-side AES-256-GCM encryption for text and files.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        icons: [
          {
            src: "favicon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            // "any" so Chrome counts it as a valid installable icon
            purpose: "any",
          },
          {
            src: "web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            // maskable variant for Android adaptive icons
            src: "web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        share_target: {
          action: "/file",
          method: "POST",
          enctype: "multipart/form-data",
          params: {
            files: [{ name: "file", accept: ["*/*"] }],
          },
        },
      },
    }),
  ],
});
