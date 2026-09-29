import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HomePage from './pages/HomePage.tsx'
import GrandPrixPage from './pages/GrandPrixPage.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* <HomePage /> */}
      <GrandPrixPage country_name='Monaco'/>
    </QueryClientProvider>
  </StrictMode>
)
