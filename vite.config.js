import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/hcmdrugs/', // Adjust this if your GitHub repo is named differently
  plugins: [react()],
})
