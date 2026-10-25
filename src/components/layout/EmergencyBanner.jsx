export default function EmergencyBanner() {
  return (
    <div
      role="region"
      aria-label="Emergency notice"
      className="w-full bg-red-700 text-white"
    >
      <div className="container-prose flex items-center justify-center gap-2 py-1.5 px-4 text-center">
        <svg
          className="h-4 w-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 0 0-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
          />
        </svg>
        <p className="font-sans text-caption font-medium leading-1.4">
          If there is immediate danger, call 112 in India.{' '}
          <a
            href="tel:112"
            className="underline underline-offset-2 font-semibold hover:text-red-100 transition-colors"
          >
            Call 112
          </a>
        </p>
      </div>
    </div>
  )
}
