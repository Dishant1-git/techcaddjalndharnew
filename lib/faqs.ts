/**
 * The shape of a question, and the order its sections render in.
 *
 * The questions themselves are in the CMS — `loadFaqs` in lib/content.ts is
 * the only source. What stays here is the part that is layout rather than
 * content: which section comes first on /faq.
 */

/**
 * The categories the site knows how to order.
 *
 * A union rather than a string because `FAQ_CATEGORIES` below has to name them
 * to sequence them. The CMS stores the category as free text, so a section it
 * has never heard of still renders — `loadFaqCategories` appends anything new
 * after the known ones rather than dropping the questions in it.
 */
export type FaqCategory =
  | "Admissions"
  | "Courses & Batches"
  | "Fees"
  | "Placement"
  | "Certification"

export type Faq = {
  question: string
  answer: string
  /** Groups the question on /faq. The homepage ignores it. */
  category: FaqCategory
}

/**
 * The order the /faq page renders its sections in.
 *
 * Admissions first because that is what a visitor who has not enrolled is
 * here for; certification last because it only matters once they have.
 */
export const FAQ_CATEGORIES: FaqCategory[] = [
  "Admissions",
  "Courses & Batches",
  "Fees",
  "Placement",
  "Certification",
]

