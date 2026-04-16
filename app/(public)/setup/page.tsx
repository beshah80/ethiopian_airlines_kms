"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Plane, Users, Building2 } from "lucide-react";
import Link from "next/link";

export default function SetupPage() {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const seedDatabase = async () => {
    setSeeding(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/setup-db', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to setup database');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup database');
    }
    setSeeding(false);
  };

  const createdCount = result?.results?.filter((r: any) => r.status === 'created').length || 0;
  const existsCount = result?.results?.filter((r: any) => r.status === 'exists').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-600 rounded-full mb-4">
            <Plane className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ethiopian Airlines KMS</h1>
          <p className="text-slate-600">Knowledge Management System Setup</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-amber-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Database Initialization
            </CardTitle>
            <CardDescription className="text-amber-100">
              Setup real Ethiopian Airlines data including departments, users, and expert profiles
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* What will be created */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg text-center">
                <Building2 className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-900">12 Departments</p>
                <p className="text-sm text-slate-600">Flight Ops, Engineering, Training...</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg text-center">
                <Users className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-900">15 Real Users</p>
                <p className="text-sm text-slate-600">Pilots, Engineers, Staff, Admin</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg text-center">
                <CheckCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-900">Expert Profiles</p>
                <p className="text-sm text-slate-600">Skills, certifications, availability</p>
              </div>
            </div>

            <Button 
              onClick={seedDatabase} 
              disabled={seeding}
              className="w-full bg-amber-600 hover:bg-amber-700 h-14 text-lg"
              size="lg"
            >
              {seeding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Initializing Database...
                </>
              ) : (
                'Initialize Ethiopian Airlines KMS'
              )}
            </Button>

            {result && (
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <h3 className="font-bold text-lg text-slate-900">Setup Complete!</h3>
                </div>
                <p className="text-slate-600 mb-4">
                  Created: <span className="font-bold text-green-600">{createdCount}</span> users | 
                  Already exists: <span className="font-bold text-blue-600">{existsCount}</span> users
                </p>
                
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {result.results?.map((r: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm p-2 rounded hover:bg-white">
                      {r.status === 'created' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : r.status === 'exists' ? (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-mono text-xs flex-1">{r.email}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        r.status === 'created' ? 'bg-green-100 text-green-700' : 
                        r.status === 'exists' ? 'bg-blue-100 text-blue-700' : 
                        'bg-red-100 text-red-700'
                      }`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
              <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Login Credentials (All use: password123)
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="font-mono text-green-800">captain.abebe@ethiopianairlines.com</p>
                  <p className="text-green-600 text-xs">Senior Pilot - Flight Operations</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="font-mono text-green-800">engineer.tola@ethiopianairlines.com</p>
                  <p className="text-green-600 text-xs">Aircraft Maintenance Expert</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="font-mono text-green-800">admin@ethiopianairlines.com</p>
                  <p className="text-green-600 text-xs">System Administrator</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="font-mono text-green-800">captain.selam@ethiopianairlines.com</p>
                  <p className="text-green-600 text-xs">Senior Pilot - Boeing 737</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="font-mono text-green-800">ground.tewodros@ethiopianairlines.com</p>
                  <p className="text-green-600 text-xs">Bahir Dar Station Staff</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="font-mono text-green-800">fo.dawit@ethiopianairlines.com</p>
                  <p className="text-green-600 text-xs">Trainee First Officer</p>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Link href="/login">
                <Button variant="outline" className="text-amber-600 border-amber-600 hover:bg-amber-50 px-8">
                  Go to Login Page →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
