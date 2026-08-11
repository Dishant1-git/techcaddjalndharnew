export const MIN_PASSWORD_LENGTH = 8

/** Returns the first unmet requirement, or undefined when the password passes. */
export function passwordProblem(password: string): string | undefined {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return 'Mix uppercase and lowercase letters.'
  }
  if (!/\d/.test(password)) return 'Include at least one number.'
  return undefined
}

/** 0–4, used only to colour the strength meter. */
export function passwordScore(password: string): number {
  if (!password) return 0

  let value = 0
  if (password.length >= MIN_PASSWORD_LENGTH) value += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) value += 1
  if (/\d/.test(password)) value += 1
  if (/[^A-Za-z0-9]/.test(password) && password.length >= 12) value += 1

  return value
}
