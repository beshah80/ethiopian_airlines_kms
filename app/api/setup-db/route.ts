import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Create admin client with service role key
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Real Ethiopian Airlines Departments
const departments = [
  { name: 'Flight Operations', description: 'Responsible for all flight crew operations, training, and standards', location: 'Addis Ababa - Bole International Airport' },
  { name: 'Engineering & Maintenance', description: 'Aircraft maintenance, repair, and technical services', location: 'Addis Ababa - Maintenance Hangar' },
  { name: 'Cabin Services', description: 'In-flight service standards and cabin crew management', location: 'Addis Ababa' },
  { name: 'Ground Operations', description: 'Airport ground handling and ramp services', location: 'Addis Ababa - Bole International Airport' },
  { name: 'Cargo Operations', description: 'Freight and cargo handling services', location: 'Addis Ababa Cargo Terminal' },
  { name: 'Commercial', description: 'Sales, marketing, and customer service', location: 'Addis Ababa Headquarters' },
  { name: 'Finance', description: 'Financial planning, accounting, and budgeting', location: 'Addis Ababa Headquarters' },
  { name: 'Human Resources', description: 'Recruitment, training, and employee relations', location: 'Addis Ababa Headquarters' },
  { name: 'IT & Digital', description: 'Information technology and digital transformation', location: 'Addis Ababa' },
  { name: 'Bahir Dar Station', description: 'Regional station operations at Bahir Dar Airport', location: 'Bahir Dar' },
  { name: 'Dire Dawa Station', description: 'Regional station operations at Dire Dawa Airport', location: 'Dire Dawa' },
  { name: 'Training Academy', description: 'Pilot, cabin crew, and technical training center', location: 'Addis Ababa - Ethiopian Aviation Academy' },
];

// Real Ethiopian Airlines Users
const realUsers = [
  { email: 'admin@ethiopianairlines.com', password: 'password123', first_name: 'Abebe', last_name: 'Kebede', role: 'admin', dept: 'Human Resources' },
  { email: 'captain.abebe@ethiopianairlines.com', password: 'password123', first_name: 'Abebe', last_name: 'Bikila', role: 'expert', dept: 'Flight Operations', expertise: ['Boeing 787', 'Boeing 777', 'Airbus A350'], experience: 15 },
  { email: 'captain.selam@ethiopianairlines.com', password: 'password123', first_name: 'Selam', last_name: 'Tadesse', role: 'expert', dept: 'Flight Operations', expertise: ['Boeing 737 MAX', 'Boeing 737-800'], experience: 12 },
  { email: 'fo.dawit@ethiopianairlines.com', password: 'password123', first_name: 'Dawit', last_name: 'Haile', role: 'trainee', dept: 'Flight Operations' },
  { email: 'captain.yonas@ethiopianairlines.com', password: 'password123', first_name: 'Yonas', last_name: 'Girma', role: 'expert', dept: 'Flight Operations', expertise: ['Airbus A350', 'Boeing 787'], experience: 18 },
  { email: 'engineer.tola@ethiopianairlines.com', password: 'password123', first_name: 'Tola', last_name: 'Girma', role: 'expert', dept: 'Engineering & Maintenance', expertise: ['Boeing 787 Maintenance', 'Composite Repairs'], experience: 14 },
  { email: 'engineer.hiwot@ethiopianairlines.com', password: 'password123', first_name: 'Hiwot', last_name: 'Bekele', role: 'expert', dept: 'Engineering & Maintenance', expertise: ['Airbus A350 Maintenance', 'Engine Overhaul'], experience: 16 },
  { email: 'mechanic.bereket@ethiopianairlines.com', password: 'password123', first_name: 'Bereket', last_name: 'Alemu', role: 'trainee', dept: 'Engineering & Maintenance' },
  { email: 'ccm.meron@ethiopianairlines.com', password: 'password123', first_name: 'Meron', last_name: 'Desta', role: 'expert', dept: 'Cabin Services', expertise: ['Cabin Safety', 'Service Excellence'], experience: 10 },
  { email: 'cs.manager@ethiopianairlines.com', password: 'password123', first_name: 'Tigist', last_name: 'Wolde', role: 'expert', dept: 'Commercial', expertise: ['Customer Relations', 'Service Recovery'], experience: 11 },
  { email: 'ground.tewodros@ethiopianairlines.com', password: 'password123', first_name: 'Tewodros', last_name: 'Abebe', role: 'staff', dept: 'Bahir Dar Station' },
  { email: 'cargo.mulu@ethiopianairlines.com', password: 'password123', first_name: 'Mulu', last_name: 'Worku', role: 'staff', dept: 'Cargo Operations' },
  { email: 'finance.abeba@ethiopianairlines.com', password: 'password123', first_name: 'Abeba', last_name: 'Abera', role: 'staff', dept: 'Finance' },
  { email: 'it.daniel@ethiopianairlines.com', password: 'password123', first_name: 'Daniel', last_name: 'Getachew', role: 'expert', dept: 'IT & Digital', expertise: ['Aviation IT Systems', 'Cybersecurity'], experience: 9 },
  { email: 'training.solomon@ethiopianairlines.com', password: 'password123', first_name: 'Solomon', last_name: 'Tsegaye', role: 'expert', dept: 'Training Academy', expertise: ['Flight Training', 'Simulator Instruction'], experience: 20 },
];

