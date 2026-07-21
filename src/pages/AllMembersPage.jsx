import React, { useState, useMemo } from 'react'
import { useMembers } from '../hooks/useMembers'
import { useVOGroups } from '../hooks/useVOGroups'
// Note: useState is used directly for showFilters state
import MemberCard from '../components/MemberCard'
import MemberFormModal from '../components/MemberFormModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { MdPersonAdd, MdSearch, MdPeople, MdRefresh, MdClose, MdFilterList, MdTune } from 'react-icons/md'
import { useState as useToggle } from 'react'

const AllMembersPage = () => {
  const { members, loading, addMember, updateMember, deleteMember, quickUpdateField, markAsPaid, fetchMembers } = useMembers()
  const { voGroups, disabledVoNumbers } = useVOGroups()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterVO, setFilterVO] = useState('')
  const [filterDue, setFilterDue] = useState('')
  const [filterCalled, setFilterCalled] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [deleteMemberData, setDeleteMemberData] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (disabledVoNumbers.includes(m.vo_number)) return false
      const q = searchQuery.toLowerCase()
      const matchSearch = !searchQuery ||
        m.full_name?.toLowerCase().includes(q) ||
        m.phone_number?.includes(searchQuery)
      const matchVO = !filterVO || m.vo_number === parseInt(filterVO)
      const matchDue = !filterDue || (filterDue === 'due' ? m.is_due : !m.is_due)
      const matchCalled = !filterCalled || (filterCalled === 'called' ? m.is_called : !m.is_called)
      return matchSearch && matchVO && matchDue && matchCalled
    })
  }, [members, searchQuery, filterVO, filterDue, filterCalled, disabledVoNumbers])

  const handleEditSubmit = async (data) => { await updateMember(editMember.id, data); setEditMember(null) }
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true)
    await deleteMember(deleteMemberData.id)
    setDeleteLoading(false)
    setDeleteMemberData(null)
  }

  const clearFilters = () => { setSearchQuery(''); setFilterVO(''); setFilterDue(''); setFilterCalled('') }
  const hasFilters = searchQuery || filterVO || filterDue || filterCalled

  const activeFilterCount = [filterVO, filterDue, filterCalled].filter(Boolean).length

  return (
    <>
      <style>{`
        .members-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 600px) { .members-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1100px) { .members-grid { grid-template-columns: 1fr 1fr 1fr; } }
      `}</style>

      <div className="page-enter" style={{ maxWidth: 1200 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1.2 }}>সকল সদস্য</h1>
            <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 3 }}>
              মোট <strong style={{ color: '#4f46e5' }}>{filteredMembers.length}</strong> জন সদস্য
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              id="refresh-members-btn"
              onClick={fetchMembers}
              className="btn-ghost"
              style={{ padding: '0.6rem 0.9rem' }}
            >
              <MdRefresh className={loading ? 'spinner' : ''} style={{ fontSize: 18 }} />
            </button>
            <button
              id="add-member-btn"
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <MdPersonAdd style={{ fontSize: 18 }} />
              নতুন সদস্য
            </button>
          </div>
        </div>

        {/* ── Search + Filter bar ── */}
        <div className="surface" style={{ padding: '0.85rem', marginBottom: '1.1rem' }}>
          {/* Search row */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <MdSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 18 }} />
              <input
                id="search-members"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="নাম বা মোবাইল নম্বর খুঁজুন..."
                className="field-input"
                style={{ paddingLeft: 36, fontFamily: "'Hind Siliguri', sans-serif" }}
              />
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '0.65rem 0.9rem', borderRadius: 12,
                border: `1.5px solid ${showFilters || activeFilterCount > 0 ? '#6366f1' : '#e2e8f0'}`,
                background: showFilters || activeFilterCount > 0 ? '#eef2ff' : '#f8fafc',
                color: showFilters || activeFilterCount > 0 ? '#4338ca' : '#64748b',
                cursor: 'pointer', fontWeight: 600, fontSize: 13,
                fontFamily: "'Hind Siliguri', sans-serif",
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              <MdTune style={{ fontSize: 16 }} />
              ফিল্টার
              {activeFilterCount > 0 && (
                <span style={{ background: '#4f46e5', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            {hasFilters && (
              <button
                id="clear-filters-btn"
                onClick={clearFilters}
                style={{
                  padding: '0.65rem 0.9rem', borderRadius: 12,
                  border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 12, fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif",
                  whiteSpace: 'nowrap',
                }}
              >
                <MdClose style={{ fontSize: 14 }} />ক্লিয়ার
              </button>
            )}
          </div>

          {/* Filter dropdowns */}
          {showFilters && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
              {[
                {
                  id: 'filter-vo', val: filterVO, onChange: v => setFilterVO(v),
                  options: [{ v: '', l: 'সকল ভিও' }, ...voGroups.map(vo => ({ v: String(vo.vo_number), l: `VO-${String(vo.vo_number).padStart(2, '0')}` }))],
                },
                {
                  id: 'filter-due', val: filterDue, onChange: v => setFilterDue(v),
                  options: [{ v: '', l: 'বকেয়া অবস্থা' }, { v: 'due', l: 'বকেয়া আছে' }, { v: 'clear', l: 'বকেয়া নেই' }],
                },
                {
                  id: 'filter-called', val: filterCalled, onChange: v => setFilterCalled(v),
                  options: [{ v: '', l: 'কল অবস্থা' }, { v: 'called', l: 'কল হয়েছে' }, { v: 'not-called', l: 'কল হয়নি' }],
                },
              ].map(({ id, val, onChange, options }) => (
                <select
                  key={id} id={id}
                  value={val}
                  onChange={e => onChange(e.target.value)}
                  className="field-input"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", fontSize: 13 }}
                >
                  {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              ))}
            </div>
          )}
        </div>

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="members-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 200 }} />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && filteredMembers.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <MdPeople style={{ fontSize: 36, color: '#94a3b8' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#334155', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 8 }}>
              কোনো সদস্য পাওয়া যায়নি
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 20 }}>
              {hasFilters ? 'ফিল্টার পরিবর্তন করুন বা নতুন সদস্য যোগ করুন' : 'এখনো কোনো সদস্য যোগ করা হয়নি'}
            </p>
            {!hasFilters && (
              <button onClick={() => setShowAddModal(true)} className="btn-primary">
                <MdPersonAdd style={{ fontSize: 18 }} />
                প্রথম সদস্য যোগ করুন
              </button>
            )}
          </div>
        )}

        {/* ── Member cards ── */}
        {!loading && filteredMembers.length > 0 && (
          <div className="members-grid">
            {filteredMembers.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                onEdit={setEditMember}
                onDelete={setDeleteMemberData}
                onToggleDue={(id, val) => quickUpdateField(id, 'is_due', val)}
                onToggleCalled={(id, val) => quickUpdateField(id, 'is_called', val)}
                onToggleConfirmed={(id, val) => quickUpdateField(id, 'is_confirmed', val)}
                onToggleLatePayer={(id, val) => quickUpdateField(id, 'is_late_payer', val)}
                onMarkPaid={markAsPaid}
              />
            ))}
          </div>
        )}

      </div>

      {/* Modals */}
      <MemberFormModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={addMember} voGroups={voGroups} />
      <MemberFormModal isOpen={!!editMember} onClose={() => setEditMember(null)} onSubmit={handleEditSubmit} editData={editMember} voGroups={voGroups} />
      <DeleteConfirmModal isOpen={!!deleteMemberData} onClose={() => setDeleteMemberData(null)} onConfirm={handleDeleteConfirm} memberName={deleteMemberData?.full_name} loading={deleteLoading} />
    </>
  )
}

export default AllMembersPage
