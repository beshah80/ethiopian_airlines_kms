import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
];

export async function POST() {
  const supabase = await createClient();
  const results = [];

  for (const user of demoUsers) {
    try {
      // Check if user already exists
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', user.email)
        .single();

      if (existing) {
        results.push({ email: user.email, status: 'already exists' });
        continue;
      }

      // Create auth user using admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name,
        },
      });

      if (authError) {
        results.push({ email: user.email, status: 'error', error: authError.message });
        continue;
      }

      if (!authData.user) {
        results.push({ email: user.email, status: 'error', error: 'No user created' });
        continue;
      }

      results.push({ 
        email: user.email, 
        status: 'created', 
        id: authData.user.id 
      });
    } catch (err) {
      results.push({ 
        email: user.email, 
        status: 'error', 
        error: err instanceof Error ? err.message : String(err) 
      });
    }
  }

  return NextResponse.json({ results });
}

// GET method to check current users
export async function GET() {
  const supabase = await createClient();
  
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('id, email, first_name, last_name, role');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: users || [] });
}
