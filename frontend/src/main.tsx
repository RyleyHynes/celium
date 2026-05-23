import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './celium/auth'
import 'leaflet/dist/leaflet.css'
import './index.css'
import './styles/global.scss'

/**
 * Mounts the root React tree with strict mode and client-side routing configured.
 *
 * @remarks
 * The BrowserRouter uses the Vite-provided `BASE_URL` so the app can deploy to subpaths.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter
        basename={import.meta.env.BASE_URL}
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)
