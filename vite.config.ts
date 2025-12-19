
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Shims process.env for the browser environment as required by the Gemini SDK
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY)
    }
  }
});
