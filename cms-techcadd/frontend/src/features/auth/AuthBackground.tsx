/**
 * Abstract product backdrop for the signed-out pages — a deep navy to
 * indigo/violet field with a few soft geometric shapes and a glow that lifts
 * the card off the page. No photography, by design.
 */
export function AuthBackground() {
  return (
    <div
      // Purely decorative: it carries no information a screen reader needs.
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="auth-backdrop size-full" />

      {/* Glow behind the card. Sits under the glass so the card edges catch a
          little light instead of sitting flat on the gradient. */}
      <div className="absolute top-1/2 left-1/2 h-136 w-184 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/18 blur-[130px]" />

      {/* Outlined shapes. Hidden below `sm` — on a phone the card covers most of
          the viewport, so they would only crowd it. */}
      <div className="absolute -top-40 -left-32 hidden size-120 rounded-full border border-white/8 bg-white/3 sm:block" />
      <div className="absolute top-1/4 -right-40 hidden size-136 rounded-full border border-white/6 bg-primary-400/5 sm:block" />
      <div className="absolute -bottom-48 left-1/4 hidden size-104 rounded-full border border-white/6 bg-white/2 sm:block" />
      <div className="absolute top-24 right-1/4 hidden size-36 rotate-12 rounded-[2.25rem] border border-white/10 bg-white/4 lg:block" />
      <div className="absolute bottom-28 left-1/5 hidden size-24 -rotate-12 rounded-3xl border border-white/8 bg-white/3 lg:block" />
    </div>
  )
}
