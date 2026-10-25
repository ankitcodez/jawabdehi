import { useEffect, useRef, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nContext'
import { languages } from '../../i18n/translations'

const primaryLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/report', key: 'report' },
  { to: '/my-complaints', key: 'myComplaints' },
  { to: '/public-record', key: 'publicRecord' },
]

const moreGroups = [
  {
    groupKey: 'groupOfficial',
    items: [
      { to: '/official-inbox', key: 'officialInbox' },
      { to: '/reviewer', key: 'reviewerWorkspace' },
    ],
  },
  {
    groupKey: 'groupAdmin',
    items: [
      { to: '/legal-help', key: 'legalHelp' },
      { to: '/admin', key: 'adminSettings' },
    ],
  },
]

function LanguageSwitcher({ compact = false }) {
  const { lang, setLang, t } = useI18n()

  return (
    <div
      className={[
        'flex items-center rounded-md border border-sand-300 overflow-hidden',
        compact ? '' : 'flex-shrink-0',
      ].join(' ')}
      role="group"
      aria-label={t.common.language}
    >
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
  )
}

export default function Header() {
  const { t } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef(null)

  useEffect(() => {
    if (!moreOpen) return

    function handleClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false)
      }
    }

    function handleKey(e) {
      if (e.key === 'Escape') setMoreOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [moreOpen])

  const linkClass = ({ isActive }) =>
    [
      'font-sans text-small font-medium px-3 py-2 rounded-md transition-colors whitespace-nowrap',
      isActive
        ? 'text-teal-700 bg-teal-50'
        : 'text-ink-600 hover:text-ink-900 hover:bg-ivory-100',
    ].join(' ')

  const mobileLinkClass = ({ isActive }) =>
    [
      'font-sans text-body font-medium px-3 py-2.5 rounded-md transition-colors',
      isActive
        ? 'text-teal-700 bg-teal-50'
        : 'text-ink-700 hover:text-ink-900 hover:bg-ivory-100',
    ].join(' ')

  const getLinkLabel = (item) =>
    item.label || t.nav[item.key]

  return (
    <header className="sticky top-0 z-50 bg-ivory-50/95 backdrop-blur-sm border-b border-sand-200">
      <div className="container-prose">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 flex-shrink-0"
            onClick={() => setMobileOpen(false)}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-600 text-white">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"
                />
              </svg>
            </span>
            <span className="font-editorial text-h4 text-ink-900 tracking-tight">
              {t.common.appName}
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary"
          >
            {primaryLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => setMobileOpen(false)}
              >
                {getLinkLabel(item)}
              </NavLink>
            ))}

            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                className={[
                  'font-sans text-small font-medium px-3 py-2 rounded-md transition-colors inline-flex items-center gap-1',
                  moreOpen
                    ? 'text-teal-700 bg-teal-50'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ivory-100',
                ].join(' ')}
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                {t.nav.more}
                <svg
                  className={[
                    'h-3.5 w-3.5 transition-transform duration-fast',
                    moreOpen ? 'rotate-180' : '',
                  ].join(' ')}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 rounded-lg border border-sand-200 bg-white shadow-md py-2">
                  {moreGroups.map((group, gi) => (
                    <div
                      key={group.groupKey}
                      className={
                        gi > 0
                          ? 'mt-1 pt-1 border-t border-sand-200'
                          : ''
                      }
                    >
                      <p className="px-4 py-1 font-sans text-caption font-semibold uppercase tracking-[0.12em] text-ink-300">
                        {t.nav[group.groupKey]}
                      </p>

                      {group.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className="block px-4 py-2 font-sans text-small text-ink-600 hover:text-teal-700 hover:bg-ivory-50 transition-colors"
                          onClick={() => setMoreOpen(false)}
                        >
                          {getLinkLabel(item)}
                        </NavLink>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Language switcher and mobile menu button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <button
              className="md:hidden p-2 rounded-md text-ink-600 hover:bg-ivory-100 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={
                mobileOpen
                  ? t.common.closeMenu
                  : t.common.openMenu
              }
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileOpen && (
          <nav
            className="md:hidden pb-4 pt-1 border-t border-sand-200"
            aria-label="Mobile primary"
          >
            <div className="flex flex-col gap-0.5">
              {primaryLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={mobileLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  {getLinkLabel(item)}
                </NavLink>
              ))}

              {moreGroups.map((group) =>
                group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={mobileLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    {getLinkLabel(item)}
                  </NavLink>
                )),
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 px-1">
              <span className="font-sans text-small font-semibold text-ink-400">
                {t.common.language}
              </span>
              <LanguageSwitcher compact />
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}