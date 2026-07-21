import { useState, useEffect, useCallback } from 'react'
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
  const activeVoGroups = voGroups.filter(vo => !vo.is_disabled)
  const disabledVoNumbers = voGroups.filter(vo => vo.is_disabled).map(vo => vo.vo_number)

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
    latePayers: 0
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
      const { data: disabledVOs } = await supabase
        .from('vo_groups')
        .select('vo_number')
        .eq('is_disabled', true)
      const disabledVoNums = (disabledVOs || []).map(v => v.vo_number)

      // Build member queries - if disabled VOs exist, filter them out
      let membersQuery = supabase.from('members').select('id', { count: 'exact', head: true })
      let voQuery = supabase.from('vo_groups').select('id', { count: 'exact', head: true }).neq('is_disabled', true)
      let dueQuery = supabase.from('members').select('id', { count: 'exact', head: true }).eq('is_due', true)
      let lateQuery = supabase.from('members').select('id', { count: 'exact', head: true }).eq('is_late_payer', true)

      if (disabledVoNums.length > 0) {
        const notIn = disabledVoNums
        membersQuery = membersQuery.not('vo_number', 'in', `(${notIn.join(',')})`)
        dueQuery = dueQuery.not('vo_number', 'in', `(${notIn.join(',')})`)
        lateQuery = lateQuery.not('vo_number', 'in', `(${notIn.join(',')})`)
      }

      const [membersRes, voRes, dueRes, lateRes] = await Promise.all([
        membersQuery, voQuery, dueQuery, lateQuery,
      ])

      // for today and tomorrow payments, we fetch since we need custom logic
      let kistiQuery = supabase
        .from('members')
        .select('loan_payment_date, expected_payment_date, is_confirmed')
        .is('loan_cleared_date', null)
      if (disabledVoNums.length > 0) {
        kistiQuery = kistiQuery.not('vo_number', 'in', `(${disabledVoNums.join(',')})`)
      }
      const { data: kistiData } = await kistiQuery

      const todayList = (kistiData || []).filter(m =>
        (m.loan_payment_date && m.loan_payment_date === today) ||
        (m.expected_payment_date && m.expected_payment_date === today)
      )
      const tomorrowList = (kistiData || []).filter(m =>
        (m.loan_payment_date && m.loan_payment_date === tomorrow) ||
        (m.expected_payment_date && m.expected_payment_date === tomorrow)
      )
      const nextWeekList = (kistiData || []).filter(m =>
        (m.loan_payment_date && m.loan_payment_date === nextWeek) ||
        (m.expected_payment_date && m.expected_payment_date === nextWeek)
      )

      const todayCount = todayList.length
      const tomorrowCount = tomorrowList.length
      const nextWeekCount = nextWeekList.length
      const todayConfirmedCount = todayList.filter(m => m.is_confirmed).length
      const tomorrowConfirmedCount = tomorrowList.filter(m => m.is_confirmed).length
      const nextWeekConfirmedCount = nextWeekList.filter(m => m.is_confirmed).length

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
        let dueAmtQuery = supabase
          .from('members')
          .select('extra_amount')
          .gt('extra_amount', 0)
        if (disabledVoNums.length > 0) {
          dueAmtQuery = dueAmtQuery.not('vo_number', 'in', `(${disabledVoNums.join(',')})`)
        }
        const { data: dueData } = await dueAmtQuery
        totalDueAmount = (dueData || []).reduce((sum, m) => sum + (m.extra_amount || 0), 0)
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

      setStats({
        totalMembers: membersRes.count || 0,
        totalVOs: voRes.count || 0,
        todayPayments: todayCount,
        tomorrowPayments: tomorrowCount,
        nextWeekPayments: nextWeekCount,
        todayConfirmed: todayConfirmedCount,
        tomorrowConfirmed: tomorrowConfirmedCount,
        nextWeekConfirmed: nextWeekConfirmedCount,
        dueMembers: dueRes.count || 0,
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
        latePayers: lateRes.count || 0
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
