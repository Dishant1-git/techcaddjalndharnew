/**
 * Who this CMS belongs to.
 *
 * There is more than one techcadd install, and more than one checkout of this
 * code on a developer's machine. An admin who cannot tell at a glance which
 * branch's website they are editing is one careless afternoon away from
 * publishing Jalandhar's fees to somebody else's site — so the branch is named
 * in the sidebar, on the sign-in page and in the browser tab, not left implied.
 *
 * One constant rather than the same words typed into four components: those
 * drift, and a half-renamed CMS is more confusing than an unnamed one.
 */

/** The organisation. */
export const ORG_NAME = 'techcadd'

/** The branch this install manages. */
export const BRANCH_NAME = 'Jalandhar'

/** Full name, for headings and page titles. */
export const CMS_NAME = `${ORG_NAME} ${BRANCH_NAME} CMS`

/** The site this CMS publishes to, as a person would say it. */
export const SITE_LABEL = `${ORG_NAME} ${BRANCH_NAME} website`