export async function POST() {
  const supabase = createAdminClient();
  const results: { email: string; status: string; error?: string }[] = [];

  try {
    // 1. Create departments
    for (const dept of departments) {
      const { error } = await supabase
        .from('departments')
        .upsert(
          { 
            name: dept.name, 
            description: dept.description,
            regional_location: dept.location 
          }, 
          { onConflict: 'name' }
        );
      if (error) {
        console.error('Department error:', error);
      }
    }

    // 2. Get department IDs
    const { data: deptData } = await supabase.from('departments').select('id, name');
    const deptMap = new Map(deptData?.map(d => [d.name, d.id]) || []);

    // 3. Create users using Admin API
    for (const user of realUsers) {
      try {
        // Check if user exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', user.email)
          .single();

        if (existingProfile) {
          results.push({ email: user.email, status: 'exists' });
          continue;
        }

        // Create auth user via signUp (properly sets password)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              first_name: user.first_name,
              last_name: user.last_name,
            },
          },
        });

        if (signUpError || !signUpData.user) {
          results.push({ 
            email: user.email, 
            status: 'error', 
            error: signUpError?.message || 'Failed to create user' 
          });
          continue;
        }

        // Confirm email immediately via admin API
        await supabase.auth.admin.updateUserById(
          signUpData.user.id,
          { email_confirm: true }
        );

        // Create user profile
        const deptId = deptMap.get(user.dept);
        const { error: profileError } = await supabase.from('user_profiles').upsert({
          id: signUpData.user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          department_id: deptId,
          languages: ['english', 'amharic'],
          is_expert: user.role === 'expert',
          availability_status: user.role === 'expert' ? 'available' : 'offline',
          contact_preference: 'email',
        }, { onConflict: 'id' });

        if (profileError) {
          console.error('Profile error:', profileError);
        }

        // Create expert profile for experts
        if (user.role === 'expert' && 'expertise' in user) {
          await supabase.from('expert_profiles').upsert({
            user_id: signUpData.user.id,
            areas_of_expertise: user.expertise,
            years_experience: user.experience || 10,
            availability_status: 'available',
            mentorship_available: true,
            languages_spoken: ['english', 'amharic'],
            certifications: ['Ethiopian Airlines Certified'],
          }, { onConflict: 'user_id' });
        }

        results.push({ email: user.email, status: 'created' });
      } catch (err) {
        results.push({ 
          email: user.email, 
          status: 'error', 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }

    // 4. Create real knowledge articles
    const { data: flightOps } = await supabase.from('departments').select('id').eq('name', 'Flight Operations').single();
    const { data: captain } = await supabase.from('user_profiles').select('id').eq('email', 'captain.abebe@ethiopianairlines.com').single();

    if (flightOps && captain) {
      const articles = [
        {
          title: 'HAAB (Addis Ababa) Special Approach Procedures',
          content: 'Addis Ababa Bole International Airport (HAAB) approach procedures during adverse weather conditions. Key points: 1) RWY 07R/25L primary for ILS approaches, 2) High terrain considerations east of airport, 3) Standard missed approach procedures, 4) Communication frequencies and handover protocols.',
          category: 'sop',
          department_id: flightOps.id,
          author_id: captain.id,
          status: 'published',
          language: 'en',
        },
        {
          title: 'Boeing 787 Dreamliner Performance Data - High Altitude Operations',
          content: 'Performance considerations for Boeing 787 operations from high-altitude airports (HAAB elevation 7,625 ft). Includes takeoff performance tables, engine-out procedures, and fuel planning adjustments.',
          category: 'technical',
          department_id: flightOps.id,
          author_id: captain.id,
          status: 'published',
          language: 'en',
        },
        {
          title: 'Ethiopian Airspace Communication Protocols',
          content: 'Standard radio communication procedures within Ethiopian airspace. HF frequencies for oceanic routes, VHF sector frequencies, Addis ACC handover points, and emergency communication procedures.',
          category: 'sop',
          department_id: flightOps.id,
          author_id: captain.id,
          status: 'published',
          language: 'en',
        },
      ];

      for (const article of articles) {
        await supabase.from('knowledge_articles').upsert(article, { onConflict: 'title' });
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      message: 'Database initialized successfully with Ethiopian Airlines data'
    });

  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error',
      results 
    }, { status: 500 });
  }
}
