import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { UploadPage } from './pages/UploadPage'
import { UniversesPage } from './pages/UniversesPage'
import { BioPage } from './pages/BioPage'
import { StoryReaderPage } from './pages/StoryReaderPage'
import { RevealPage } from './pages/RevealPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/universes" element={<UniversesPage />} />
        <Route path="/bio" element={<BioPage />} />
        <Route path="/story" element={<StoryReaderPage />} />
        <Route path="/reveal" element={<RevealPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
