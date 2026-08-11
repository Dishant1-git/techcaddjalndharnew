import { createApp } from './app.js'
import { config } from './config.js'
import { pool, verifyConnection } from './db/pool.js'

async function start(): Promise<void> {
  try {
    await verifyConnection()
  } catch (error) {
    console.error('Could not connect to MySQL.')
    console.error(error instanceof Error ? error.message : error)
    console.error('\nCheck DB_HOST / DB_USER / DB_PASSWORD / DB_NAME in .env,')
    console.error('and that you have run: npm run db:migrate')
    process.exit(1)
  }

  const server = createApp().listen(config.PORT, () => {
    console.log(`API listening on http://localhost:${config.PORT}`)
    console.log(`CORS origin: ${config.CORS_ORIGIN}`)
  })

  // Finish in-flight requests and close the pool before exiting, so a deploy
  // does not cut a transaction in half.
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received, shutting down…`)
    server.close(() => {
      pool.end().finally(() => process.exit(0))
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

start()
