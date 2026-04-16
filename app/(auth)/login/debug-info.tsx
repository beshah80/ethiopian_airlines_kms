"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function DebugInfo() {
  const [info, setInfo] = useState<string | null>(null);
  const supabase = createClient();

  const testConnection = async () => {
    // Test 1: Check Supabase URL
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    // Test 2: Try to get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Test 3: Try anonymous query to check if DB is reachable
    const { data: testData, error: testError } = await supabase
      .from('departments')
      .select('count', { count: 'exact', head: true });

    setInfo(`
Supabase URL: ${url || 'NOT SET'}
Session: ${session ? 'Active' : 'None'}
Session Error: ${sessionError?.message || 'None'}
DB Connection: ${testError ? 'FAILED: ' + testError.message : 'OK'}
Departments Table: ${testData !== null ? 'Accessible' : 'Not accessible'}
    `.trim());
  };

  return (
    <div className="mt-4 p-4 bg-slate-100 rounded text-xs font-mono">
      <Button variant="outline" size="sm" onClick={testConnection} className="mb-2">
        Test Connection
      </Button>
      {info && <pre className="whitespace-pre-wrap">{info}</pre>}
    </div>
  );
}
