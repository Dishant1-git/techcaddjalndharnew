import Link from "next/link"

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="TechCadd home">
      <span
        className={`relative grid shrink-0 place-items-center overflow-hidden rounded-[10px] bg-linear-to-br from-brand-600 via-brand-500 to-accent-400 transition-all duration-500 ${
          compact ? "size-8" : "size-9"
        }`}
      >
        <span className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-linear-to-tr from-accent-glow to-brand-700" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="relative size-[18px] text-white"
          aria-hidden="true"
        >
          <path
            d="M9 7.5 4.5 12 9 16.5M15 7.5 19.5 12 15 16.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span className="flex items-start">
        <span
          className={`font-display font-semibold tracking-tight transition-all duration-500 ${
            compact ? "text-xl" : "text-2xl"
          }`}
        >
          Tech<span className="text-brand-600">cadd</span>
        </span>
        <span className="mt-1 font-mono text-[10px] text-muted transition-all duration-500">
          TM
        </span>
      </span>
    </Link>
  )
}
