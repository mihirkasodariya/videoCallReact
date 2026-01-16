import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: true, // Network pe expose karne ke liye zaroori hai
    port: 5001,
    // https: true, // ✅ Explicitly HTTPS enable kiya
  },
})