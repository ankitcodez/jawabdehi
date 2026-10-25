import { Link } from 'react-router-dom'
import { useT } from '../i18n/I18nContext'
import Button from '../components/ui/Button'

export default function NotFound() {
  const t = useT()
  return (
    <div className="container-prose py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-editorial text-h1 text-ink-900">Page not found</h1>
      <p className="mt-3 font-sans text-body-lg text-ink-500">
        The page you are looking for does not exist or has moved.
      </p>
      <div className="mt-6">
        <Button as={Link} to="/">{t.common.home}</Button>
      </div>
    </div>
  )
}
