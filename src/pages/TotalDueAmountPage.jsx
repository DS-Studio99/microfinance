import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { MdArrowBack, MdWarning, MdRefresh, MdGroups, MdPerson, MdAttachMoney } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const TotalDueAmountPage = () => {
  const navigate = useNavigate()
  const [dueMembers, setDueMembers] = useState([])
  const [voGroups, setVoGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVO, setSelectedVO] = useState('all')
  const [totalDueAmount, setTotalDueAmount] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [membersRes, voRes] = await Promise.all([
        supabase
          .from('members')
          .select('id, full_name, vo_number, loan_amount, due_amount, phone_number, village')
          .eq('is_due', true)
          .order('vo_number', { ascending: true }),
        supabase
          .from('vo_groups')
          .select('*')
          .order('vo_number', { ascending: true })
      ])

      if (membersRes.error) throw membersRes.error
      if (voRes.error) throw voRes.error

      const members = membersRes.data || []
      const total = members.reduce((sum, m) => sum + (m.due_amount || m.loan_amount || 0), 0)
      setDueMembers(members)
      setTotalDueAmount(total)
      setVoGroups(voRes.data || [])
    } catch (err) {
      toast.error('তথ্য লোড করতে ব্যর্থ হয়েছে')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = selectedVO === 'all'
    ? dueMembers
    : dueMembers.filter(m => String(m.vo_number) === selectedVO)

  const filteredTotal = filtered.reduce((sum, m) => sum + (m.due_amount || m.loan_amount || 0), 0)

  // Group by VO
  const grouped = filtered.reduce((acc, m) => {
    const key = m.vo_number
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  const getVOName = (num) => {
    const vo = voGroups.find(v => v.vo_number === num)
    return vo ? vo.vo_name : `ভিও ${num}`
  }

  return (
    <>
      <style>{`
        .due-header {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border-radius: 20px;
          padding: 1.25rem 1.4rem;
          margin-bottom: 1.25rem;
          box-shadow: 0 8px 28px rgba(220,38,38,0.3);
          position: relative;
          overflow: hidden;
          animation: slideUp 0.4s ease-out both;
        }
        .due-header::before {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 150px; height: 150px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          pointer-events: none;
        }
        .due-card {
          background: #fff;
          border-radius: 14px;
          border: 1.5px solid #fee2e2;
          padding: 0.85rem 1rem;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
          animation: slideUp 0.35s ease-out both;
        }
        .due-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(220,38,38,0.1);
        }
        .vo-section {
          background: #fff7f7;
          border-radius: 14px;
          border: 1.5px solid #fecaca;
          margin-bottom: 1rem;
          overflow: hidden;
        }
        .vo-section-header {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .filter-chip {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: all 0.2s;
          font-family: 'Hind Siliguri', sans-serif;
        }
        .filter-chip.active {
          background: #dc2626;
          color: #fff;
          border-color: #dc2626;
        }
        .filter-chip:not(.active) {
          background: #fff;
          color: #64748b;
          border-color: #e2e8f0;
        }
        .filter-chip:not(.active):hover {
          border-color: #dc2626;
          color: #dc2626;
        }
      `}</style>

      <div className="page-enter">
        {/* Header */}
        <div className="due-header">
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
            >
              <MdArrowBack style={{ fontSize: 20 }} />
            </button>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif", marginBottom: 2 }}>
                টোটাল বাকি পাওনা
              </h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                মোট {dueMembers.length} জন সদস্যের বকেয়া রয়েছে
              </p>
            </div>
          </div>
        </div>

        {/* Total Amount Card */}
        <div style={{
          background: 'linear-gradient(135deg,#7f1d1d,#991b1b)',
          borderRadius: 18, padding: '1.1rem 1.3rem', marginBottom: '1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 6px 24px rgba(127,29,29,0.4)', animation: 'slideUp 0.4s ease-out 0.1s both'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdAttachMoney style={{ color: '#fff', fontSize: 24 }} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                {selectedVO === 'all' ? 'সর্বমোট বকেয়া পরিমাণ' : `ভিও ${selectedVO} - বকেয়া পরিমাণ`}
              </p>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                ৳ {loading ? '...' : filteredTotal.toLocaleString('bn-BD')}
              </p>
            </div>
          </div>
          <button onClick={fetchData} disabled={loading}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: "'Hind Siliguri', sans-serif" }}>
            <MdRefresh style={{ fontSize: 17, ...(loading ? { animation: 'spin 1s linear infinite' } : {}) }} />
            রিফ্রেশ
          </button>
        </div>

        {/* VO Filter chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem', animation: 'slideUp 0.4s ease-out 0.15s both' }}>
          <button className={`filter-chip ${selectedVO === 'all' ? 'active' : ''}`} onClick={() => setSelectedVO('all')}>
            সব ভিও ({dueMembers.length})
          </button>
          {Object.keys(grouped).map(voNum => (
            <button
              key={voNum}
              className={`filter-chip ${selectedVO === voNum ? 'active' : ''}`}
              onClick={() => setSelectedVO(voNum)}
            >
              {getVOName(parseInt(voNum))} ({grouped[voNum].length})
            </button>
          ))}
        </div>

        {/* Member List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontFamily: "'Hind Siliguri', sans-serif" }}>
            <MdRefresh style={{ fontSize: 40, animation: 'spin 1s linear infinite', marginBottom: 12 }} />
            <p>তথ্য লোড হচ্ছে...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <MdWarning style={{ fontSize: 50, color: '#fca5a5', marginBottom: 12 }} />
            <p style={{ fontFamily: "'Hind Siliguri', sans-serif", fontSize: 15 }}>কোনো বকেয়া সদস্য পাওয়া যায়নি</p>
          </div>
        ) : (
          Object.entries(grouped).map(([voNum, members]) => (
            <div key={voNum} className="vo-section">
              <div className="vo-section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MdGroups style={{ color: '#dc2626', fontSize: 20 }} />
                  <span style={{ fontWeight: 700, color: '#7f1d1d', fontFamily: "'Hind Siliguri', sans-serif", fontSize: 14 }}>
                    {getVOName(parseInt(voNum))}
                  </span>
                  <span style={{ background: '#dc2626', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>
                    {members.length} জন
                  </span>
                </div>
                <span style={{ fontWeight: 800, color: '#dc2626', fontSize: 15 }}>
                  ৳ {members.reduce((s, m) => s + (m.due_amount || m.loan_amount || 0), 0).toLocaleString('bn-BD')}
                </span>
              </div>
              <div style={{ padding: '0.6rem 0.75rem' }}>
                {members.map((m, idx) => (
                  <div key={m.id} className="due-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#fee2e2,#fecaca)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MdPerson style={{ color: '#dc2626', fontSize: 22 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, fontFamily: "'Hind Siliguri', sans-serif" }}>{m.full_name}</p>
                      <p style={{ fontSize: 12, color: '#64748b', fontFamily: "'Hind Siliguri', sans-serif" }}>
                        {m.village && `${m.village} • `}{m.phone_number || 'ফোন নম্বর নেই'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 800, color: '#dc2626', fontSize: 16, lineHeight: 1 }}>
                        ৳ {(m.due_amount || m.loan_amount || 0).toLocaleString('bn-BD')}
                      </p>
                      <span style={{ background: '#fee2e2', color: '#dc2626', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>বকেয়া</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default TotalDueAmountPage
