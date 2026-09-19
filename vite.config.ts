import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset paths relative, so GitHub Pages works under any repo name.
export default defineConfig({
  base: './',
  plugins: [react()],
});
