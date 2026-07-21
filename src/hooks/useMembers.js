import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useMembers = (voNumber = null) => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (voNumber !== null) {
        query = query.eq('vo_number', voNumber)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      const today = new Date().toISOString().split('T')[0]

      // Client-side auto-overdue: find members whose payment date has passed
      // and are not yet cleared and not yet marked due
      const toMarkDue = (data || []).filter(
        m => m.loan_payment_date &&
             m.loan_payment_date < today &&
             !m.loan_cleared_date &&
             !m.is_due
      )

      if (toMarkDue.length > 0) {
        // Batch update without toast (silent background update)
        await supabase
          .from('members')
          .update({ is_due: true })
          .in('id', toMarkDue.map(m => m.id))
        // Update local state directly
        const updated = (data || []).map(m =>
          toMarkDue.find(t => t.id === m.id) ? { ...m, is_due: true } : m
        )
        setMembers(updated)
      } else {
        setMembers(data || [])
      }
    } catch (err) {
      setError(err.message)
      toast.error('সদস্যদের তথ্য লোড করতে ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }, [voNumber])


  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const addMember = async (memberData) => {
    try {
      if (memberData.member_number) {
        const { data: existing } = await supabase
          .from('members')
          .select('id')
          .eq('member_number', memberData.member_number)
          .single()
        if (existing) {
          toast.error('এই সদস্য নাম্বারটি ইতিমধ্যে ব্যবহার করা হয়েছে')
          return { data: null, error: new Error('Duplicate member_number') }
        }
      }

      const { data, error } = await supabase
        .from('members')
        .insert([memberData])
        .select()
        .single()

      if (error) throw error
      toast.success('সদস্য সফলভাবে যোগ করা হয়েছে')
      fetchMembers()
      return { data, error: null }
    } catch (err) {
      toast.error('সদস্য যোগ করতে ব্যর্থ হয়েছে')
      return { data: null, error: err }
    }
  }

  const updateMember = async (id, memberData) => {
    try {
      if (memberData.member_number) {
        const { data: existing } = await supabase
          .from('members')
          .select('id')
          .eq('member_number', memberData.member_number)
          .neq('id', id)
          .maybeSingle()
        if (existing) {
          toast.error('এই সদস্য নাম্বারটি ইতিমধ্যে ব্যবহার করা হয়েছে')
          return { data: null, error: new Error('Duplicate member_number') }
        }
      }

      const { data, error } = await supabase
        .from('members')
        .update({ ...memberData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      toast.success('সদস্যের তথ্য সফলভাবে আপডেট করা হয়েছে')
      fetchMembers()
      return { data, error: null }
    } catch (err) {
      toast.error('সদস্যের তথ্য আপডেট করতে ব্যর্থ হয়েছে')
      return { data: null, error: err }
    }
  }

  const deleteMember = async (id) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('সদস্য সফলভাবে মুছে ফেলা হয়েছে')
      fetchMembers()
      return { error: null }
    } catch (err) {
      toast.error('সদস্য মুছে ফেলতে ব্যর্থ হয়েছে')
      return { error: err }
    }
  }

  const quickUpdateField = async (id, field, value) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      const label = field === 'is_called' ? (value ? 'কল করা হয়েছে' : 'কল করা হয়নি') : (value ? 'বকেয়া আছে' : 'বকেয়া পরিশোধ হয়েছে')
      toast.success(`${label} হিসেবে চিহ্নিত করা হয়েছে`)
      fetchMembers()
      return { error: null }
    } catch (err) {
      toast.error('আপডেট করতে ব্যর্থ হয়েছে')
      return { error: err }
    }
  }

  const markAsPaid = async (member) => {
    try {
      const updates = {
        loan_payment_date: null,
        expected_payment_date: null,
        is_due: false,
        is_called: false,
        last_paid_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', member.id)

      if (error) throw error
      
      toast.success('কিস্তি সফলভাবে পরিশোধিত হয়েছে')
      fetchMembers()
      return { error: null }
    } catch (err) {
      toast.error('পরিশোধ চিহ্নিত করতে ব্যর্থ হয়েছে')
      return { error: err }
    }
  }

  const setNextMonthDateForPaidMembers = async (dateStr) => {
    if (voNumber === null) return { error: 'No VO number' }
    try {
      // Find members in this VO that are paid (loan_payment_date is null)
      const toUpdate = members.filter(m => !m.loan_payment_date && m.vo_number === voNumber)
      if (toUpdate.length === 0) {
        toast.error('এই ভিও-তে কোনো পরিশোধিত মেম্বার পাওয়া যায়নি')
        return { error: 'No paid members found' }
      }

      const { error } = await supabase
        .from('members')
        .update({ loan_payment_date: dateStr, updated_at: new Date().toISOString() })
        .in('id', toUpdate.map(m => m.id))

      if (error) throw error
      toast.success('আগামী মাসের কিস্তির তারিখ সফলভাবে সেট করা হয়েছে')
      fetchMembers()
      return { error: null }
    } catch (err) {
      toast.error('তারিখ আপডেট করতে ব্যর্থ হয়েছে')
      return { error: err }
    }
  }

  return {
    members,
    loading,
    error,
    fetchMembers,
    addMember,
    updateMember,
    deleteMember,
    quickUpdateField,
    markAsPaid,
    setNextMonthDateForPaidMembers,
  }
}
