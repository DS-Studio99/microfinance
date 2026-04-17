import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { MdMoreVert, MdGroups } from 'react-icons/md'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', position: 'relative' }}>
      {/* ── Top App Bar ── */}
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 64,
          background: '#fff', borderBottom: '1px solid #e8edf3',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.25rem', zIndex: 40,
          boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            id="sidebar-toggle-btn"
            onClick={toggleSidebar}
            style={{
              width: 40, height: 40, borderRadius: 12, border: 'none',
              background: '#f8fafc', color: '#475569',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
            onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
          >
            <MdMoreVert style={{ fontSize: 24 }} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MdGroups style={{ color: '#fff', fontSize: 18 }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>মাইক্রোফাইন্যান্স</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Right side icons or profile can go here */}
        </div>
      </header>

      {/* ── Sidebar Overlay & Drawer ── */}
      <Navbar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* ── Main Content Area ── */}
      <main
        style={{
          flex: 1,
          paddingTop: 64, // Top bar height
          minHeight: '100vh',
          transition: 'padding-left 0.3s ease',
        }}
      >
        <div style={{ padding: '1.25rem', maxWidth: 1200, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
