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

  css: {
    /**
     * An empty inline config, so PostCSS stops searching.
     *
     * Tailwind is applied by the Vite plugin above, not through PostCSS. Left
     * unset, PostCSS walks up the directory tree looking for a config and finds
     * the public website's `postcss.config.mjs` in the repository root, which
     * declares a plugin this package does not install — so the build fails with
     * "Cannot find module '@tailwindcss/postcss'". Declaring it here keeps the
     * two projects from configuring each other.
     */
    postcss: {},
  },
})
