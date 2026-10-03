import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// The app is installed on each laptop and opens without internet (service worker cache).
const pwa = VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'إدارة المغسلة',
    short_name: 'المغسلة',
    lang: 'ar',
    dir: 'rtl',
    display: 'standalone',
    start_url: '/',
    theme_color: '#16263a',
    background_color: '#f3f6f8',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\/api\//],
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), pwa],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
  preview: {
    port: 4173,
    proxy: { '/api': 'http://localhost:3000' },
  },
});
