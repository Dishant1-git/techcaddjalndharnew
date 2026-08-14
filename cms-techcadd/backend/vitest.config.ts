// Loaded here too: this file runs before the test files, so DB_NAME has to be
// readable when the override below is computed.
import 'dotenv/config'
import { defineConfig } from 'vitest/config'

/**
 * Point the suite at the throwaway database.
 *
 * Set here rather than as an inline `DB_NAME=… vitest` prefix, which Windows
 * shells do not understand. `scripts/prepare-test-db.mjs` creates it, and
 * tests/helpers.ts refuses to run if this has not taken effect.
 */
process.env.DB_NAME = process.env.TEST_DB_NAME ?? `${process.env.DB_NAME ?? 'techcadd_cms'}_test`

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
