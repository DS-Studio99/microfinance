import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVOGroups } from '../hooks/useVOGroups'
import { supabase } from '../lib/supabase'
import { MdAdd, MdGroups, MdPeople, MdArrowForward, MdClose, MdDelete, MdSearch, MdEdit, MdCalendarToday, MdMoreVert } from 'react-icons/md'
import { useSettingsStore } from '../store/settingsStore'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

const gradients = [
  ['#4f46e5','#7c3aed'],
  ['#0891b2','#0e7490'],
  ['#059669','#047857'],
  ['#d97706','#b45309'],
  ['#dc2626','#b91c1c'],
  ['#7c3aed','#6d28d9'],
]

const BANGLA_DAYS = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার']

function formatDateBangla(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d)) return null
  const day = BANGLA_DAYS[d.getDay()]
  // Format: DD/MM
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return { date: `${dd}/${mm}`, day, full: dateStr }
}

/* ── 3-dot Menu for VO Card ── */
const VOCardMenu = ({ onEdit, onDelete, allowEdit, allowDelete }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  if (!allowEdit && !allowDelete) return null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        style={{
          width: 28, height: 28, borderRadius: 7,
          background: open ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
      >
        <MdMoreVert style={{ fontSize: 16 }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 32, right: 0, zIndex: 300,
          background: '#fff', borderRadius: 12,
          boxShadow: '0 8px 30px rgba(15,23,42,0.2)',
          border: '1px solid #e8edf3', overflow: 'hidden', minWidth: 140,
          animation: 'scaleUp 0.15s ease-out',
        }}>
          {allowEdit && (
            <button onClick={e => { e.stopPropagation(); setOpen(false); onEdit() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 0.9rem', border: 'none', background: 'none', color: '#4338ca', fontSize: 13, fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <MdEdit style={{ fontSize: 16 }} />সম্পাদনা
            </button>
          )}
          {allowEdit && allowDelete && <div style={{ height: 1, background: '#f1f5f9' }} />}
          {allowDelete && (
            <button onClick={e => { e.stopPropagation(); setOpen(false); onDelete() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 0.9rem', border: 'none', background: 'none', color: '#dc2626', fontSize: 13, fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <MdDelete style={{ fontSize: 16 }} />মুছে ফেলুন
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const VOCard = ({ vo, memberCount, onDelete, onEdit, onClick, idx, allowEdit, allowDelete }) => {
  const [g1, g2] = gradients[idx % gradients.length]
  const kistiInfo = formatDateBangla(vo.next_kisti_date)

  return (
    <div
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg,${g1},${g2})`,
        borderRadius: 20, overflow: 'hidden',
        cursor: 'pointer', position: 'relative',
        boxShadow: `0 6px 24px ${g1}40`,
        transition: 'transform 0.22s, box-shadow 0.22s',
        animation: `slideUp 0.4s ease-out ${idx * 0.06}s both`,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 14px 40px ${g1}55`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 24px ${g1}40`; }}
    >
      {/* bg blobs */}
      <div style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ position: 'absolute', bottom: -16, right: 10, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '1rem 1.1rem' }}>
        {/* top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MdGroups style={{ color: '#fff', fontSize: 22 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1.1, margin: 0 }}>
                ভিও - {String(vo.vo_number).padStart(2, '0')}
              </h2>
              {vo.vo_name && (
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>
                  {vo.vo_name}
                </p>
              )}
            </div>
          </div>
          <VOCardMenu onEdit={onEdit} onDelete={onDelete} allowEdit={allowEdit} allowDelete={allowDelete} />
        </div>

        {/* Next kisti date highlight */}
        {kistiInfo ? (
          <div style={{
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 10, padding: '5px 10px',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginBottom: '0.6rem',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(4px)'
          }}>
            <MdCalendarToday style={{ color: '#fde68a', fontSize: 13 }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#fde68a', letterSpacing: 0.3 }}>
              {kistiInfo.date}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              ({kistiInfo.day})
            </span>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '4px 10px',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            marginBottom: '0.6rem',
            border: '1px dashed rgba(255,255,255,0.2)'
          }}>
            <MdCalendarToday style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              তারিখ সেট নেই
            </span>
          </div>
        )}

        {/* footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 9px' }}>
            <MdPeople style={{ color: '#fff', fontSize: 13 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif" }}>
              {memberCount} জন
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'rgba(255,255,255,0.85)', fontSize: 11, fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600 }}>
            বিস্তারিত <MdArrowForward style={{ fontSize: 13 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Centered Modal Wrapper ── */
const CenteredModal = ({ onClose, children }) => (
  <div
    style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(5px)',
      padding: '1rem'
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose() }}
  >
    <div style={{
      background: '#fff', width: '100%', maxWidth: 420,
      borderRadius: 24,
      animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow: '0 24px 60px rgba(15,23,42,0.25)',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  </div>
)

const ModalHeader = ({ icon, title, onClose }) => (
  <div style={{
    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
    padding: '1.1rem 1.25rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  }}>
    <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif", display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
      {icon} {title}
    </h2>
    <button
      onClick={onClose}
      style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
    >
      <MdClose style={{ fontSize: 16 }} />
    </button>
  </div>
)

const VOListPage = () => {
  const navigate = useNavigate()
  const { voGroups, loading, addVOGroup, updateVOGroup, deleteVOGroup } = useVOGroups()
  const { allowEdit, allowDelete } = useSettingsStore()
  const [memberCounts, setMemberCounts] = useState({})

  const [showAddModal, setShowAddModal] = useState(false)
  const [newVO, setNewVO] = useState({ vo_number: '', vo_name: '' })
  const [addLoading, setAddLoading] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [editingVO, setEditingVO] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchCounts = async () => {
      if (voGroups.length === 0) return
      const { data } = await supabase.from('members').select('vo_number')
      if (data) {
        const counts = {}
        data.forEach(m => { counts[m.vo_number] = (counts[m.vo_number] || 0) + 1 })
        setMemberCounts(counts)
      }
    }
    fetchCounts()
  }, [voGroups])

  const filteredGroups = voGroups.filter(vo =>
    !search || String(vo.vo_number).includes(search) || vo.vo_name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddVO = async (e) => {
    e.preventDefault()
    if (!newVO.vo_number) { toast.error('ভিও নম্বর প্রবেশ করুন'); return }
    setAddLoading(true)
    const { error } = await addVOGroup({ vo_number: parseInt(newVO.vo_number), vo_name: newVO.vo_name || null })
    setAddLoading(false)
    if (!error) { setNewVO({ vo_number: '', vo_name: '' }); setShowAddModal(false) }
  }

  const handleUpdateVO = async (e) => {
    e.preventDefault()
    if (!editingVO.vo_number) { toast.error('ভিও নম্বর প্রবেশ করুন'); return }
    setEditLoading(true)
    const { error } = await updateVOGroup(editingVO.id, { vo_number: parseInt(editingVO.vo_number), vo_name: editingVO.vo_name || null })
    setEditLoading(false)
    if (!error) { setEditingVO(null); setShowEditModal(false) }
  }

  return (
    <>
      <style>{`
        .vo-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 520px) { .vo-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 900px) { .vo-grid { grid-template-columns: 1fr 1fr 1fr; } }
      `}</style>

      <div className="page-enter">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>ভিও তালিকা</h1>
            <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 3 }}>
              Village Organization গ্রুপসমূহ
            </p>
          </div>
          <button id="add-vo-btn" onClick={() => setShowAddModal(true)} className="btn-primary">
            <MdAdd style={{ fontSize: 20 }} />নতুন ভিও
          </button>
        </div>

        {/* Search */}
        <div className="surface" style={{ padding: '0.75rem', marginBottom: '1.1rem' }}>
          <div style={{ position: 'relative' }}>
            <MdSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 18 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ভিও নম্বর বা নাম খুঁজুন..."
              className="field-input"
              style={{ paddingLeft: 36, fontFamily: "'Hind Siliguri', sans-serif" }}
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="vo-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 150 }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filteredGroups.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <MdGroups style={{ fontSize: 36, color: '#94a3b8' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#334155', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 8 }}>কোনো ভিও পাওয়া যায়নি</h3>
            <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 20 }}>নতুন ভিও গ্রুপ যোগ করুন</p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              <MdAdd style={{ fontSize: 18 }} />প্রথম ভিও যোগ করুন
            </button>
          </div>
        )}

        {/* VO Grid */}
        {!loading && filteredGroups.length > 0 && (
          <div className="vo-grid">
            {filteredGroups.map((vo, idx) => (
              <VOCard
                key={vo.id}
                vo={vo}
                memberCount={memberCounts[vo.vo_number] || 0}
                idx={idx}
                allowEdit={allowEdit}
                allowDelete={allowDelete}
                onClick={() => navigate(`/vo/${vo.vo_number}`)}
                onEdit={() => { setEditingVO(vo); setShowEditModal(true) }}
                onDelete={() => { if (window.confirm('এই ভিও মুছে ফেলতে চান?')) deleteVOGroup(vo.id) }}
              />
            ))}
          </div>
        )}

        {/* ── Add VO Modal (centered) ── */}
        {showAddModal && (
          <CenteredModal onClose={() => setShowAddModal(false)}>
            <ModalHeader
              icon={<MdGroups style={{ color: '#a5b4fc', fontSize: 20 }} />}
              title="নতুন ভিও যোগ করুন"
              onClose={() => setShowAddModal(false)}
            />
            <form onSubmit={handleAddVO} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="field-label">ভিও নম্বর <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  id="new-vo-number"
                  type="number"
                  value={newVO.vo_number}
                  onChange={e => setNewVO(p => ({ ...p, vo_number: e.target.value }))}
                  placeholder="যেমন: ১, ২, ৩..."
                  className="field-input"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                  autoFocus
                />
              </div>
              <div>
                <label className="field-label">ভিও নাম (ঐচ্ছিক)</label>
                <input
                  id="new-vo-name"
                  type="text"
                  value={newVO.vo_name}
                  onChange={e => setNewVO(p => ({ ...p, vo_name: e.target.value }))}
                  placeholder="বিবরণমূলক নাম"
                  className="field-input"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button id="cancel-vo-btn" type="button" onClick={() => setShowAddModal(false)} className="btn-ghost" style={{ flex: 1, padding: '0.8rem' }}>বাতিল</button>
                <button id="submit-vo-btn" type="submit" disabled={addLoading} className="btn-primary" style={{ flex: 1, padding: '0.8rem' }}>
                  {addLoading ? <><div className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />যোগ হচ্ছে...</> : 'ভিও যোগ করুন'}
                </button>
              </div>
            </form>
          </CenteredModal>
        )}

        {/* ── Edit VO Modal (centered) ── */}
        {showEditModal && editingVO && (
          <CenteredModal onClose={() => setShowEditModal(false)}>
            <ModalHeader
              icon={<MdEdit style={{ color: '#a5b4fc', fontSize: 20 }} />}
              title="ভিও সম্পাদনা করুন"
              onClose={() => setShowEditModal(false)}
            />
            <form onSubmit={handleUpdateVO} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="field-label">ভিও নম্বর <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  id="edit-vo-number"
                  type="number"
                  value={editingVO.vo_number}
                  onChange={e => setEditingVO(p => ({ ...p, vo_number: e.target.value }))}
                  className="field-input"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                  autoFocus
                />
              </div>
              <div>
                <label className="field-label">ভিও নাম (ঐচ্ছিক)</label>
                <input
                  id="edit-vo-name"
                  type="text"
                  value={editingVO.vo_name || ''}
                  onChange={e => setEditingVO(p => ({ ...p, vo_name: e.target.value }))}
                  className="field-input"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button id="cancel-edit-vo-btn" type="button" onClick={() => setShowEditModal(false)} className="btn-ghost" style={{ flex: 1, padding: '0.8rem' }}>বাতিল</button>
                <button id="submit-edit-vo-btn" type="submit" disabled={editLoading} className="btn-primary" style={{ flex: 1, padding: '0.8rem' }}>
                  {editLoading ? <><div className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />সেভ হচ্ছে...</> : 'আপডেট করুন'}
                </button>
              </div>
            </form>
          </CenteredModal>
        )}
      </div>
    </>
  )
}

export default VOListPage
