import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 85,
        branches: 70,
        functions: 80,
        lines: 85,
      },
    },
  },
});
