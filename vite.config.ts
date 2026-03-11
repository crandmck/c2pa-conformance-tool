import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// GitHub Pages serves at https://<user>.github.io/<repo-name>/
// In CI GITHUB_REPOSITORY is set (e.g. "owner/repo"); NODE_ENV may not be set during config load
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = repoName ? `/${repoName}/` : (process.env.NODE_ENV === 'production' ? '/c2pa-conformance-tool/' : '/')

export default defineConfig({
  base,
  plugins: [svelte()],
  server: {
    fs: {
      // Allow serving files from wasm directory
      allow: ['..']
    }
  },
  build: {
    target: 'esnext'
  }
})
