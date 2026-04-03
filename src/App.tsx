import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { LandingPage } from './pages/LandingPage'
import { UniversesPage } from './pages/UniversesPage'
import { CharacterSelectPage } from './pages/CharacterSelectPage'
import { CreateCharacterPage } from './pages/CreateCharacterPage'
import { StoryReaderPage } from './pages/StoryReaderPage'
import { RevealPage } from './pages/RevealPage'
import { FreeChatPage } from './pages/FreeChatPage'
import { SharedRevealPage } from './pages/SharedRevealPage'
import { QuestPage } from './pages/QuestPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* SharedRevealPage is public — shareable links work without auth */}
          <Route path="/reveal/:id" element={<SharedRevealPage />} />
          <Route path="/" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
          <Route path="/universes" element={<ProtectedRoute><UniversesPage /></ProtectedRoute>} />
          <Route path="/characters" element={<ProtectedRoute><CharacterSelectPage /></ProtectedRoute>} />
          <Route path="/create-character" element={<ProtectedRoute><CreateCharacterPage /></ProtectedRoute>} />
          <Route path="/story" element={<ProtectedRoute><StoryReaderPage /></ProtectedRoute>} />
          <Route path="/reveal" element={<ProtectedRoute><RevealPage /></ProtectedRoute>} />
          <Route path="/free-chat" element={<ProtectedRoute><FreeChatPage /></ProtectedRoute>} />
          <Route path="/quest/:questId" element={<ProtectedRoute><QuestPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
