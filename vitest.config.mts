import { defineConfig } from 'vitest/config'

// API route handlers run in the Node runtime, not the browser — so we test
// them under the 'node' environment rather than jsdom.
export default defineConfig({
  // Resolve the `@/*` path alias from tsconfig.json natively (no plugin needed).
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
  },
})
