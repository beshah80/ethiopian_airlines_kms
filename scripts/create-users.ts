// Script to create demo users in Supabase Auth
// Run with: npx tsx scripts/create-users.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const demoUsers = [
  { email: 'admin@ethiopianairlines.com', password: 'password123', first_name: 'Abebe', last_name: 'Kebede' },
  { email: 'flightops.head@ethiopianairlines.com', password: 'password123', first_name: 'Solomon', last_name: 'Tadesse' },
  { email: 'captain.abebe@ethiopianairlines.com', password: 'password123', first_name: 'Abebe', last_name: 'Bikila' },
  { email: 'trainee.dawit@ethiopianairlines.com', password: 'password123', first_name: 'Dawit', last_name: 'Hailu' },
  { email: 'engineer.tola@ethiopianairlines.com', password: 'password123', first_name: 'Tola', last_name: 'Girma' },
  { email: 'technician.biniam@ethiopianairlines.com', password: 'password123', first_name: 'Biniam', last_name: 'Alemu' },
  { email: 'staff.selam@ethiopianairlines.com', password: 'password123', first_name: 'Selam', last_name: 'Bekele' },
  { email: 'innovation.hiwot@ethiopianairlines.com', password: 'password123', first_name: 'Hiwot', last_name: 'Mesfin' },
  { email: 'ground.yonas@ethiopianairlines.com', password: 'password123', first_name: 'Yonas', last_name: 'Dereje' },
  { email: 'training.genet@ethiopianairlines.com', password: 'password123', first_name: 'Genet', last_name: 'Tadesse' },
]

async function createUsers() {
  console.log('Creating demo users...\n')
  
  for (const user of demoUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Auto-confirm emails
      user_metadata: {
        first_name: user.first_name,
        last_name: user.last_name
      }
    })
    
    if (error) {
      console.error(`❌ Failed to create ${user.email}:`, error.message)
    } else {
      console.log(`✅ Created: ${user.email} (ID: ${data.user.id})`)
    }
  }
  
  console.log('\n✅ Done! Now run the SQL seed data.')
  console.log('Note: You need to update seed_data.sql with the real UUIDs from above.')
}

createUsers()
