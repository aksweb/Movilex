// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'app/renderer',
  plugins: [react()],
  build: {
    outDir: '../../build/renderer',
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
});