import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Container } from "@/components/container"
import { Cta } from "@/components/cta"
import { AuthoredHtml } from "@/components/authored-html"
import { CmsUnavailableError, getPage } from "@/lib/cms"
import { SITE } from "@/lib/site"

type Props = { params: Promise<{ slug: string }> }

/**
 * Standalone pages written in the CMS — policies, notices, landing copy.
 *
 * The lowest-priority route in the app: Next matches every real directory under
 * app/ before falling through to here, so a CMS page can never shadow /about or
 * /courses however it is slugged. A slug the CMS does not know is a hard 404.
 *
 * Rendered on demand rather than pre-generated. A page written in the CMS after
 * the last deploy is exactly the case this route exists for, and enumerating
 * slugs at build time would miss it.
 */

export const dynamicParams = true

export async function generateStaticParams() {
  // Deliberately empty: every page renders on first request and is then cached
  // like any other. Prebuilding would need a list endpoint that only serves the
  // build, and would still miss anything published afterwards.
  return []
}

async function load(slug: string) {
  try {
    return await getPage(slug)
  } catch (error) {
    // A 404 from the CMS arrives as CmsUnavailableError too — either way there
    // is no page to show, and notFound() is the honest answer.
    if (error instanceof CmsUnavailableError) return undefined
    throw error
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await load((await params).slug)
  if (!page) return {}

  const url = page.seo?.canonicalUrl || `${SITE.url}/${page.slug}`

  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription,
    keywords: page.seo?.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: page.seo?.metaTitle || page.title,
      description: page.seo?.metaDescription,
      url,
      type: "website",
      locale: "en_IN",
    },
  }
}

export default async function CmsPageRoute({ params }: Props) {
  const page = await load((await params).slug)
  if (!page) notFound()

  return (
    <main>
      <section
        data-cursor="light"
        className="bg-ink pt-32 pb-14 text-white lg:pt-40 lg:pb-16"
      >
        <Container>
          <h1
            data-reveal
            suppressHydrationWarning
            className="max-w-3xl font-display text-3xl leading-[1.12] font-bold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl"
          >
            {page.title}
          </h1>
        </Container>
      </section>

      <section className="py-14 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <AuthoredHtml html={page.content} />
          </div>
        </Container>
      </section>

      <Cta />
    </main>
  )
}
