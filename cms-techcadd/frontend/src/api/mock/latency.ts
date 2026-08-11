import { ApiError } from '../types'

interface MockBehaviour {
  /** Simulated round-trip in ms. */
  delayMs: number
  /** 0–1. Injects failures so error states are testable, not theoretical. */
  failureRate: number
}

const behaviour: MockBehaviour = { delayMs: 400, failureRate: 0 }

export function configureMockBehaviour(patch: Partial<MockBehaviour>): void {
  Object.assign(behaviour, patch)
}

export function getMockBehaviour(): Readonly<MockBehaviour> {
  return behaviour
}

/** Awaited by every mock handler so loading states are exercised in dev. */
export async function simulateNetwork(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, behaviour.delayMs))

  if (behaviour.failureRate > 0 && Math.random() < behaviour.failureRate) {
    throw new ApiError(500, 'The request failed. Please try again.')
  }
}
