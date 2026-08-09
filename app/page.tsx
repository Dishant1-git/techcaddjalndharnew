import { About } from "@/components/about"
import { Blogs } from "@/components/blogs"
import { Capabilities } from "@/components/capabilities"
import { Categories } from "@/components/categories"
import { Cta } from "@/components/cta"
import { Faq } from "@/components/faq"
import { Footer } from "@/components/footer"
import { FeaturedCourses } from "@/components/featured-courses"
import { Hero } from "@/components/hero"
import { Modules } from "@/components/modules"
import { Navbar } from "@/components/navbar"
import { Stats } from "@/components/stats"
import { Technologies } from "@/components/technologies"
import { Testimonials } from "@/components/testimonials"
import { WhyUs } from "@/components/why-us"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        <About />

        <Categories />

        <FeaturedCourses />

        <WhyUs />

        <Stats />

        <Testimonials />

        <Modules />

        <Technologies />

        <Capabilities />

        <Faq />

        <Blogs />

        <Cta />
      </main>

      <Footer />
    </>
  )
}
