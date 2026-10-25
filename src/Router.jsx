import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Report from './pages/Report'
import MyComplaints from './pages/MyComplaints'
import ComplaintDetails from './pages/ComplaintDetails'
import OfficialInbox from './pages/OfficialInbox'
import Reviewer from './pages/Reviewer'
import PublicRecord from './pages/PublicRecord'
import LegalHelp from './pages/LegalHelp'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/report', element: <Report /> },
      { path: '/my-complaints', element: <MyComplaints /> },
      { path: '/complaints/:id', element: <ComplaintDetails /> },
      { path: '/official-inbox', element: <OfficialInbox /> },
      { path: '/reviewer', element: <Reviewer /> },
      { path: '/public-record', element: <PublicRecord /> },
      { path: '/legal-help', element: <LegalHelp /> },
      { path: '/admin', element: <Admin /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function Router() {
  return <RouterProvider router={router} />
}