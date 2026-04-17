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

  return {
    voGroups,
    loading,
    error,
    fetchVOGroups,
    addVOGroup,
    updateVOGroup,
    deleteVOGroup,
  }
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalVOs: 0,
    todayPayments: 0,
    tomorrowPayments: 0,
    dueMembers: 0,
    pendingCollections: 0
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

      const [membersRes, voRes, dueRes] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('vo_groups').select('id', { count: 'exact', head: true }),
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('is_due', true),
      ])

      // for today and tomorrow payments, we fetch since we need custom logic
      const { data: kistiData } = await supabase
        .from('members')
        .select('loan_payment_date, expected_payment_date')
        .is('loan_cleared_date', null)

      const todayCount = (kistiData || []).filter(m =>
        (m.loan_payment_date && m.loan_payment_date === today) ||
        (m.expected_payment_date && m.expected_payment_date === today)
      ).length

      const tomorrowCount = (kistiData || []).filter(m =>
        (m.loan_payment_date && m.loan_payment_date === tomorrow) ||
        (m.expected_payment_date && m.expected_payment_date === tomorrow)
      ).length

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

      setStats({
        totalMembers: membersRes.count || 0,
        totalVOs: voRes.count || 0,
        todayPayments: todayCount,
        tomorrowPayments: tomorrowCount,
        dueMembers: dueRes.count || 0,
        pendingCollections: pendingCount
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
