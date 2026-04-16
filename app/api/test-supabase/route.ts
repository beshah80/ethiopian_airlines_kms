import { createClient } from '@supabase/supabase-js'
import { NextResponse } from "next/server";

export async function GET() {
  // Test with basic client (no SSR)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Test 1: Check connection
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    // Test 2: Try to query a table
    const { data: tableData, error: tableError } = await supabase
      .from('departments')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      session_error: sessionError?.message || null,
      table_error: tableError?.message || null,
      table_exists: !tableError,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Unknown error',
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    }, { status: 500 });
  }
}
