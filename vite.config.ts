import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/LLM-16P/',
  plugins: [react()],
  server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] },
  build: { outDir: 'dist', emptyOutDir: true, sourcemap: false },
});
