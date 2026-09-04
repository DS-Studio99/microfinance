const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://exotinmrkwgpzujnmzuq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4b3Rpbm1ya3dncHp1am5tenVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzOTE5MDMsImV4cCI6MjA5MTk2NzkwM30.acMrvSR7l3jZ7FCZgUI0KpnALU2iJtGUCwY7-pOT8RI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
  const { data: members, error } = await supabase.from('members').select('*')
  if (error) {
    console.error('Error fetching members:', error)
    return
  }
  console.log(`Total members in database: ${members?.length}`)
  
  const todayObj = new Date()
  console.log('Today date:', todayObj.toISOString(), 'Local YM:', `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}`)

  members.forEach((m, idx) => {
    console.log(`\n--- Member ${idx + 1} ---`)
    console.log(`ID: ${m.id}, Name: ${m.full_name}, VO: ${m.vo_number} (${typeof m.vo_number})`)
    console.log(`Disbursement Date: "${m.loan_disbursement_date}"`)
    console.log(`Cleared Date: "${m.loan_cleared_date}"`)
    console.log(`Last Paid Date: "${m.last_paid_date}"`)
    console.log(`Payment Date: "${m.loan_payment_date}"`)
  })

  const { data: voGroups } = await supabase.from('vo_groups').select('*')
  console.log('\nVO Groups:', voGroups)
}

run()
