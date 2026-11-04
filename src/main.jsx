import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './responsive.css'
import './components/ResponsiveTables.css'
import App from './App.jsx'
import AccessScopeBoundary from './components/AccessScopeBoundary.jsx'
import { ToastProvider } from './components/ToastProvider.jsx'
import { recoverBrowserPageLoad } from './utils/pageLoadRecovery'

window.addEventListener('vite:preloadError', event => {
  if (recoverBrowserPageLoad(event.payload)) event.preventDefault()
})

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter><AccessScopeBoundary><App /></AccessScopeBoundary></BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
)
