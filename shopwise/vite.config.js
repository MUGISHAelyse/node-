// vite.config.js: settings for Vite, the tool that runs (npm run dev) and builds (npm run build) the site.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // The React plugin lets Vite understand JSX (the HTML-like code inside .jsx files).
  plugins: [react()],
})
