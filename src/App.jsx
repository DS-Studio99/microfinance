import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import SplashScreen from './components/SplashScreen'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AllMembersPage from './pages/AllMembersPage'
import VOListPage from './pages/VOListPage'
import VODetailPage from './pages/VODetailPage'
import DueReportPage from './pages/DueReportPage'
import SettingsPage from './pages/SettingsPage'
import TodayKistiPage from './pages/TodayKistiPage'
import TomorrowKistiPage from './pages/TomorrowKistiPage'
import CollectionsPage from './pages/CollectionsPage'
import TotalDueAmountPage from './pages/TotalDueAmountPage'
import NewLoanPage from './pages/NewLoanPage'
import BookCollectionPage from './pages/BookCollectionPage'
import NotesPage from './pages/NotesPage'

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full spinner" />
          <p className="text-slate-500 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            লোড হচ্ছে...
          </p>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

const App = () => {
  const { initialize } = useAuthStore()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Toaster */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
            fontSize: '14px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
          success: {
            style: {
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #86efac',
            },
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
            },
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />

      {/* Routes */}
      {!showSplash && (
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="members" element={<AllMembersPage />} />
            <Route path="vo-list" element={<VOListPage />} />
            <Route path="vo/:voNumber" element={<VODetailPage />} />
            <Route path="due-report" element={<DueReportPage />} />
            <Route path="today-kisti" element={<TodayKistiPage />} />
            <Route path="tomorrow-kisti" element={<TomorrowKistiPage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="total-due-amount" element={<TotalDueAmountPage />} />
            <Route path="new-loan" element={<NewLoanPage />} />
            <Route path="book-collection" element={<BookCollectionPage />} />
            <Route path="notes" element={<NotesPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App
