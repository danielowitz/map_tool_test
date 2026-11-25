import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Der Build erzeugt eine einzelne, eigenständige dist/index.html (JS, CSS und Bilder inline).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
})
