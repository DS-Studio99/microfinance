import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useVOGroups = () => {
  const [voGroups, setVoGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchVOGroups = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('vo_groups')
        .select('*')
        .order('vo_number', { ascending: true })

      if (fetchError) throw fetchError
      setVoGroups(data || [])
    } catch (err) {
      setError(err.message)
      toast.error('ভিও গ্রুপের তথ্য লোড করতে ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVOGroups()
  }, [fetchVOGroups])

  const addVOGroup = async (voData) => {
    try {
      const { data, error } = await supabase
        .from('vo_groups')
        .insert([voData])
        .select()
        .single()

      if (error) throw error
      toast.success('নতুন ভিও সফলভাবে যোগ করা হয়েছে')
      fetchVOGroups()
      return { data, error: null }
    } catch (err) {
      if (err.code === '23505') {
        toast.error('এই ভিও নম্বর ইতিমধ্যে বিদ্যমান')
      } else {
        toast.error('ভিও যোগ করতে ব্যর্থ হয়েছে')
      }
      return { data: null, error: err }
    }
  }

  const updateVOGroup = async (id, voData) => {
    try {
      const { data, error } = await supabase
        .from('vo_groups')
        .update(voData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      toast.success('ভিও সফলভাবে আপডেট করা হয়েছে')
      fetchVOGroups()
      return { data, error: null }
    } catch (err) {
      if (err.code === '23505') {
        toast.error('এই ভিও নম্বর ইতিমধ্যে বিদ্যমান')
      } else {
        toast.error('ভিও আপডেট করতে ব্যর্থ হয়েছে')
      }
      return { data: null, error: err }
    }
  }

  const deleteVOGroup = async (id) => {
    try {
      const { error } = await supabase
        .from('vo_groups')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('ভিও সফলভাবে মুছে ফেলা হয়েছে')
      fetchVOGroups()
      return { error: null }
    } catch (err) {
      toast.error('ভিও মুছে ফেলতে ব্যর্থ হয়েছে')
      return { error: err }
    }
  }

  const toggleVODisabled = async (id, isDisabled) => {
    try {
      const { error } = await supabase
        .from('vo_groups')
        .update({ is_disabled: isDisabled })
        .eq('id', id)

      if (error) throw error
      toast.success(isDisabled ? 'ভিও ডিসেবল করা হয়েছে' : 'ভিও এনাবল করা হয়েছে')
      fetchVOGroups()
      return { error: null }
    } catch (err) {
      toast.error('ভিও আপডেট করতে ব্যর্থ হয়েছে')
      return { error: err }
    }
  }

  // Active VOs (not disabled) - use this for filtering data everywhere
  const activeVoGroups = useMemo(() => voGroups.filter(vo => !vo.is_disabled), [voGroups])
  const disabledVoNumbers = useMemo(() => voGroups.filter(vo => vo.is_disabled).map(vo => vo.vo_number), [voGroups])

  return {
    voGroups,
    activeVoGroups,
    disabledVoNumbers,
    loading,
    error,
    fetchVOGroups,
    addVOGroup,
    updateVOGroup,
    deleteVOGroup,
    toggleVODisabled,
  }
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalVOs: 0,
    todayPayments: 0,
    tomorrowPayments: 0,
    nextWeekPayments: 0,
    todayConfirmed: 0,
    tomorrowConfirmed: 0,
    nextWeekConfirmed: 0,
    dueMembers: 0,
    pendingCollections: 0,
    totalDueAmount: 0,
    totalLoanApplications: 0,
    totalBooks: 0,
    totalNotes: 0,
    unwrittenKhata: 0,
    latePayers: 0,
    firstKistiCount: 0,
    secondKistiCount: 0,
    total2026KistiCount: 0,
    firstKistiList: [],
    secondKistiList: [],
    kisti2026List: [],
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const todayObj = new Date()
      const today = todayObj.toISOString().split('T')[0]
      
      const tomorrowObj = new Date(todayObj)
      tomorrowObj.setDate(tomorrowObj.getDate() + 1)
      const tomorrow = tomorrowObj.toISOString().split('T')[0]

      const nextWeekObj = new Date(todayObj)
      nextWeekObj.setDate(nextWeekObj.getDate() + 7)
      const nextWeek = nextWeekObj.toISOString().split('T')[0]

      // First fetch disabled VO numbers
      let disabledVoNums = []
      try {
        const { data: disabledVOs } = await supabase
          .from('vo_groups')
          .select('vo_number')
          .eq('is_disabled', true)
        disabledVoNums = (disabledVOs || []).map(v => v.vo_number)
      } catch (e) { console.warn('Disabled VOs fetch failed:', e) }

      const disabledVoSet = new Set((disabledVoNums || []).map(Number))

      // Build basic counts
      let totalMembers = 0
      let totalVOs = 0
      let dueMembers = 0
      let latePayers = 0

      try {
        const [mRes, vRes] = await Promise.all([
          supabase.from('members').select('vo_number, is_due, is_late_payer'),
          supabase.from('vo_groups').select('id', { count: 'exact', head: true }).neq('is_disabled', true),
        ])
        const activeMembers = (mRes.data || []).filter(m => !disabledVoSet.has(Number(m.vo_number)))
        totalMembers = activeMembers.length
        dueMembers = activeMembers.filter(m => m.is_due).length
        latePayers = activeMembers.filter(m => m.is_late_payer).length
        totalVOs = vRes.count || 0
      } catch (e) { console.warn('Basic member/VO fetch failed:', e) }

      // Payments for today, tomorrow, next week
      let todayCount = 0, tomorrowCount = 0, nextWeekCount = 0
      let todayConfirmedCount = 0, tomorrowConfirmedCount = 0, nextWeekConfirmedCount = 0
      try {
        const { data: kistiData } = await supabase
          .from('members')
          .select('vo_number, loan_payment_date, expected_payment_date, is_confirmed')
          .is('loan_cleared_date', null)

        const activeKisti = (kistiData || []).filter(m => !disabledVoSet.has(Number(m.vo_number)))
        const todayList = activeKisti.filter(m =>
          (m.loan_payment_date && m.loan_payment_date === today) ||
          (m.expected_payment_date && m.expected_payment_date === today)
        )
        const tomorrowList = activeKisti.filter(m =>
          (m.loan_payment_date && m.loan_payment_date === tomorrow) ||
          (m.expected_payment_date && m.expected_payment_date === tomorrow)
        )
        const nextWeekList = activeKisti.filter(m =>
          (m.loan_payment_date && m.loan_payment_date === nextWeek) ||
          (m.expected_payment_date && m.expected_payment_date === nextWeek)
        )

        todayCount = todayList.length
        tomorrowCount = tomorrowList.length
        nextWeekCount = nextWeekList.length
        todayConfirmedCount = todayList.filter(m => m.is_confirmed).length
        tomorrowConfirmedCount = tomorrowList.filter(m => m.is_confirmed).length
        nextWeekConfirmedCount = nextWeekList.filter(m => m.is_confirmed).length
      } catch (e) { console.warn('Kisti payments fetch failed:', e) }

      // Also fetch pending collections (gracefully handle if table missing)
      let pendingCount = 0
      try {
        const { count } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
        pendingCount = count || 0
      } catch (e) {
        console.warn('Collections table not yet available or accessible')
      }

      // Fetch total due amount
      let totalDueAmount = 0
      try {
        const { data: dueData } = await supabase
          .from('members')
          .select('vo_number, extra_amount')
          .gt('extra_amount', 0)
        totalDueAmount = (dueData || [])
          .filter(m => !disabledVoSet.has(Number(m.vo_number)))
          .reduce((sum, m) => sum + (m.extra_amount || 0), 0)
      } catch (e) { console.warn('due amount fetch failed') }

      // Fetch running books with-me
      let runningBooks = 0
      try {
        const { count } = await supabase
          .from('book_collections')
          .select('*', { count: 'exact', head: true })
          .eq('return_status', 'with-me')
          .eq('membership_status', 'running')
        runningBooks = count || 0
      } catch (e) { console.warn('book_collections table not yet available') }

      // Fetch pending loan applications count and calculate loan/savings stats
      let totalLoanApplications = 0
      let todayLoanCount = 0, todayLoanAmount = 0
      let tomorrowLoanCount = 0, tomorrowLoanAmount = 0
      let todaySavingsCount = 0, todaySavingsAmount = 0
      let tomorrowSavingsCount = 0, tomorrowSavingsAmount = 0

      try {
        // Fetch all pending applications to count and check dates
        const { data: loanApps, count } = await supabase
          .from('loan_applications')
          .select('*', { count: 'exact' })
          .eq('status', 'pending')
        
        totalLoanApplications = count || 0

        if (loanApps) {
          loanApps.forEach(app => {
            if (app.disbursement_date === today) {
              if (app.application_type === 'savings') {
                todaySavingsCount++
                todaySavingsAmount += app.loan_amount || 0
              } else {
                todayLoanCount++
                todayLoanAmount += app.loan_amount || 0
              }
            } else if (app.disbursement_date === tomorrow) {
              if (app.application_type === 'savings') {
                tomorrowSavingsCount++
                tomorrowSavingsAmount += app.loan_amount || 0
              } else {
                tomorrowLoanCount++
                tomorrowLoanAmount += app.loan_amount || 0
              }
            }
          })
        }
      } catch (e) { console.warn('loan_applications table not yet available or failed to fetch') }

      // Fetch total notes
      let totalNotes = 0
      try {
        const { count } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
        totalNotes = count || 0
      } catch (e) { console.warn('notes table not yet available') }

      // Fetch unwritten khata count
      let unwrittenKhata = 0
      try {
        const { count } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true })
          .or('khata_written.eq.false,khata_written.is.null')
        unwrittenKhata = count || 0
      } catch (e) { console.warn('unwritten khata fetch failed') }

      // Fetch members for 1st, 2nd, 2026 & last kisti stats
      let firstKistiList = []
      let secondKistiList = []
      let kisti2026List = []
      let lastKistiList = []
      let total2026KistiCount = 0

      try {
        const { data: allMemb, error: membErr } = await supabase.from('members').select('*')
        if (membErr) {
          console.warn('Kisti members query error:', membErr)
        }

        const currentYM = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}`

        const safeAddMonths = (baseDate, months) => {
          try {
            const dt = new Date(baseDate.getTime())
            const day = dt.getDate()
            dt.setDate(1)
            dt.setMonth(dt.getMonth() + months)
            const maxDays = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate()
            dt.setDate(Math.min(day, maxDays))
            const yr = dt.getFullYear()
            const mo = String(dt.getMonth() + 1).padStart(2, '0')
            const da = String(dt.getDate()).padStart(2, '0')
            return `${yr}-${mo}-${da}`
          } catch { return null }
        }

        const safeParseDate = (dateStr) => {
          try {
            if (!dateStr) return null
            const clean = String(dateStr).split('T')[0].split(' ')[0].trim()
            if (clean.includes('-')) {
              const parts = clean.split('-')
              if (parts.length === 3 && parts[0].length === 4) {
                const yr = parseInt(parts[0], 10)
                const mo = parseInt(parts[1], 10)
                const da = parseInt(parts[2], 10)
                if (!isNaN(yr) && !isNaN(mo) && !isNaN(da)) {
                  return new Date(yr, mo - 1, da)
                }
              }
            }
            const fallback = new Date(dateStr)
            return isNaN(fallback.getTime()) ? null : fallback
          } catch { return null }
        }

        ;(allMemb || []).forEach(member => {
          try {
            if (!member.loan_disbursement_date) return
            if (member.loan_cleared_date) return
            if (disabledVoSet.has(Number(member.vo_number))) return

            const disbDate = safeParseDate(member.loan_disbursement_date)
            if (!disbDate) return
            const disbDateStr = member.loan_disbursement_date

            // 1st kisti: disbursement + 1 month = current month AND not paid this month
            const firstKistiDate = safeAddMonths(disbDate, 1)
            if (firstKistiDate && firstKistiDate.substring(0, 7) === currentYM) {
              const paidThisMonth = member.last_paid_date && String(member.last_paid_date).substring(0, 7) === currentYM
              if (!paidThisMonth) {
                firstKistiList.push({ ...member, loan_disbursement_date: disbDateStr, firstKistiDate })
              }
            }

            // 2nd kisti: disbursement + 2 months = current month AND not paid this month
            const secondKistiDate = safeAddMonths(disbDate, 2)
            if (secondKistiDate && secondKistiDate.substring(0, 7) === currentYM) {
              const paidThisMonth = member.last_paid_date && String(member.last_paid_date).substring(0, 7) === currentYM
              if (!paidThisMonth) {
                secondKistiList.push({ ...member, loan_disbursement_date: disbDateStr, secondKistiDate })
              }
            }

            // Last kisti (12th month): disbursement + 12 months = current month AND not paid this month
            const lastKistiDate = safeAddMonths(disbDate, 12)
            if (lastKistiDate && lastKistiDate.substring(0, 7) === currentYM) {
              const paidThisMonth = member.last_paid_date && String(member.last_paid_date).substring(0, 7) === currentYM
              if (!paidThisMonth) {
                lastKistiList.push({ ...member, loan_disbursement_date: disbDateStr, lastKistiDate })
              }
            }

            // 2026 kisti: loans disbursed in 2026, count unpaid installments up to current month
            if (disbDate.getFullYear() === 2026) {
              let count2026 = 0
              const dates2026 = []
              for (let i = 1; i <= 12; i++) {
                const kistiDate = safeAddMonths(disbDate, i)
                if (!kistiDate) continue
                const kistiYM = kistiDate.substring(0, 7)
                if (kistiYM > currentYM) break
                if (kistiDate.substring(0, 4) === '2026') {
                  const paidMonth = member.last_paid_date && String(member.last_paid_date).substring(0, 7) === kistiYM
                  if (!paidMonth) {
                    count2026++
                    dates2026.push(kistiDate)
                  }
                }
              }
              if (count2026 > 0) {
                kisti2026List.push({ ...member, loan_disbursement_date: disbDateStr, count2026, dates2026 })
                total2026KistiCount += count2026
              }
            }
          } catch (memberErr) {
            // Skip this member, don't break entire calculation
            console.warn('Error processing member for kisti:', member?.id, memberErr)
          }
        })

        console.log('[Dashboard Kisti Stats] 1st:', firstKistiList.length, '2nd:', secondKistiList.length, '2026:', total2026KistiCount, 'Last:', lastKistiList.length, 'CurrentYM:', currentYM, 'TotalMembers fetched:', (allMemb || []).length)
      } catch (e) {
        console.warn('Installment stats fetch failed:', e)
      }

      setStats({
        totalMembers,
        totalVOs,
        todayPayments: todayCount,
        tomorrowPayments: tomorrowCount,
        nextWeekPayments: nextWeekCount,
        todayConfirmed: todayConfirmedCount,
        tomorrowConfirmed: tomorrowConfirmedCount,
        nextWeekConfirmed: nextWeekConfirmedCount,
        dueMembers,
        pendingCollections: pendingCount,
        totalDueAmount,
        totalLoanApplications,
        todayLoanCount, todayLoanAmount,
        tomorrowLoanCount, tomorrowLoanAmount,
        todaySavingsCount, todaySavingsAmount,
        tomorrowSavingsCount, tomorrowSavingsAmount,
        runningBooks,
        totalNotes,
        unwrittenKhata,
        latePayers,
        firstKistiCount: firstKistiList.length,
        secondKistiCount: secondKistiList.length,
        total2026KistiCount,
        lastKistiCount: lastKistiList.length,
        firstKistiList,
        secondKistiList,
        kisti2026List,
        lastKistiList,
      })
    } catch (err) {
      console.error('Stats fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, fetchStats }
}

export const useVOStats = (voNumber) => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    calledMembers: 0,
    todayPayments: 0,
    dueMembers: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!voNumber) return
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      const [totalRes, calledRes, dueRes] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('vo_number', voNumber),
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('vo_number', voNumber).eq('is_called', true),
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('vo_number', voNumber).eq('is_due', true),
      ])

      const { data: voKistiData } = await supabase
        .from('members')
        .select('loan_payment_date, expected_payment_date')
        .eq('vo_number', voNumber)
        .is('loan_cleared_date', null)

      const voTodayCount = (voKistiData || []).filter(m =>
        (m.loan_payment_date && m.loan_payment_date === today) ||
        (m.expected_payment_date && m.expected_payment_date === today)
      ).length

      setStats({
        totalMembers: totalRes.count || 0,
        calledMembers: calledRes.count || 0,
        todayPayments: voTodayCount,
        dueMembers: dueRes.count || 0,
      })
    } catch (err) {
      console.error('VO Stats fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [voNumber])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, fetchStats }
}
