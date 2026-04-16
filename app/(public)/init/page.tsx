"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function InitPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const initDatabase = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/init-db', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize database');
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-20">
      <Card>
        <CardHeader>
          <CardTitle>Initialize Database</CardTitle>
          <CardDescription>
            Create demo users and sample data automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={initDatabase} 
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Initializing...
              </>
            ) : (
              'Initialize Database'
            )}
          </Button>

          {result && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Results:</h3>
              <div className="space-y-2">
                {result.results?.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {r.status === 'created' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : r.status === 'exists' ? (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-mono">{r.email}</span>
                    <span className="text-slate-500">- {r.status}</span>
                    {r.error && <span className="text-red-500 text-xs">({r.error})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-amber-800">Login Credentials:</h3>
            <p className="text-sm text-amber-700 mb-2">
              After initialization, login with:
            </p>
            <ul className="text-sm text-amber-700 space-y-1 font-mono">
              <li>captain.abebe@ethiopianairlines.com / password123</li>
              <li>engineer.tola@ethiopianairlines.com / password123</li>
              <li>admin@ethiopianairlines.com / password123</li>
            </ul>
          </div>

          <div className="text-center">
            <a href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
              Go to Login →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
