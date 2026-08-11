import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // The integration tests share one database, so they cannot run at the same
    // time — two files truncating the same table would fail each other.
    fileParallelism: false,
    // argon2 hashing is deliberately slow, and the auth tests do several.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})
