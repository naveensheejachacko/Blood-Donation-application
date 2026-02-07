import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration
// - base: '/' works for Vercel, Netlify, and most hosts (app served from root).
// - For GitHub Pages, set base to your repo name, e.g. base: '/Blood-Donation-application/'.
export default defineConfig({
  plugins: [react()],
  base: '/',
});
