import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createAdminClient();
  
  try {
    // Check if we can list users via admin API
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      return NextResponse.json({ 
        error: 'Failed to list users', 
        details: listError.message 
      }, { status: 500 });
    }
    
    // Find our test user
    const testUser = users.users.find(u => u.email === 'captain.abebe@ethiopianairlines.com');
    
    return NextResponse.json({
      total_users: users.users.length,
      test_user_exists: !!testUser,
      test_user: testUser ? {
        id: testUser.id,
        email: testUser.email,
        email_confirmed_at: testUser.email_confirmed_at,
        user_metadata: testUser.user_metadata,
        app_metadata: testUser.app_metadata,
        identities: testUser.identities?.length || 0
      } : null
    });
  } catch (err) {
    return NextResponse.json({ 
      error: 'Exception', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}
