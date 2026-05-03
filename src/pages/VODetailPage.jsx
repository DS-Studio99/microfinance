import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMembers } from '../hooks/useMembers'
import { useVOGroups, useVOStats } from '../hooks/useVOGroups'
import MemberCard from '../components/MemberCard'
import MemberFormModal from '../components/MemberFormModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import {
  MdPeople, MdPhone, MdToday, MdWarning, MdPersonAdd,
  MdSearch, MdArrowBack, MdRefresh, MdCalendarToday, MdTune, MdCheckCircle
} from 'react-icons/md'

const StatPill = ({ title, value, icon: Icon, color, bg, loading }) => (
  <div style={{
    background: bg,
    borderRadius: 16, padding: '0.9rem 1rem',
    display: 'flex', alignItems: 'center', gap: 10,
    border: `1px solid ${color}30`,
  }}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon style={{ fontSize: 20, color }} />
    </div>
    <div>
      {loading
        ? <div className="skeleton" style={{ width: 40, height: 22, marginBottom: 3 }} />
        : <p style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</p>
      }
      <p style={{ fontSize: 11, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", marginTop: 2 }}>{title}</p>
    </div>
  </div>
)

const VODetailPage = () => {
  const { voNumber } = useParams()
  const navigate = useNavigate()
  const voNum = parseInt(voNumber)
  const { members, loading: membersLoading, addMember, updateMember, deleteMember, quickUpdateField, markAsPaid, setNextMonthDateForPaidMembers, fetchMembers } = useMembers(voNum)
  const { voGroups } = useVOGroups()
  const { stats, loading: statsLoading, fetchStats } = useVOStats(voNum)

  const [bulkNextDate, setBulkNextDate] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [filterDue, setFilterDue] = useState('')
  const [filterCalled, setFilterCalled] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [deleteMemberData, setDeleteMemberData] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const todayMembers = useMemo(() => members.filter(m => m.loan_payment_date === today), [members, today])
  const filteredMembers = useMemo(() => members.filter(m => {
    const q = searchQuery.toLowerCase()
    return (
      (!searchQuery || m.full_name?.toLowerCase().includes(q) || m.phone_number?.includes(searchQuery)) &&
      (!filterDue || (filterDue === 'due' ? m.is_due : !m.is_due)) &&
      (!filterCalled || (filterCalled === 'called' ? m.is_called : !m.is_called))
    )
  }), [members, searchQuery, filterDue, filterCalled])

  const voInfo = voGroups.find(v => v.vo_number === voNum)

  const handleEditSubmit = async (data) => { await updateMember(editMember.id, data); setEditMember(null); fetchStats() }
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true)
    await deleteMember(deleteMemberData.id)
    setDeleteLoading(false)
    setDeleteMemberData(null)
    fetchStats()
  }

  return (
    <>
      <style>{`
        .vo-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (min-width: 768px) { .vo-detail-grid { grid-template-columns: repeat(4, 1fr); } }
        .members-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 580px) { .members-grid-2 { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1080px) { .members-grid-2 { grid-template-columns: 1fr 1fr 1fr; } }
      `}</style>

      <div className="page-enter">
        {/* ── Back + Title ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.1rem', flexWrap: 'wrap' }}>
          <button
            id="back-to-vo-list"
            onClick={() => navigate('/vo-list')}
            style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <MdArrowBack style={{ fontSize: 20, color: '#475569' }} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1.3 }}>
              ভিও নং- {String(voNum).padStart(2, '0')}
              {voInfo?.vo_name && <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b', marginLeft: 8 }}>({voInfo.vo_name})</span>}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <p style={{ fontSize: 12, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>ভিও বিস্তারিত তথ্য</p>
              {voInfo?.collection_day && (
                <div style={{
                  background: 'linear-gradient(135deg, #fef9c3, #fef08a)',
                  borderRadius: 10, padding: '2px 8px',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  border: '1px solid #fde047',
                  animation: 'pulseRing 2s infinite',
                  boxShadow: '0 0 10px rgba(234,179,8,0.2)'
                }}>
                  <MdCalendarToday style={{ color: '#ca8a04', fontSize: 11 }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#a16207', letterSpacing: 0.3 }}>
                    {voInfo.collection_day}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            id="refresh-vo-btn"
            onClick={() => { fetchMembers(); fetchStats() }}
            style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <MdRefresh className={membersLoading ? 'spinner' : ''} style={{ fontSize: 18, color: '#475569' }} />
          </button>
        </div>

        {/* ── Stats Pills ── */}
        <div className="vo-detail-grid" style={{ marginBottom: '1.1rem' }}>
          {[
            { title: 'মোট সদস্য', value: stats.totalMembers, icon: MdPeople, color: '#4f46e5', bg: '#eef2ff' },
            { title: 'কল করা হয়েছে', value: stats.calledMembers, icon: MdPhone, color: '#059669', bg: '#ecfdf5' },
            { title: 'আজ পরিশোধ', value: stats.todayPayments, icon: MdToday, color: '#d97706', bg: '#fffbeb' },
            { title: 'বকেয়া', value: stats.dueMembers, icon: MdWarning, color: '#dc2626', bg: '#fef2f2' },
          ].map(s => <StatPill key={s.title} {...s} loading={statsLoading} />)}
        </div>

        {/* ── Bulk next month setter ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: '1rem', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MdCalendarToday style={{ color: '#059669', fontSize: 16 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>আগামী মাসের কিস্তি:</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="date"
              value={bulkNextDate}
              onChange={e => setBulkNextDate(e.target.value)}
              className="field-input"
              style={{ padding: '0.25rem 0.5rem', fontSize: 13, minHeight: 32, maxWidth: 140 }}
            />
            <button
              onClick={async () => {
                if (!bulkNextDate) return alert('দয়া করে তারিখ নির্বাচন করুন')
                const res = await setNextMonthDateForPaidMembers(bulkNextDate)
                if (!res?.error && voInfo?.id) {
                  const { supabase: sb } = await import('../lib/supabase')
                  await sb.from('vo_groups').update({ next_kisti_date: bulkNextDate }).eq('id', voInfo.id)
                }
              }}
              style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '0 1rem', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              সেভ
            </button>
          </div>
        </div>

        {/* ── Today's payments ── */}
        {todayMembers.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
            border: '1.5px solid #fde68a',
            borderRadius: 18, padding: '1rem',
            marginBottom: '1.1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MdCalendarToday style={{ color: '#fff', fontSize: 18 }} />
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#92400e', fontFamily: "'Hind Siliguri', sans-serif" }}>
                আজ ঋণ পরিশোধের তালিকা
              </h2>
              <span style={{ background: '#f59e0b', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
                {todayMembers.length} জন
              </span>
            </div>
            <div className="members-grid-2">
              {todayMembers.map(m => (
                <MemberCard key={m.id} member={m}
                  onEdit={setEditMember} onDelete={setDeleteMemberData}
                  onToggleDue={(id, v) => { quickUpdateField(id, 'is_due', v); fetchStats() }}
                  onToggleCalled={(id, v) => { quickUpdateField(id, 'is_called', v); fetchStats() }}
                  onToggleConfirmed={(id, v) => { quickUpdateField(id, 'is_confirmed', v); fetchStats() }}
                  onToggleLatePayer={(id, v) => { quickUpdateField(id, 'is_late_payer', v); fetchStats() }}
                  onMarkPaid={(member) => { markAsPaid(member); fetchStats() }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── All Members Section ── */}
        <div className="surface" style={{ overflow: 'hidden' }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1rem 0.75rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdPeople style={{ color: '#4f46e5', fontSize: 20 }} />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>
                এই ভিও-র সকল সদস্য
              </h2>
            </div>
            <button
              id="add-member-vo-btn"
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              style={{ fontSize: 13, padding: '0.55rem 0.9rem' }}
            >
              <MdPersonAdd style={{ fontSize: 17 }} />
              নতুন সদস্য
            </button>
          </div>

          {/* Search + filters */}
          <div style={{ padding: '0.75rem 1rem', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <MdSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 17 }} />
                <input
                  id="vo-search-members"
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="নাম বা মোবাইল..."
                  className="field-input"
                  style={{ paddingLeft: 34, fontSize: 13, fontFamily: "'Hind Siliguri', sans-serif" }}
                />
              </div>
              <button
                onClick={() => setShowFilters(f => !f)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '0 0.8rem', borderRadius: 12,
                  border: `1.5px solid ${showFilters ? '#6366f1' : '#e2e8f0'}`,
                  background: showFilters ? '#eef2ff' : '#f8fafc',
                  color: showFilters ? '#4338ca' : '#64748b',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  fontFamily: "'Hind Siliguri', sans-serif",
                }}
              >
                <MdTune style={{ fontSize: 16 }} />ফিল্টার
              </button>
            </div>
            {showFilters && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                {[
                  { id: 'vo-filter-due', val: filterDue, onChange: v => setFilterDue(v), opts: [['', 'সকল বকেয়া'], ['due', 'বকেয়া আছে'], ['clear', 'বকেয়া নেই']] },
                  { id: 'vo-filter-called', val: filterCalled, onChange: v => setFilterCalled(v), opts: [['', 'কল অবস্থা'], ['called', 'কল হয়েছে'], ['not-called', 'কল হয়নি']] },
                ].map(({ id, val, onChange, opts }) => (
                  <select key={id} id={id} value={val} onChange={e => onChange(e.target.value)} className="field-input" style={{ fontSize: 13, fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                ))}
              </div>
            )}
          </div>

          {/* Member grid */}
          <div style={{ padding: '1rem' }}>
            {membersLoading && (
              <div className="members-grid-2">
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 188 }} />)}
              </div>
            )}

            {!membersLoading && filteredMembers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <MdPeople style={{ fontSize: 44, color: '#cbd5e1', marginBottom: 12 }} />
                <p style={{ fontSize: 15, fontWeight: 700, color: '#475569', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 8 }}>কোনো সদস্য পাওয়া যায়নি</p>
                <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ marginTop: 8 }}>
                  <MdPersonAdd style={{ fontSize: 17 }} />নতুন সদস্য যোগ করুন
                </button>
              </div>
            )}

            {!membersLoading && filteredMembers.length > 0 && (
              <div className="members-grid-2">
                {filteredMembers.map(m => (
                  <MemberCard key={m.id} member={m}
                    onEdit={setEditMember} onDelete={setDeleteMemberData}
                    onToggleDue={(id, v) => { quickUpdateField(id, 'is_due', v); fetchStats() }}
                    onToggleCalled={(id, v) => { quickUpdateField(id, 'is_called', v); fetchStats() }}
                    onToggleConfirmed={(id, v) => { quickUpdateField(id, 'is_confirmed', v); fetchStats() }}
                    onToggleLatePayer={(id, v) => { quickUpdateField(id, 'is_late_payer', v); fetchStats() }}
                    onMarkPaid={(member) => { markAsPaid(member); fetchStats() }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      <MemberFormModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={async d => { await addMember(d); fetchStats() }} voGroups={voGroups} defaultVONumber={voNum} />
      <MemberFormModal isOpen={!!editMember} onClose={() => setEditMember(null)} onSubmit={handleEditSubmit} editData={editMember} voGroups={voGroups} />
      <DeleteConfirmModal isOpen={!!deleteMemberData} onClose={() => setDeleteMemberData(null)} onConfirm={handleDeleteConfirm} memberName={deleteMemberData?.full_name} loading={deleteLoading} />
    </>
  )
}

export default VODetailPage
