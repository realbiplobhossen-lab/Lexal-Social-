import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './' // এটি অত্যন্ত জরুরি যাতে মোবাইলে ফাইল পাথ মিস না হয়
})

