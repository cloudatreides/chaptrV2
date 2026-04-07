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
import { HomePage } from './pages/HomePage'
import { CastPage } from './pages/CastPage'
import { CastChatPage } from './pages/CastChatPage'
import { CastGroupChatPage } from './pages/CastGroupChatPage'
import { EditCharacterPage } from './pages/EditCharacterPage'
import { UniverseDetailPage } from './pages/UniverseDetailPage'
import { AccountPage } from './pages/AccountPage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
          <Route path="/universes" element={<ProtectedRoute><UniversesPage /></ProtectedRoute>} />
          <Route path="/universes/:id" element={<ProtectedRoute><UniverseDetailPage /></ProtectedRoute>} />
          <Route path="/characters" element={<ProtectedRoute><CharacterSelectPage /></ProtectedRoute>} />
          <Route path="/create-character" element={<ProtectedRoute><CreateCharacterPage /></ProtectedRoute>} />
          <Route path="/edit-character/:charId" element={<ProtectedRoute><EditCharacterPage /></ProtectedRoute>} />
          <Route path="/story" element={<ProtectedRoute><StoryReaderPage /></ProtectedRoute>} />
          <Route path="/reveal" element={<ProtectedRoute><RevealPage /></ProtectedRoute>} />
          <Route path="/free-chat" element={<ProtectedRoute><FreeChatPage /></ProtectedRoute>} />
          <Route path="/quest/:questId" element={<ProtectedRoute><QuestPage /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
