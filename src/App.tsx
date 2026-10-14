import HomePage from './pages/HomePage.tsx'
import GrandPrixPage from './pages/GrandPrixPage.tsx'
import DriverPage from './pages/DriverPage.tsx'
import { Route, Routes } from 'react-router'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/grand-prix/:season/:round" element={<GrandPrixPage />} />
      <Route path="/driver/:season/:driverSlug" element={<DriverPage />} />
    </Routes>
  )
}

export default App
