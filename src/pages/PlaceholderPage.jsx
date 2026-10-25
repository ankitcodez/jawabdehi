import PageHeader from '../components/ui/PageHeader'
import Alert from '../components/ui/Alert'
import { useT } from '../i18n/I18nContext'

export default function PlaceholderPage({ pageKey, children }) {
  const t = useT()
  const content = t[pageKey]

  return (
    <div className="container-prose py-10 sm:py-16">
      <PageHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} />
      <div className="mt-8">
        <Alert variant="neutral" title={t.common.comingSoon}>
          {content.notice}
        </Alert>
        {children}
      </div>
    </div>
  )
}
