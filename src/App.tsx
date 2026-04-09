import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useGameStateSync } from './hooks/useGameStateSync'
import { ProtectedRoute } from './components/ProtectedRoute'
import { FeedbackModal } from './components/FeedbackModal'
import { FeedbackFab } from './components/FeedbackFab'
import { LoginPage } from './pages/LoginPage'
import { LandingPage } from './pages/LandingPage'

import { CharacterSelectPage } from './pages/CharacterSelectPage'
import { CreateCharacterPage } from './pages/CreateCharacterPage'
import { StoryReaderPage } from './pages/StoryReaderPage'
import { RevealPage } from './pages/RevealPage'
import { FreeChatPage } from './pages/FreeChatPage'
import { SharedRevealPage } from './pages/SharedRevealPage'
import { QuestPage } from './pages/QuestPage'
import { HomePage } from './pages/HomePage'
import { CastPage } from './pages/CastPage'
import { CastChatPage } from './pages/CastChatPage'
import { CastGroupChatPage } from './pages/CastGroupChatPage'
import { EditCharacterPage } from './pages/EditCharacterPage'
import { UniverseDetailPage } from './pages/UniverseDetailPage'
import { AccountPage } from './pages/AccountPage'
import { AlbumPage } from './pages/AlbumPage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'

function GameStateSync({ children }: { children: React.ReactNode }) {
  useGameStateSync()
  return <>{children}</>
}

export default function App() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <BrowserRouter>
      <AuthProvider>
        <GameStateSync>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          {/* SharedRevealPage is public — shareable links work without auth */}
          <Route path="/reveal/:id" element={<SharedRevealPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/cast" element={<ProtectedRoute><CastPage /></ProtectedRoute>} />
          <Route path="/cast/group/:ids" element={<ProtectedRoute><CastGroupChatPage /></ProtectedRoute>} />
          <Route path="/cast/:characterId" element={<ProtectedRoute><CastChatPage /></ProtectedRoute>} />

          <Route path="/universes/:id" element={<ProtectedRoute><UniverseDetailPage /></ProtectedRoute>} />
          <Route path="/characters" element={<ProtectedRoute><CharacterSelectPage /></ProtectedRoute>} />
          <Route path="/create-character" element={<ProtectedRoute><CreateCharacterPage /></ProtectedRoute>} />
          <Route path="/edit-character/:charId" element={<ProtectedRoute><EditCharacterPage /></ProtectedRoute>} />
          <Route path="/story" element={<ProtectedRoute><StoryReaderPage /></ProtectedRoute>} />
          <Route path="/reveal" element={<ProtectedRoute><RevealPage /></ProtectedRoute>} />
          <Route path="/free-chat" element={<ProtectedRoute><FreeChatPage /></ProtectedRoute>} />
          <Route path="/quest/:questId" element={<ProtectedRoute><QuestPage /></ProtectedRoute>} />
          <Route path="/album" element={<ProtectedRoute><AlbumPage /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <FeedbackFab onClick={() => setFeedbackOpen(true)} />
        <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
        </GameStateSync>
      </AuthProvider>
    </BrowserRouter>
  )
}
