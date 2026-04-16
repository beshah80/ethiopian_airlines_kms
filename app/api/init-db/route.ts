import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const demoUsers = [
  { email: 'admin@ethiopianairlines.com', password: 'password123', first_name: 'Abebe', last_name: 'Kebede', role: 'admin', dept: 'Human Resources' },
  { email: 'captain.abebe@ethiopianairlines.com', password: 'password123', first_name: 'Abebe', last_name: 'Bikila', role: 'expert', dept: 'Flight Operations' },
  { email: 'trainee.dawit@ethiopianairlines.com', password: 'password123', first_name: 'Dawit', last_name: 'Hailu', role: 'trainee', dept: 'Flight Operations' },
  { email: 'engineer.tola@ethiopianairlines.com', password: 'password123', first_name: 'Tola', last_name: 'Girma', role: 'expert', dept: 'Engineering & Maintenance' },
  { email: 'staff.selam@ethiopianairlines.com', password: 'password123', first_name: 'Selam', last_name: 'Bekele', role: 'staff', dept: 'Bahir Dar Station' },
];

export async function POST() {
  const supabase = createAdminClient();
  const results = [];

  // 1. Create departments first
  const departments = [
    { name: 'Flight Operations', location: 'Addis Ababa' },
    { name: 'Engineering & Maintenance', location: 'Addis Ababa' },
    { name: 'Human Resources', location: 'Addis Ababa' },
    { name: 'Bahir Dar Station', location: 'Bahir Dar' },
    { name: 'Training Academy', location: 'Addis Ababa' },
  ];

  for (const dept of departments) {
    await supabase.from('departments').upsert({ 
      name: dept.name, 
      description: dept.name,
      regional_location: dept.location 
    }, { onConflict: 'name' });
  }

  // 2. Create users and profiles
  for (const user of demoUsers) {
    try {
      // Check if user exists
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', user.email)
        .single();

      if (existing) {
        results.push({ email: user.email, status: 'exists' });
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

      // Get department ID
      const { data: deptData } = await supabase
        .from('departments')
        .select('id')
        .eq('name', user.dept)
        .single();

      // Create user profile
      await supabase.from('user_profiles').insert({
        id: authData.user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        department_id: deptData?.id,
        languages: ['english', 'amharic'],
        is_expert: user.role === 'expert',
        availability_status: 'available',
        contact_preference: 'email',
      });

      // Create expert profile if expert
      if (user.role === 'expert') {
        await supabase.from('expert_profiles').insert({
          user_id: authData.user.id,
          areas_of_expertise: ['General Aviation'],
          years_experience: 10,
          availability_status: 'available',
          mentorship_available: true,
          languages_spoken: ['english', 'amharic'],
        });
      }

      results.push({ email: user.email, status: 'created', id: authData.user.id });
    } catch (err) {
      results.push({ email: user.email, status: 'error', error: String(err) });
    }
  }

  // 3. Create sample articles
  const { data: dept } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Flight Operations')
    .single();

  const { data: captain } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', 'captain.abebe@ethiopianairlines.com')
    .single();

  if (dept && captain) {
    await supabase.from('knowledge_articles').upsert({
      title: 'HAAB Weather Approach Procedures',
      content: 'Key points for HAAB approaches during rainy season...',
      category: 'sop',
      department_id: dept.id,
      author_id: captain.id,
      status: 'published',
      language: 'en',
    }, { onConflict: 'title' });
  }

  return NextResponse.json({ 
    success: true, 
    results,
    message: 'Database initialized with demo users and data'
  });
}
