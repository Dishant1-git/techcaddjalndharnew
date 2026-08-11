import { cn } from '../../lib/cn'

/**
 * TechCadd wordmark, redrawn as a geometric rounded-sans construction so it
 * stays crisp at any size and inherits its colour from `currentColor`.
 * Swap in the official artwork by pointing this component at an <img> instead.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 214 40"
      role="img"
      aria-label="TechCadd"
      className={cn('h-auto', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* t */}
      <path d="M12.5 5V26.5C12.5 31.5 15 34 19.5 34M6.5 12.5H19.5" />
      {/* e — bowl runs from the lower-right terminal all the way round to the
          crossbar, leaving the aperture as the only gap. */}
      <path d="M42.5 29A8.5 8.5 0 1 1 45 23H28" />
      {/* c */}
      <path d="M68 17A8.5 8.5 0 1 0 68 29" />
      {/* h */}
      <path d="M79 34V4M79 23A8.5 8.5 0 0 1 96 23V34" />
      {/* c */}
      <path d="M119 17A8.5 8.5 0 1 0 119 29" />
      {/* a */}
      <circle cx="138.5" cy="23" r="8.5" />
      <path d="M147 14.5V34" />
      {/* d */}
      <circle cx="164" cy="23" r="8.5" />
      <path d="M172.5 4V34" />
      {/* d */}
      <circle cx="189.5" cy="23" r="8.5" />
      <path d="M198 4V34" />
      {/* . */}
      <circle cx="207" cy="31.3" r="2.7" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * Square app mark — used in the collapsed sidebar and as the favicon.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="TechCadd"
      className={cn('shrink-0', className)}
    >
      <rect width="40" height="40" rx="11" fill="currentColor" />
      <g
        fill="none"
        stroke="#fff"
        strokeWidth={3.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 9v16.5c0 3.7 1.9 5.5 5 5.5" />
        <path d="M12.5 15H23" />
      </g>
      <circle cx="29.2" cy="28.8" r="2.2" fill="#fff" />
    </svg>
  )
}
