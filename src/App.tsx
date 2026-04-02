import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { UniversesPage } from './pages/UniversesPage'
import { CharacterSelectPage } from './pages/CharacterSelectPage'
import { CreateCharacterPage } from './pages/CreateCharacterPage'
import { StoryReaderPage } from './pages/StoryReaderPage'
import { RevealPage } from './pages/RevealPage'
import { FreeChatPage } from './pages/FreeChatPage'
import { SharedRevealPage } from './pages/SharedRevealPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/universes" element={<UniversesPage />} />
        <Route path="/characters" element={<CharacterSelectPage />} />
        <Route path="/create-character" element={<CreateCharacterPage />} />
        <Route path="/story" element={<StoryReaderPage />} />
        <Route path="/reveal" element={<RevealPage />} />
        <Route path="/free-chat" element={<FreeChatPage />} />
        <Route path="/reveal/:id" element={<SharedRevealPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
