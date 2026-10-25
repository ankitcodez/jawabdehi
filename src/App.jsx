import { I18nProvider } from './i18n/I18nContext'
import Router from './Router'

export default function App() {
  return (
    <I18nProvider>
      <Router />
    </I18nProvider>
  )
}
