
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'   // ← Yeh line important hai

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
})