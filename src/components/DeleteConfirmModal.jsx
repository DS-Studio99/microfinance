import React from 'react'
import { MdWarning, MdDelete, MdClose } from 'react-icons/md'

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, memberName, loading }) => {
  if (!isOpen) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(5px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff',
        width: '100%', maxWidth: 420,
        borderRadius: '24px 24px 0 0',
        animation: 'slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 -8px 40px rgba(15,23,42,0.2)',
        overflow: 'hidden',
      }}>
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0' }} />
        </div>

        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1rem 0' }}>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <MdClose style={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', padding: '0.5rem 1.5rem 1.5rem' }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg,#fef2f2,#fee2e2)',
            border: '2px solid #fca5a5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <MdWarning style={{ fontSize: 34, color: '#ef4444' }} />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 6, fontFamily: "'Hind Siliguri', sans-serif" }}>
            সদস্য মুছে ফেলুন
          </h2>
          {memberName && (
            <p style={{ fontSize: 14, fontWeight: 600, color: '#4f46e5', marginBottom: 10 }}>{memberName}</p>
          )}
          <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6, fontFamily: "'Hind Siliguri', sans-serif" }}>
            আপনি কি নিশ্চিত যে এই সদস্যকে মুছে ফেলতে চান?<br />
            <span style={{ color: '#ef4444', fontWeight: 600 }}>এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</span>
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, padding: '0 1.25rem 1.5rem' }}>
          <button
            id="delete-cancel-btn"
            onClick={onClose}
            disabled={loading}
            className="btn-ghost"
            style={{ flex: 1, padding: '0.8rem' }}
          >
            বাতিল
          </button>
          <button
            id="delete-confirm-btn"
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '0.8rem', borderRadius: 12, border: 'none',
              background: loading ? '#fca5a5' : 'linear-gradient(135deg,#dc2626,#ef4444)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              fontFamily: "'Hind Siliguri', sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />মুছছে...</>
            ) : (
              <><MdDelete style={{ fontSize: 18 }} />হ্যাঁ, মুছে ফেলুন</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
