import React from 'react'
import { MdSettings, MdEditDocument, MdSecurity, MdDelete } from 'react-icons/md'
import { useSettingsStore } from '../store/settingsStore'

const SettingsPage = () => {
  const { allowEdit, allowDelete, toggleAllowEdit, toggleAllowDelete } = useSettingsStore()

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MdSettings style={{ color: '#fff', fontSize: 22 }} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>
            সেটিংস
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 2 }}>
            সিস্টেমের বিভিন্ন নিয়ন্ত্রণ অপশন
          </p>
        </div>
      </div>

      <div style={{
        background: '#fff', borderRadius: 18, border: '1px solid #e8edf3',
        padding: '1.25rem', boxShadow: '0 2px 10px rgba(15,23,42,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 15 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MdSecurity style={{ color: '#ef4444', fontSize: 20 }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', fontFamily: "'Hind Siliguri', sans-serif" }}>ডাটা সম্পাদনা ও মুছে ফেলা</h3>
            <p style={{ fontSize: 12.5, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 4, lineHeight: 1.5 }}>
              এই অপশনগুলি বন্ধ করলে সাধারণ ব্যবহারকারীরা মেম্বার ও ভিও (VO) এর তথ্য সম্পাদনা (Edit) বা মুছে (Delete) ফেলতে পারবেন না।
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Edit Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: allowEdit ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${allowEdit ? '#86efac' : '#e2e8f0'}`,
            padding: '0.85rem 1.1rem', borderRadius: 14,
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdEditDocument style={{ fontSize: 20, color: allowEdit ? '#22c55e' : '#94a3b8' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#334155', fontFamily: "'Hind Siliguri', sans-serif" }}>
                ডাটা এডিট অনাবেল করুন
              </span>
            </div>
            
            <label style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
              <input type="checkbox" checked={allowEdit} onChange={toggleAllowEdit} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              <div style={{
                width: 48, height: 26, borderRadius: 13,
                background: allowEdit ? '#22c55e' : '#cbd5e1',
                position: 'relative', transition: 'background 0.25s',
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: 3, width: 20, height: 20, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                  transform: allowEdit ? 'translateX(22px)' : 'translateX(0)',
                }} />
              </div>
            </label>
          </div>

          {/* Delete Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: allowDelete ? '#fef2f2' : '#f8fafc',
            border: `1px solid ${allowDelete ? '#fca5a5' : '#e2e8f0'}`,
            padding: '0.85rem 1.1rem', borderRadius: 14,
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdDelete style={{ fontSize: 20, color: allowDelete ? '#ef4444' : '#94a3b8' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#334155', fontFamily: "'Hind Siliguri', sans-serif" }}>
                ডাটা ডিলিট অনাবেল করুন
              </span>
            </div>
            
            <label style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
              <input type="checkbox" checked={allowDelete} onChange={toggleAllowDelete} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              <div style={{
                width: 48, height: 26, borderRadius: 13,
                background: allowDelete ? '#ef4444' : '#cbd5e1',
                position: 'relative', transition: 'background 0.25s',
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: 3, width: 20, height: 20, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                  transform: allowDelete ? 'translateX(22px)' : 'translateX(0)',
                }} />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
