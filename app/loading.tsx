import { Skeleton } from "@/components/skeleton"

/**
 * Route-level skeleton.
 *
 * App Router streams this in place of the page while a navigation resolves.
 * It mirrors the real homepage rhythm — nav bar, hero, category row, card grid
 * — so the layout does not jump when the content lands.
 */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading page">
      {/* --- Navbar --- */}
      <div className="fixed inset-x-0 top-0 z-50 px-3">
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-3 sm:px-5 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-9" rounded="rounded-[10px]" />
            <Skeleton className="h-6 w-28" />
          </div>
          <div className="hidden items-center gap-7 xl:flex">
            {["w-14", "w-16", "w-12", "w-16", "w-36", "w-20"].map((w) => (
              <Skeleton key={w} className={`h-4 ${w}`} rounded="rounded-full" />
            ))}
          </div>
          <Skeleton className="h-9 w-28" rounded="rounded-full" />
        </div>
      </div>

      {/* --- Hero --- */}
      <div className="flex min-h-screen flex-col justify-between bg-[#0a0e14] px-6 pt-32 pb-10 lg:px-12 lg:pb-12">
        <div className="mx-auto w-full max-w-[1400px]">
          <Skeleton dark className="h-7 w-64" rounded="rounded-full" />

          <div className="mt-14 space-y-4">
            <Skeleton dark className="h-12 w-[min(38rem,90%)] lg:h-16" />
            <Skeleton dark className="h-12 w-[min(34rem,85%)] lg:h-16" />
            <Skeleton dark className="h-12 w-[min(30rem,75%)] lg:h-16" />
          </div>

          <div className="mt-8 space-y-3">
            <Skeleton dark className="h-4 w-[min(32rem,80%)]" />
            <Skeleton dark className="h-4 w-[min(28rem,70%)]" />
          </div>

          <div className="mt-9 flex flex-wrap gap-4">
            <Skeleton dark className="h-13 w-48" rounded="rounded-full" />
            <Skeleton dark className="h-13 w-44" rounded="rounded-full" />
          </div>
        </div>

        <div className="mx-auto mt-14 grid w-full max-w-[1400px] gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} dark className="h-20" rounded="rounded-2xl" />
          ))}
        </div>
      </div>

      {/* --- Stats --- */}
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-4 gap-y-10 px-4 py-20 sm:gap-x-8 lg:grid-cols-4 lg:px-8">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="mx-auto aspect-square w-full max-w-[13rem]" rounded="rounded-full" />
        ))}
      </div>

      {/* --- Categories panel --- */}
      <div className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-[1240px] rounded-[2rem] bg-ink px-5 py-14 lg:rounded-[2.5rem] lg:px-10 lg:py-16">
          <Skeleton dark className="h-7 w-32" rounded="rounded-full" />
          <div className="mt-6 space-y-3">
            <Skeleton dark className="h-9 w-[min(30rem,80%)] lg:h-11" />
            <Skeleton dark className="h-9 w-[min(22rem,60%)] lg:h-11" />
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:h-[34rem] lg:gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                dark
                className="aspect-[3/4] lg:aspect-auto lg:min-w-0 lg:grow lg:basis-0"
                rounded="rounded-2xl"
              />
            ))}
          </div>
        </div>
      </div>

      {/* --- Card grid --- */}
      <div className="mx-auto max-w-[1240px] px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <Skeleton className="mx-auto h-7 w-40" rounded="rounded-full" />
          <Skeleton className="mx-auto h-10 w-[min(28rem,90%)] lg:h-14" />
          <Skeleton className="mx-auto h-4 w-[min(24rem,80%)]" />
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64" rounded="rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
