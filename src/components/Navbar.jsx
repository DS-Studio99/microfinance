import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  MdDashboard, MdPeople, MdGroups, MdLogout,
  MdClose, MdSettings, MdAccountCircle,
  MdKeyboardArrowRight
} from 'react-icons/md'

const navItems = [
  { to: '/dashboard', icon: MdDashboard, label: 'ড্যাশবোর্ড', desc: 'Overview' },
  { to: '/members',   icon: MdPeople,    label: 'সকল সদস্য', desc: 'Members' },
  { to: '/vo-list',   icon: MdGroups,    label: 'ভিও তালিকা', desc: 'VO List' },
  { to: '/settings',  icon: MdSettings,  label: 'সেটিংস', desc: 'Settings' },
]

const NavItem = ({ to, icon: Icon, label, desc, onClick }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <NavLink
      to={to}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '0.85rem 1rem',
        borderRadius: 16,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontSize: 14, fontWeight: isActive ? 700 : 500,
        position: 'relative',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        color: isActive ? '#fff' : hovered ? '#c7d2fe' : 'rgba(203, 213, 225, 0.7)',
        background: isActive
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(139, 92, 246, 0.2))'
          : hovered
            ? 'rgba(99, 102, 241, 0.08)'
            : 'transparent',
        border: isActive
          ? '1px solid rgba(99, 102, 241, 0.3)'
          : '1px solid transparent',
        boxShadow: isActive ? '0 4px 20px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
        marginBottom: 4,
        backdropFilter: isActive ? 'blur(10px)' : 'none',
      })}
    >
      {({ isActive }) => (
        <>
          {/* Icon wrapper */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 12,
            background: isActive
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.3))'
              : hovered
                ? 'rgba(99, 102, 241, 0.12)'
                : 'rgba(148, 163, 184, 0.08)',
            border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
            transition: 'all 0.3s ease',
            boxShadow: isActive ? '0 2px 8px rgba(99, 102, 241, 0.2)' : 'none',
          }}>
            <Icon style={{
              fontSize: 18,
              color: isActive ? '#a5b4fc' : hovered ? '#818cf8' : 'rgba(148, 163, 184, 0.6)',
              transition: 'color 0.3s ease',
            }} />
          </div>
          
          <div style={{ flex: 1 }}>
            <span style={{
              display: 'block',
              letterSpacing: 0.3,
              lineHeight: 1.2,
            }}>{label}</span>
            {isActive && (
              <span style={{
                display: 'block',
                fontSize: 10,
                color: 'rgba(165, 180, 252, 0.6)',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginTop: 1,
              }}>{desc}</span>
            )}
          </div>

          {/* Active indicator */}
          {isActive && (
            <div style={{
              width: 4, height: 20, borderRadius: 4,
              background: 'linear-gradient(180deg, #818cf8, #6366f1)',
              boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)',
              position: 'absolute', right: 8,
            }} />
          )}

          {/* Hover arrow */}
          {!isActive && hovered && (
            <MdKeyboardArrowRight style={{
              fontSize: 16, color: 'rgba(148, 163, 184, 0.5)',
              position: 'absolute', right: 12,
            }} />
          )}
        </>
      )}
    </NavLink>
  )
}

