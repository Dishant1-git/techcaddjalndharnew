interface Sluggable {
  id: string
  slug: string
}

/**
 * Slugs become public URLs, so a duplicate would silently shadow an existing
 * page. Returns a field-error map when taken, matching `ApiError.fieldErrors`.
 */
export function uniqueSlug<T extends Sluggable>(
  input: { slug?: string },
  existing: T[],
  id?: string,
): Record<string, string> | undefined {
  if (!input.slug) return undefined

  const clash = existing.some((item) => item.slug === input.slug && item.id !== id)
  return clash ? { slug: 'This slug is already in use.' } : undefined
}
