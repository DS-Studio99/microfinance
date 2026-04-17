import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVOGroups } from '../hooks/useVOGroups'
import { supabase } from '../lib/supabase'
import { MdAdd, MdGroups, MdPeople, MdArrowForward, MdClose, MdDelete, MdSearch, MdEdit } from 'react-icons/md'
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

const VOCard = ({ vo, memberCount, onDelete, onEdit, onClick, idx, allowEdit, allowDelete }) => {
  const [g1, g2] = gradients[idx % gradients.length]
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

      <div style={{ position: 'relative', zIndex: 1, padding: '1.2rem' }}>
        {/* top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MdGroups style={{ color: '#fff', fontSize: 24 }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {allowEdit && (
              <button
                onClick={e => { e.stopPropagation(); onEdit() }}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                title="সম্পাদনা করুন"
              >
                <MdEdit style={{ fontSize: 16 }} />
              </button>
            )}
            {allowDelete && (
              <button
                onClick={e => { e.stopPropagation(); onDelete() }}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,100,100,0.4)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                title="মুছে ফেলুন"
              >
                <MdDelete style={{ fontSize: 16 }} />
              </button>
            )}
          </div>
        </div>

        {/* VO number */}
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1.2, marginBottom: 2 }}>
          ভিও নং- {String(vo.vo_number).padStart(2, '0')}
        </h2>
        {vo.vo_name && (
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 12 }}>
            {vo.vo_name}
          </p>
        )}

        {/* footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: vo.vo_name ? 0 : 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 10px' }}>
            <MdPeople style={{ color: '#fff', fontSize: 14 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif" }}>
              {memberCount} জন সদস্য
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600 }}>
            বিস্তারিত <MdArrowForward style={{ fontSize: 14 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

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
              <div key={i} className="skeleton" style={{ height: 160 }} />
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

        {/* ── Add VO Modal (bottom sheet) ── */}
        {showAddModal && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(5px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false) }}
          >
            <div style={{
              background: '#fff', width: '100%', maxWidth: 480,
              borderRadius: '24px 24px 0 0',
              animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: '0 -8px 40px rgba(15,23,42,0.2)',
              overflow: 'hidden',
            }}>
              {/* Handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0' }} />
              </div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem 0.75rem' }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MdGroups style={{ color: '#4f46e5', fontSize: 22 }} />
                  নতুন ভিও যোগ করুন
                </h2>
                <button onClick={() => setShowAddModal(false)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MdClose style={{ fontSize: 16 }} />
                </button>
              </div>
              {/* Form */}
              <form onSubmit={handleAddVO} style={{ padding: '0.5rem 1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            </div>
          </div>
        )}

        {/* ── Edit VO Modal ── */}
        {showEditModal && editingVO && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(5px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowEditModal(false) }}
          >
            <div style={{
              background: '#fff', width: '100%', maxWidth: 480,
              borderRadius: '24px 24px 0 0',
              animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: '0 -8px 40px rgba(15,23,42,0.2)',
              overflow: 'hidden',
            }}>
              {/* Handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0' }} />
              </div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem 0.75rem' }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MdEdit style={{ color: '#4f46e5', fontSize: 22 }} />
                  ভিও সম্পাদনা করুন
                </h2>
                <button onClick={() => setShowEditModal(false)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MdClose style={{ fontSize: 16 }} />
                </button>
              </div>
              {/* Form */}
              <form onSubmit={handleUpdateVO} style={{ padding: '0.5rem 1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="field-label">ভিও নম্বর <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    id="edit-vo-number"
                    type="number"
                    value={editingVO.vo_number}
                    onChange={e => setEditingVO(p => ({ ...p, vo_number: e.target.value }))}
                    className="field-input"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
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
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default VOListPage
