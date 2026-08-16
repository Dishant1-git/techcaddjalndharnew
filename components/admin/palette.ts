/**
 * The dashboard's chart colours.
 *
 * Four categorical slots, held in a fixed order and assigned by position —
 * "Call Request" is always slot 1 whether or not it is the biggest bar, so a
 * filter that removes a form does not repaint the ones left behind.
 *
 * Slot 1 is the site's own brand blue; the remaining three are the reference
 * data-viz hues. The set was validated as a group against a white surface:
 * every slot sits inside the lightness band and above the chroma floor, the
 * worst adjacent pair separates by ΔE 9.1 under protanopia (≥8 required) and
 * 22.9 under normal vision (≥15 required).
 *
 * Aqua and yellow fall below 3:1 contrast against white, which is why every
 * chart here carries a visible value label on each bar and the same numbers
 * appear in the table below — colour is never the only thing distinguishing
 * two rows.
 */
export const SERIES = ["#2563eb", "#eb6834", "#1baf7a", "#eda100"] as const

/** One hue, used wherever the bars are magnitude rather than identity. */
export const SEQUENTIAL = "#2563eb"

/**
 * "Unattributed" — rows written before the site recorded which form they came
 * from. Grey rather than a fifth hue: it is the absence of a category, not
 * another one, and cycling the four slots would have painted it the same blue
 * as "Call Request".
 *
 * This step is the site's own muted ink, so it clears 4.4:1 against white and
 * stays legible where the two lightest series rely on their labels.
 */
export const UNKNOWN = "#64748b"
