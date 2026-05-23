import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import path from 'path'

export default defineConfig({
  base: '/celium/',
  build: {
    manifest: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Add global SCSS imports here if needed
      },
    },
  },
  plugins: [react(), viteCommonjs()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@styles': path.resolve(__dirname, 'src/styles'),
    },
  },
  preview: {
    port: 3000,
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/stories/**', 'src/components/archived/**', 'src/main.tsx'],
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: 'coverage/report',
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      }
    },
  },
})
