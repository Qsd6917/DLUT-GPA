import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');
  
  return {
    base: '/DLUT-GPA/', // <--- 核心修改：确保静态资源路径指向你的仓库名
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY for the client-side code
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
  };
});