const Navbar = ({ isOpen, onClose }) => {
  const { signOut, user } = useAuthStore()
  const navigate = useNavigate()
  const [logoutHovered, setLogoutHovered] = useState(false)

  const handleLogout = async () => {
    onClose()
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <style>{`
        @keyframes sidebarSlideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes sidebarOrbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(10px, -15px) scale(1.1); }
        }
        @keyframes sidebarPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
      
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 45,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <aside
        style={{
          width: 300,
          background: 'linear-gradient(180deg, #0f0f23 0%, #131332 40%, #0d1120 100%)',
          position: 'fixed',
          left: isOpen ? 0 : -300,
          top: 0, bottom: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transition: 'left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: isOpen ? '20px 0 80px rgba(0,0,0,0.5), 4px 0 20px rgba(99, 102, 241, 0.1)' : 'none',
          borderRight: '1px solid rgba(99, 102, 241, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: -50, right: -50,
            width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12), transparent 70%)',
            animation: 'sidebarOrbFloat 8s ease-in-out infinite',
            filter: 'blur(30px)',
          }} />
          <div style={{
            position: 'absolute', bottom: 50, left: -30,
            width: 150, height: 150,
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent 70%)',
            animation: 'sidebarOrbFloat 10s ease-in-out infinite reverse',
            filter: 'blur(25px)',
          }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '1.75rem 1.5rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative',
          borderBottom: '1px solid rgba(99, 102, 241, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
            {/* Logo */}
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.15)',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.3), transparent 60%)',
              }} />
              <span style={{
                position: 'relative', zIndex: 2,
                fontFamily: "'Inter', sans-serif",
                fontSize: 16, fontWeight: 900,
                background: 'linear-gradient(135deg, #e0e7ff, #fff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: 1,
              }}>SM</span>
            </div>

            <div>
              <p style={{
                fontSize: 16, fontWeight: 800, lineHeight: 1.2,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '-0.01em',
                background: 'linear-gradient(135deg, #e0e7ff, #fff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>SM Brac Panel</p>
              <p style={{
                fontSize: 10.5,
                fontFamily: "'Inter', sans-serif",
                color: 'rgba(148, 163, 184, 0.5)',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: 2,
              }}>Management System</p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(99, 102, 241, 0.15)',
              background: 'rgba(99, 102, 241, 0.06)',
              color: 'rgba(148, 163, 184, 0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative', zIndex: 1,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
              e.currentTarget.style.color = '#a5b4fc';
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)';
              e.currentTarget.style.color = 'rgba(148, 163, 184, 0.6)';
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.15)';
            }}
          >
            <MdClose style={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav style={{
          flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column',
          overflowY: 'auto', position: 'relative', zIndex: 1,
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', padding: '0 0.5rem', marginBottom: 14,
            color: 'rgba(148, 163, 184, 0.35)',
            fontFamily: "'Inter', sans-serif",
          }}>Navigation</p>

          {navItems.map(item => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}

          {/* Decorative separator */}
          <div style={{
            height: 1, margin: '16px 12px',
            background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.15), transparent)',
          }} />

          {/* Version badge */}
          <div style={{
            padding: '8px 14px',
            borderRadius: 10,
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.08)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)',
              animation: 'sidebarPulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: 11, color: 'rgba(148, 163, 184, 0.4)',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
            }}>System Active • v2.0</span>
          </div>
        </nav>

        {/* User Card & Logout Footer */}
        <div style={{
          padding: '1rem 1rem 1.25rem',
          borderTop: '1px solid rgba(99, 102, 241, 0.08)',
          position: 'relative', zIndex: 1,
        }}>
          {/* User info card */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            borderRadius: 16, padding: '0.85rem 1rem', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 12,
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MdAccountCircle style={{ color: '#818cf8', fontSize: 22 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'rgba(148, 163, 184, 0.4)',
                fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 2,
              }}>Admin</p>
              <p style={{
                fontSize: 12.5, color: 'rgba(203, 213, 225, 0.8)', fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{user?.email}</p>
            </div>
          </div>
          
          {/* Logout button */}
          <button
            id="logout-btn"
            onClick={handleLogout}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '0.75rem 1rem',
              borderRadius: 14,
              border: logoutHovered ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(239, 68, 68, 0.15)',
              background: logoutHovered
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.15))'
                : 'rgba(239, 68, 68, 0.06)',
              color: logoutHovered ? '#fca5a5' : 'rgba(239, 68, 68, 0.5)',
              fontSize: 13, fontWeight: 700,
              fontFamily: "'Hind Siliguri', sans-serif",
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: logoutHovered ? '0 4px 16px rgba(239, 68, 68, 0.1)' : 'none',
            }}
          >
            <MdLogout style={{ fontSize: 16 }} />
            লগআউট করুন
          </button>
        </div>
      </aside>
    </>
  )
}

export default Navbar
