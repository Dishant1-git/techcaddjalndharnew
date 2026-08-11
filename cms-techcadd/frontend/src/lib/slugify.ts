/** "MERN Stack Development" → "mern-stack-development" */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    // Strip accents so "Café" becomes "cafe" rather than losing the letter.
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
