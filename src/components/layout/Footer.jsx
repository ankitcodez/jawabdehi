import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nContext'
import { languages } from '../../i18n/translations'

export default function Footer() {
  const { t, lang, setLang } = useI18n()

  const columns = [
    {
      title: t.footer.citizen,
      links: [
        { to: '/report', label: t.common.reportComplaint },
        { to: '/my-complaints', label: t.common.myComplaints },
        { to: '/public-record', label: t.common.publicRecord },
      ],
    },
    {
      title: t.footer.legalHelp,
      links: [{ to: '/legal-help', label: t.common.legalHelp }],
    },
    {
      title: t.footer.administration,
      links: [
        { to: '/official-inbox', label: t.common.officialInbox },
        { to: '/reviewer', label: t.common.reviewerWorkspace },
        { to: '/admin', label: t.common.adminSettings },
      ],
    },
  ]

  return (
    <footer className="mt-16 border-t border-sand-200 bg-ivory-100">
      <div className="container-prose py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand + privacy note */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-600 text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
                </svg>
              </span>
              <span className="font-editorial text-h4 text-ink-900 tracking-tight">
                {t.common.appName}
              </span>
            </Link>
            <p className="mt-3 font-sans text-small text-ink-400 leading-1.5 max-w-xs">
              {t.common.footerNote}
            </p>

            {/* Privacy badge */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-sand-200 bg-white px-3 py-2">
              <svg
                className="h-4 w-4 text-teal-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z"
                />
              </svg>
              <p className="font-sans text-caption text-ink-500">{t.footer.privacyNote}</p>
            </div>
          </div>

          {/* Nav columns */}
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
              <p className="font-sans text-caption font-semibold uppercase tracking-[0.12em] text-ink-300">
                {col.title}
              </p>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="font-sans text-small text-ink-500 hover:text-teal-700 transition-colors duration-fast"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Emergency banner */}
        <div className="mt-10 rounded-md border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white flex-shrink-0">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 0 0-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </span>
          <p className="font-sans text-small text-red-800 font-medium">
            {t.footer.emergencyBody}{' '}
            <a
              href="tel:112"
              className="font-semibold underline underline-offset-2 hover:text-red-900 transition-colors"
            >
              {t.common.callNow}
            </a>
          </p>
        </div>

        {/* Bottom bar: language + rights */}
        <div className="mt-8 pt-6 border-t border-sand-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="font-sans text-caption text-ink-400">{t.footer.language}:</span>
            <div className="flex items-center rounded-md border border-sand-300 overflow-hidden">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={[
                    'px-2.5 py-1.5 font-sans text-caption font-semibold transition-colors',
                    lang === l.code
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-ink-500 hover:bg-ivory-100',
                  ].join(' ')}
                  aria-pressed={lang === l.code}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <p className="font-sans text-caption text-ink-300">{t.footer.rights}</p>
        </div>
      </div>
    </footer>
  )
}
