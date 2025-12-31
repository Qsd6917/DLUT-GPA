import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Use '.' instead of process.cwd() to avoid type issues if process is not fully typed in some contexts.
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY for the client-side code
      // It will replace `process.env.API_KEY` with the string value of VITE_API_KEY during build
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
  };
});