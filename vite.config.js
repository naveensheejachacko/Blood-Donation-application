import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration
// - `base` is important for GitHub Pages.
// - Replace `<REPO_NAME>` with your GitHub repository name before deploying.
//   Example: if your repo is `username/blood-donation-directory`,
//   set base to `/blood-donation-directory/`.
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/<REPO_NAME>/' : '/',
});
