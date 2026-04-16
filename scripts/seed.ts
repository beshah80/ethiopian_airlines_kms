const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log("Seeding database...");

  const users = [
    { email: "admin@ethiopianairlines.com", pass: "admin123", role: "admin", first: "System", last: "Admin", dept: "it", expert: false },
    { email: "expert@ethiopianairlines.com", pass: "expert123", role: "staff", first: "Abebe", last: "Engineer", dept: "engineering", expert: true },
    { email: "community@ethiopianairlines.com", pass: "community123", role: "staff", first: "Selam", last: "Service", dept: "customer_service", expert: false }
  ];

  const createdUsers: Record<string, string> = {};

  // 1. Create or ensure users exist
  for (const u of users) {
    let { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.pass,
      email_confirm: true
    });

    if (authError && authError.message.includes('already exists')) {
       // Fetch existing user id if possible, but admin.createUser doesn't return ID if it exists and we can't easily list users without pagination.
       // Let's try to query by email via rpc or just skip... actually auth.admin.listUsers() is easier
       const { data: listData } = await supabase.auth.admin.listUsers();
       const existingUser = (listData?.users || []).find((x: any) => x.email === u.email);
       if (existingUser) {
          authData = { user: existingUser };
       }
    } else if (authError) {
       console.error(`Error creating ${u.email}:`, authError.message);
       continue;
    }

    if (authData?.user) {
        createdUsers[u.role] = authData.user.id;
        
        // Ensure user_profile exists
        await supabase.from('user_profiles').upsert({
            id: authData.user.id,
            first_name: u.first,
            last_name: u.last,
            email: u.email,
            role: u.role,
            department_id: u.dept,
            is_expert: u.expert
        });

        // Add expert profile if expert
        if (u.expert) {
            await supabase.from('expert_profiles').upsert({
                user_id: authData.user.id,
                bio: "Senior Maintenance Engineer with 15 years resolving B787 hydraulic systems.",
                areas_of_expertise: ["B787", "Hydraulics", "Engines"],
                years_experience: 15,
                availability_status: "available",
            }, { onConflict: 'user_id' });
        }
    }
  }

  const expertId = createdUsers["staff"] || createdUsers["admin"]; // The expert one

  // 2. Insert Knowledge Articles
  if (expertId) {
     console.log("Adding dummy knowledge articles...");
     await supabase.from('knowledge_articles').insert([
        {
           title: "B787 Hydraulic System B Pressure Drop Protocol",
           category: "sop",
           status: "published",
           language: "both",
           content: "When experiencing pressure drop on B787 System B during taxi, isolate the engine driven pump before returning to gate.",
           content_am: "በታክሲ ጊዜ በ B787 ላይ የግፊት መቀነስ ካጋጠመዎት ወደ ሚዛን ከመመለስዎ በፊት በሞተር የሚንቀሳቀሰውን ፓምፕ ይለዩ።",
           tags: ["B787", "Hydraulics", "SOP"],
           author_id: expertId,
           helpful_count: 42,
           view_count: 156
        },
        {
           title: "Passenger Handling - Bahir Dar Regional Desk",
           category: "best_practice",
           status: "published",
           language: "en",
           content: "Always pre-check passenger manifests for large groups during rainy season.",
           tags: ["Customer Service", "Bahir Dar"],
           author_id: createdUsers["admin"],
           helpful_count: 12,
           view_count: 85
        }
     ]).select('id');
  }

  // 3. Insert Innovation Ideas
  await supabase.from('innovation_ideas').insert([
      {
         title: "Digital Baggage Tracking Enhancements",
         description: "Implement RFID scanners at the Addis Ababa hub to reduce transfer losses by 30%.",
         department: "ground_ops",
         estimated_impact: "high",
         status: "under_review",
         votes: 34,
         submitted_by: createdUsers["admin"]
      },
      {
         title: "Tablet-based Maintenance Logs",
         description: "Replace physical sign-offs with iPads to speed up turnaround times.",
         department: "engineering",
         estimated_impact: "medium",
         status: "approved",
         votes: 89,
         submitted_by: expertId
      }
  ]);

  // 4. Insert Lessons Learned
  await supabase.from('lessons_learned').insert([
      {
          title: "A350 Turnaround Delay - HAAB Weather",
          incident_date: "2026-03-12",
          department: "ground_ops",
          flight_number: "ET302",
          aircraft_type: "A350",
          summary: "Heavy rain caused baggage loaders to pause operations, resulting in a 45-minute delay.",
          root_cause: "Lack of waterproof tarps for cargo loader equipment.",
          corrective_action: "Purchased heavy-duty covers for all ground equipment.",
          preventability: "partially_preventable",
          submitted_by: expertId
      }
  ]);

  console.log("✅ Database seeding complete! Test accounts:");
  console.log("admin@ethiopianairlines.com / admin123");
  console.log("expert@ethiopianairlines.com / expert123");
  console.log("community@ethiopianairlines.com / community123");
}

seed();
