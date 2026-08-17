import { About } from "@/components/about"
import { Blogs } from "@/components/blogs"
import { Capabilities } from "@/components/capabilities"
import { Categories } from "@/components/categories"
import { Cta } from "@/components/cta"
import { Faq } from "@/components/faq"
import { FeaturedCourses } from "@/components/featured-courses"
import { Hero } from "@/components/hero"
import { Modules } from "@/components/modules"
import { PromoBanner } from "@/components/promo-banner"
import { Technologies } from "@/components/technologies"
import { Testimonials } from "@/components/testimonials"
import { WhyUs } from "@/components/why-us"

export default function Home() {
  return (
    <>
      <main>
        <Hero />

        {/* Renders nothing unless a banner is scheduled in the CMS. */}
        <PromoBanner placement="home-hero" />

        <About />

        <Categories />

        <FeaturedCourses />

        <WhyUs />

        <Testimonials />

        <Modules />

        <Technologies />

        <Capabilities />

        <Faq />

        <Blogs />

        <Cta />
      </main>
    </>
  )
}
