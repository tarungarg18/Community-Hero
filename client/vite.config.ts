import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function readEnv(): Record<string, string> {
  try {
    const raw = readFileSync(resolve(__dirname, '.env'), 'utf-8');
    return Object.fromEntries(
      raw.split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
        .map((l) => l.split('=').map((p) => p.trim()) as [string, string])
    );
  } catch {
    return {};
  }
}

const env = readEnv();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  define: {
    __FB_AK__: JSON.stringify(env.VITE_FB_TOKEN ?? ''),
  },
});
