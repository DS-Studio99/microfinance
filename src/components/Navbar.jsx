import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  MdDashboard, MdPeople, MdGroups, MdLogout,
  MdClose, MdSettings, MdAccountCircle
} from 'react-icons/md'

const navItems = [
  { to: '/dashboard', icon: MdDashboard, label: 'ড্যাশবোর্ড' },
  { to: '/members',   icon: MdPeople,    label: 'সকল সদস্য' },
  { to: '/vo-list',   icon: MdGroups,    label: 'ভিও তালিকা' },
  { to: '/settings',  icon: MdSettings,  label: 'সেটিংস' },
]

const NavItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0.9rem 1.1rem',
      borderRadius: 14,
      fontFamily: "'Hind Siliguri', sans-serif",
      fontSize: 14, fontWeight: isActive ? 700 : 500,
      position: 'relative',
      textDecoration: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      color: isActive ? '#fff' : '#64748b',
      background: isActive ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent',
      boxShadow: isActive ? '0 8px 24px rgba(79, 70, 229, 0.25)' : 'none',
      marginBottom: 6,
    })}
    className={({ isActive }) => (isActive ? '' : 'nav-item-hover')}
  >
    {({ isActive }) => (
      <>
        {/* Dynamic Icon Wrapper */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
          color: isActive ? '#fff' : '#94a3b8',
          width: 32, height: 32, borderRadius: 10,
          transition: 'all 0.3s ease',
        }}>
          <Icon style={{ fontSize: 18 }} />
        </div>
        
        <span style={{ flex: 1, letterSpacing: 0.3 }}>{label}</span>

        {/* Active Indicator Line */}
        {isActive && (
          <div style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            width: 6, height: 6, borderRadius: '50%', background: '#fff',
            boxShadow: '0 0 10px rgba(255,255,255,0.8)'
          }} />
        )}
      </>
    )}
  </NavLink>
)

const Navbar = ({ isOpen, onClose }) => {
  const { signOut, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    onClose()
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <style>{`
        .nav-item-hover:hover {
          background-color: #f8fafc !important;
          color: #334155 !important;
          transform: translateX(4px);
        }
        .nav-item-hover:hover > div {
          background-color: #e2e8f0 !important;
          color: #4f46e5 !important;
        }
      `}</style>
      
      {/* Backdrop with a deeper dark blur */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 45,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(8px)',
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={onClose}
      />

      {/* Modern Drawer */}
      <aside
        style={{
          width: 300,
          background: '#ffffff',
          position: 'fixed',
          left: isOpen ? 0 : -300,
          top: 0, bottom: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy slide
          boxShadow: isOpen ? '20px 0 60px rgba(0,0,0,0.15)' : 'none',
          borderRight: '1px solid rgba(226, 232, 240, 0.5)',
        }}
      >
        {/* Sidebar Header with Premium Gradient Background */}
        <div style={{
          padding: '2rem 1.5rem 1.5rem',
          background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c1.38 0 2.5-1.12 2.5-2.5S12.38 13 11 13s-2.5 1.12-2.5 2.5S9.62 18 11 18zm80 50c1.38 0 2.5-1.12 2.5-2.5S92.38 63 91 63s-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5z\' fill=\'%23f8fafc\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E"), linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
          boxShadow: '0 4px 20px rgba(67, 56, 202, 0.2)',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative blur blob */}
          <div style={{ position: 'absolute', top: -30, right: -20, width: 100, height: 100, background: 'rgba(99, 102, 241, 0.4)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MdGroups style={{ color: '#fff', fontSize: 26 }} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', lineHeight: 1.2, fontFamily: "'Hind Siliguri', sans-serif", letterSpacing: 0.5 }}>মাইক্রোফাইন্যান্স</p>
              <p style={{ fontSize: 11.5, color: '#a5b4fc', fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 500 }}>সদস্য ব্যবস্থাপনা</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: 10, border: 'none',
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative', zIndex: 1
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <MdClose style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav style={{ flex: 1, padding: '1.75rem 1.25rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase', padding: '0 0.5rem', marginBottom: 16 }}>মেনু অপশন</p>
          {navItems.map(item => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}
        </nav>

        {/* Premium User Card & Logout Footer */}
        <div style={{ padding: '1.25rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 18, padding: '1rem', marginBottom: 12,
            boxShadow: '0 2px 10px rgba(15,23,42,0.02)',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdAccountCircle style={{ color: '#6366f1', fontSize: 24 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600, marginBottom: 2 }}>অ্যাডমিন অ্যাকাউন্ট</p>
              <p style={{ fontSize: 13, color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
            </div>
          </div>
          
          <button
            id="logout-btn"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '0.85rem 1rem',
              borderRadius: 14, border: '1px solid #fca5a5',
              background: '#fef2f2', color: '#dc2626',
              fontSize: 14, fontWeight: 700,
              fontFamily: "'Hind Siliguri', sans-serif",
              cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.color = '#dc2626';
            }}
          >
            <MdLogout style={{ fontSize: 18 }} />
            লগআউট করুন
          </button>
        </div>
      </aside>
    </>
  )
}

export default Navbar
