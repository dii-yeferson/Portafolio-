/** Monograma «DY» para la barra del panel. */
export function StudioIcon() {
  return (
    <svg
      viewBox="0 0 44 30"
      fill="none"
      aria-hidden="true"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="studio-y" x1="18" y1="3" x2="40" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffd0b1" />
          <stop offset="0.5" stopColor="#f0b08a" />
          <stop offset="1" stopColor="#c98e6e" />
        </linearGradient>
      </defs>
      <path
        d="M4 4.5h7.5a10.5 10.5 0 0 1 0 21H4z"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 4.5 29 15.5l8.5-11M29 15.5v10"
        stroke="url(#studio-y)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
