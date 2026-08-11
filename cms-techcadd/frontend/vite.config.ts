import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * No `manualChunks` here on purpose.
 *
 * Grouping the heavy libraries into named vendor chunks looked tidier, but it
 * pulled them into the entry's static graph — the 384 kB editor ended up
 * `modulepreload`ed on first paint. Rollup's automatic splitting already keeps
 * the editor inside a chunk that only the rich-text form pages import, which is
 * what we actually want; the chunk's generated name is merely cosmetic.
 */
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
