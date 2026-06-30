import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BuilderPage from './pages/BuilderPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/builder" element={<BuilderPage />} />
    </Routes>
  )
}
