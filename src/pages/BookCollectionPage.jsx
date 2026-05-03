import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import {
  MdArrowBack, MdBook, MdGroups, MdPerson, MdAdd,
  MdCheckCircle, MdSwapHoriz, MdRefresh, MdClose,
  MdLocalLibrary, MdInventory,
} from 'react-icons/md'

const BookCollectionPage = () => {
  const navigate = useNavigate()
  const [voGroups, setVoGroups] = useState([])
  const [members, setMembers] = useState([])
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVO, setSelectedVO] = useState('all')
  const [activeTab, setActiveTab] = useState('with-me') // 'with-me' | 'returned'
  const [selectedStatus, setSelectedStatus] = useState('running') // 'running' | 'cancelled' | 'all'
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBook, setNewBook] = useState({ member_name: '', vo_number: '', membership_status: 'running', note: '' })
  const [addingBook, setAddingBook] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [booksRes, voRes, membersRes] = await Promise.all([
        supabase.from('book_collections').select('*').order('created_at', { ascending: false }),
        supabase.from('vo_groups').select('*').order('vo_number'),
        supabase.from('members').select('id, full_name, vo_number, village, member_number'),
      ])
      if (booksRes.error) throw booksRes.error
      setBooks(booksRes.data || [])
      setVoGroups(voRes.data || [])
      setMembers(membersRes.data || [])
    } catch (err) {
      toast.error('তথ্য লোড করতে ব্যর্থ হয়েছে')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const getVOName = (num) => {
    const vo = voGroups.find(v => v.vo_number === parseInt(num))
    return vo ? (vo.vo_name || `ভিও ${num}`) : `ভিও ${num}`
  }

  const handleAddBook = async () => {
    if (!newBook.member_name.trim()) return toast.error('সদস্যের নাম দিন')
    if (!newBook.vo_number) return toast.error('ভিও নম্বর দিন')
    setAddingBook(true)
    try {
      const { error } = await supabase.from('book_collections').insert([{
        member_name: newBook.member_name.trim(),
        vo_number: parseInt(newBook.vo_number),
        membership_status: newBook.membership_status,
        note: newBook.note,
        return_status: 'with-me',
      }])
      if (error) throw error
      toast.success('বই সফলভাবে যোগ করা হয়েছে!')
      setNewBook({ member_name: '', vo_number: '', membership_status: 'running', note: '' })
      setShowAddModal(false)
      fetchData()
    } catch (err) {
      toast.error('যোগ করতে ব্যর্থ হয়েছে')
      console.error(err)
    } finally {
      setAddingBook(false)
    }
  }

  const handleReturnBook = async (bookId) => {
    try {
      const { error } = await supabase
        .from('book_collections')
        .update({ return_status: 'returned', returned_at: new Date().toISOString() })
        .eq('id', bookId)
      if (error) throw error
      toast.success('বই ফেরত দেওয়া হয়েছে!')
      fetchData()
    } catch (err) {
      toast.error('আপডেট করতে ব্যর্থ হয়েছে')
      console.error(err)
    }
  }

  const handleUnreturnBook = async (bookId) => {
    try {
      const { error } = await supabase
        .from('book_collections')
        .update({ return_status: 'with-me', returned_at: null })
        .eq('id', bookId)
      if (error) throw error
      toast.success('আমার কাছে আছে তালিকায় ফিরিয়ে আনা হয়েছে!')
      fetchData()
    } catch (err) {
      toast.error('আপডেট করতে ব্যর্থ হয়েছে')
    }
  }

  const handleStatusChange = async (bookId, status) => {
    try {
      const { error } = await supabase
        .from('book_collections')
        .update({ membership_status: status })
        .eq('id', bookId)
      if (error) throw error
      toast.success('সদস্যপদ আপডেট হয়েছে')
      fetchData()
    } catch (err) {
      toast.error('আপডেট করতে ব্যর্থ হয়েছে')
    }
  }

  const handleUpdateNote = async (bookId, note) => {
    try {
      const { error } = await supabase.from('book_collections').update({ note }).eq('id', bookId)
      if (error) throw error
      setBooks(prev => prev.map(b => b.id === bookId ? { ...b, note } : b))
      toast.success('নোট সেভ হয়েছে')
    } catch (err) {
      toast.error('নোট সেভ করতে ব্যর্থ')
    }
  }

  const baseFiltered = books.filter(b => selectedStatus === 'all' || b.membership_status === selectedStatus)

  const filtered = baseFiltered.filter(b => {
    const voMatch = selectedVO === 'all' || String(b.vo_number) === selectedVO
    const tabMatch = b.return_status === activeTab
    return voMatch && tabMatch
  })

  const withMeCount = baseFiltered.filter(b => b.return_status === 'with-me').length
  const returnedCount = baseFiltered.filter(b => b.return_status === 'returned').length

  // Group by VO
  const grouped = filtered.reduce((acc, b) => {
    const key = b.vo_number
    if (!acc[key]) acc[key] = []
    acc[key].push(b)
    return acc
  }, {})

  const fieldStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
    fontFamily: "'Hind Siliguri', sans-serif", transition: 'border-color 0.2s',
    boxSizing: 'border-box', background: '#fff', color: '#0f172a',
  }

  return (
    <>
      <style>{`
        .book-card {
          background: #fff; border-radius: 14px;
          border: 1.5px solid #e0e7ff; margin-bottom: 9px;
          transition: transform 0.2s, box-shadow 0.2s;
          animation: slideUp 0.35s ease-out both;
          overflow: hidden;
        }
        .book-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79,70,229,0.1); }
        .status-badge { border-radius: 10px; padding: 3px 10px; font-size: 11px; font-weight: 700; font-family: 'Hind Siliguri', sans-serif; }
        .running { background: #f0fdf4; color: #16a34a; }
        .cancelled { background: #fef2f2; color: #dc2626; }
        .tab-pill { padding: 8px 18px; border-radius: 22px; font-size: 12.5px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; font-family: 'Hind Siliguri', sans-serif; }
        .tab-pill.active { background: linear-gradient(135deg,#4f46e5,#7c3aed); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,0.3); }
        .tab-pill:not(.active) { background: #f1f5f9; color: #64748b; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.55); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; animation: fadeIn 0.2s ease-out; }
        .modal-box { background: #fff; border-radius: 24px 24px 0 0; padding: 1.5rem; width: 100%; max-width: 500px; animation: slideUp 0.3s ease-out; }
        input:focus, select:focus { border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .vo-section { background: #fafbff; border-radius: 14px; border: 1.5px solid #e0e7ff; margin-bottom: 1rem; overflow: hidden; }
        .vo-section-header { background: linear-gradient(135deg,#e0e7ff,#c7d2fe); padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; }
      `}</style>

      <div className="page-enter">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
          borderRadius: 20, padding: '1.25rem 1.4rem', marginBottom: '1.25rem',
          boxShadow: '0 8px 28px rgba(14,165,233,0.35)', position: 'relative', overflow: 'hidden',
          animation: 'slideUp 0.4s ease-out both',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => navigate('/dashboard')}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                <MdArrowBack style={{ fontSize: 20 }} />
              </button>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 2 }}>বই সংগ্রহ</h1>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                  মোট {books.length} টি বই • {withMeCount} আমার কাছে • {returnedCount} ফেরত
                </p>
              </div>
            </div>
            <button onClick={() => setShowAddModal(true)}
              style={{ background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '8px 14px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}>
              <MdAdd style={{ fontSize: 18 }} />
              বই যোগ
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.25rem', animation: 'slideUp 0.4s ease-out 0.1s both' }}>
          <div style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', borderRadius: 14, padding: '0.9rem 1rem', boxShadow: '0 4px 16px rgba(14,165,233,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <MdLocalLibrary style={{ color: '#fff', fontSize: 20 }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: "'Hind Siliguri', sans-serif" }}>আমার কাছে আছে</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{withMeCount}</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: 14, padding: '0.9rem 1rem', boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <MdInventory style={{ color: '#fff', fontSize: 20 }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: "'Hind Siliguri', sans-serif" }}>ফেরত দিয়েছি</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{returnedCount}</p>
          </div>
        </div>

        {/* Tab + VO filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '0.75rem', animation: 'slideUp 0.4s ease-out 0.15s both' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className={`tab-pill ${activeTab === 'with-me' ? 'active' : ''}`} onClick={() => setActiveTab('with-me')}>
              📚 আমার কাছে আছে ({withMeCount})
            </button>
            <button className={`tab-pill ${activeTab === 'returned' ? 'active' : ''}`} onClick={() => setActiveTab('returned')}>
              ✅ ফেরত দিয়েছি ({returnedCount})
            </button>
          </div>

          <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: '4px', borderRadius: '20px' }}>
            <button 
              onClick={() => setSelectedStatus('running')}
              style={{ padding: '6px 14px', borderRadius: '16px', border: 'none', fontSize: 12, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer', background: selectedStatus === 'running' ? '#fff' : 'transparent', color: selectedStatus === 'running' ? '#16a34a' : '#64748b', boxShadow: selectedStatus === 'running' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
              রানিং
            </button>
            <button 
              onClick={() => setSelectedStatus('cancelled')}
              style={{ padding: '6px 14px', borderRadius: '16px', border: 'none', fontSize: 12, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer', background: selectedStatus === 'cancelled' ? '#fff' : 'transparent', color: selectedStatus === 'cancelled' ? '#dc2626' : '#64748b', boxShadow: selectedStatus === 'cancelled' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
              বাতিল
            </button>
            <button 
              onClick={() => setSelectedStatus('all')}
              style={{ padding: '6px 14px', borderRadius: '16px', border: 'none', fontSize: 12, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", cursor: 'pointer', background: selectedStatus === 'all' ? '#fff' : 'transparent', color: selectedStatus === 'all' ? '#4f46e5' : '#64748b', boxShadow: selectedStatus === 'all' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
              সব
            </button>
          </div>
        </div>

        {/* VO filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem', animation: 'slideUp 0.4s ease-out 0.2s both' }}>
          <button
            onClick={() => setSelectedVO('all')}
            style={{ padding: '5px 12px', borderRadius: 16, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.2s', fontFamily: "'Hind Siliguri', sans-serif", background: selectedVO === 'all' ? '#0ea5e9' : '#fff', color: selectedVO === 'all' ? '#fff' : '#64748b', borderColor: selectedVO === 'all' ? '#0ea5e9' : '#e2e8f0' }}>
            সব ভিও
          </button>
          {[...new Set(books.map(b => b.vo_number))].sort((a, b) => a - b).map(voNum => (
            <button key={voNum}
              onClick={() => setSelectedVO(String(voNum))}
              style={{ padding: '5px 12px', borderRadius: 16, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.2s', fontFamily: "'Hind Siliguri', sans-serif", background: selectedVO === String(voNum) ? '#0ea5e9' : '#fff', color: selectedVO === String(voNum) ? '#fff' : '#64748b', borderColor: selectedVO === String(voNum) ? '#0ea5e9' : '#e2e8f0' }}>
              {getVOName(voNum)}
            </button>
          ))}
        </div>

        {/* Book list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif" }}>
            <MdRefresh style={{ fontSize: 40, animation: 'spin 1s linear infinite', marginBottom: 10 }} />
            <p>লোড হচ্ছে...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <MdBook style={{ fontSize: 52, color: '#bae6fd', marginBottom: 12 }} />
            <p style={{ color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif", fontSize: 14 }}>
              {activeTab === 'with-me' ? 'কোনো বই এখন আমার কাছে নেই' : 'কোনো ফেরত দেওয়া বই নেই'}
            </p>
            {activeTab === 'with-me' && (
              <button onClick={() => setShowAddModal(true)}
                style={{ marginTop: 14, padding: '10px 22px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: "'Hind Siliguri', sans-serif" }}>
                + বই যোগ করুন
              </button>
            )}
          </div>
        ) : (
          Object.entries(grouped).map(([voNum, vBooks]) => (
            <div key={voNum} className="vo-section">
              <div className="vo-section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MdGroups style={{ color: '#4f46e5', fontSize: 20 }} />
                  <span style={{ fontWeight: 700, color: '#3730a3', fontFamily: "'Hind Siliguri', sans-serif", fontSize: 14 }}>
                    {getVOName(voNum)}
                  </span>
                  <span style={{ background: '#4f46e5', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>
                    {vBooks.length} টি
                  </span>
                </div>
              </div>
              <div style={{ padding: '0.6rem 0.75rem' }}>
                {vBooks.map((book, idx) => (
                  <div key={book.id} className="book-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: activeTab === 'with-me' ? 'linear-gradient(135deg,#e0f2fe,#bae6fd)' : 'linear-gradient(135deg,#dcfce7,#bbf7d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MdBook style={{ color: activeTab === 'with-me' ? '#0ea5e9' : '#16a34a', fontSize: 22 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, fontFamily: "'Hind Siliguri', sans-serif" }}>
                          {book.member_name}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                          {/* Membership status toggle */}
                          <select
                            value={book.membership_status}
                            onChange={e => handleStatusChange(book.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer', fontFamily: "'Hind Siliguri', sans-serif", outline: 'none', background: book.membership_status === 'running' ? '#f0fdf4' : '#fef2f2', color: book.membership_status === 'running' ? '#16a34a' : '#dc2626', borderColor: book.membership_status === 'running' ? '#86efac' : '#fca5a5' }}>
                            <option value="running">রানিং</option>
                            <option value="cancelled">বাতিল</option>
                          </select>
                          <input
                            type="text"
                            placeholder="কারণ/নোট..."
                            defaultValue={book.note || ''}
                            onBlur={(e) => { if(e.target.value !== (book.note || '')) handleUpdateNote(book.id, e.target.value) }}
                            style={{ flex: 1, minWidth: 60, fontSize: 11, padding: '2px 6px', borderRadius: 4, border: '1px dashed #cbd5e1', background: 'transparent', color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif", outline: 'none' }}
                          />
                          {book.returned_at && (
                            <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif" }}>
                              {new Date(book.returned_at).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Return / Unreturn button */}
                      {activeTab === 'with-me' ? (
                        <button
                          onClick={() => handleReturnBook(book.id)}
                          style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', borderRadius: 10, padding: '7px 12px', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Hind Siliguri', sans-serif", flexShrink: 0 }}>
                          <MdSwapHoriz style={{ fontSize: 16 }} />
                          ফেরত দিয়েছি
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnreturnBook(book.id)}
                          style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '7px 12px', color: '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Hind Siliguri', sans-serif", flexShrink: 0 }}>
                          <MdSwapHoriz style={{ fontSize: 16 }} />
                          ফিরিয়ে আনো
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', fontFamily: "'Hind Siliguri', sans-serif" }}>নতুন বই যোগ করুন</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <MdClose style={{ color: '#64748b', fontSize: 18 }} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', fontFamily: "'Hind Siliguri', sans-serif", display: 'block', marginBottom: 6 }}>
                ভিও নম্বর *
              </label>
              <select
                style={fieldStyle}
                value={newBook.vo_number}
                onChange={e => setNewBook(b => ({ ...b, vo_number: e.target.value, member_name: '' }))}
              >
                <option value="">ভিও সিলেক্ট করুন</option>
                {voGroups.map(v => (
                  <option key={v.id} value={v.vo_number}>VO-{v.vo_number} {v.vo_name ? `(${v.vo_name})` : ''}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', fontFamily: "'Hind Siliguri', sans-serif", display: 'block', marginBottom: 6 }}>
                সদস্যের নাম ও ঠিকানা *
              </label>
              <select
                style={fieldStyle}
                value={newBook.member_name}
                onChange={e => setNewBook(b => ({ ...b, member_name: e.target.value }))}
                disabled={!newBook.vo_number}
              >
                <option value="">{newBook.vo_number ? 'সদস্য সিলেক্ট করুন' : 'আগে ভিও সিলেক্ট করুন'}</option>
                {members
                  .filter(m => String(m.vo_number) === String(newBook.vo_number))
                  .map(m => (
                    <option key={m.id} value={m.full_name}>
                      {m.full_name} {m.village ? `- ${m.village}` : ''} {m.member_number ? `(#${m.member_number})` : ''}
                    </option>
                  ))
                }
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', fontFamily: "'Hind Siliguri', sans-serif", display: 'block', marginBottom: 6 }}>
                নোট / কারণ (ঐচ্ছিক)
              </label>
              <input
                type="text"
                style={fieldStyle}
                placeholder="কেন সংগ্রহ করা হলো?"
                value={newBook.note}
                onChange={e => setNewBook(b => ({ ...b, note: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', fontFamily: "'Hind Siliguri', sans-serif", display: 'block', marginBottom: 6 }}>
                সদস্যপদ অবস্থা
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ v: 'running', l: '✅ রানিং' }, { v: 'cancelled', l: '❌ বাতিল' }].map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => setNewBook(b => ({ ...b, membership_status: v }))}
                    style={{ flex: 1, padding: '9px', borderRadius: 10, border: '1.5px solid', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: "'Hind Siliguri', sans-serif", transition: 'all 0.2s', background: newBook.membership_status === v ? (v === 'running' ? '#f0fdf4' : '#fef2f2') : '#fff', color: newBook.membership_status === v ? (v === 'running' ? '#16a34a' : '#dc2626') : '#64748b', borderColor: newBook.membership_status === v ? (v === 'running' ? '#86efac' : '#fca5a5') : '#e2e8f0' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddBook}
              disabled={addingBook}
              style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', fontWeight: 800, cursor: addingBook ? 'not-allowed' : 'pointer', fontSize: 15, fontFamily: "'Hind Siliguri', sans-serif", opacity: addingBook ? 0.7 : 1, boxShadow: '0 4px 16px rgba(14,165,233,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <MdCheckCircle style={{ fontSize: 20 }} />
              {addingBook ? 'সংরক্ষণ হচ্ছে...' : 'বই যোগ করুন'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default BookCollectionPage
