import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HomePage from './pages/HomePage.tsx'
import GrandPrixPage from './pages/GrandPrixPage.tsx'
import { BrowserRouter, Route, Routes } from "react-router"
import { getOpenF1RetryDelay } from './api/openf1-api'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } }).response?.status
        return status === 429 ? failureCount < 1 : failureCount < 2
      },
      retryDelay: (failureCount, error) =>
        getOpenF1RetryDelay(error) ?? Math.min(1_000 * 2 ** failureCount, 30_000),
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/grand-prix/:season/:round" element={<GrandPrixPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
