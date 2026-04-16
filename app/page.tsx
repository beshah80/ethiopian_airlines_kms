import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Lightbulb, Shield, Globe, Plane, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <section
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('/assets/background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4 text-center text-white relative z-10">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight mt-8">
            Ethiopian Airlines<br />
            <span className="text-amber-400">Knowledge Management</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto mb-12 leading-relaxed">
            Preserving institutional knowledge. Empowering excellence across Flight Operations,
            Engineering, and Customer Service through innovation and localization.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-lg px-10 py-6">
                Access Knowledge Base
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#strategic-framework">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-lg px-10 py-6">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-16">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <p className="text-4xl font-bold text-amber-500">12</p>
              <p className="text-sm text-slate-600 font-medium">Departments</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <p className="text-4xl font-bold text-amber-500">4</p>
              <p className="text-sm text-slate-600 font-medium">Regional Stations</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <p className="text-4xl font-bold text-amber-500">2</p>
              <p className="text-sm text-slate-600 font-medium">Languages</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <p className="text-4xl font-bold text-amber-400">15+</p>
              <p className="text-sm text-slate-600 font-medium">Expert Profiles</p>
            </div>
          </div>

          <div id="strategic-framework" className="text-center mb-16 scroll-mt-24">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Strategic Knowledge Framework</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built around three core pillars: Innovation, Quality Assurance, and Ethiopian Localization
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-all border-t-4 border-t-amber-500">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-amber-600 mb-3" />
                <CardTitle className="text-xl">Knowledge Repository</CardTitle>
                <CardDescription className="text-base">
                  Centralized SOPs, manuals, and best practices with bilingual support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Searchable documentation</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Version control & history</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Amharic & English content</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-t-4 border-t-amber-500">
              <CardHeader>
                <Users className="h-12 w-12 text-amber-600 mb-3" />
                <CardTitle className="text-xl">Expert Locator</CardTitle>
                <CardDescription className="text-base">
                  Find and connect with subject matter experts across all departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Expert profiles & skills</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Direct inquiry system</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Mentorship matching</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-t-4 border-t-amber-500">
              <CardHeader>
                <Lightbulb className="h-12 w-12 text-amber-600 mb-3" />
                <CardTitle className="text-xl">Innovation Hub</CardTitle>
                <CardDescription className="text-base">
                  Capture and vote on improvement ideas from all staff levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Idea submission portal</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Community voting</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Implementation tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-t-4 border-t-amber-500">
              <CardHeader>
                <Shield className="h-12 w-12 text-amber-600 mb-3" />
                <CardTitle className="text-xl">Lessons Learned</CardTitle>
                <CardDescription className="text-base">
                  Document and share operational insights from incidents and flights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> After-action reviews</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Incident analysis</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Preventive measures</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-t-4 border-t-amber-500">
              <CardHeader>
                <Globe className="h-12 w-12 text-amber-600 mb-3" />
                <CardTitle className="text-xl">Ethiopian Localization</CardTitle>
                <CardDescription className="text-base">
                  Built for Ethiopian context with offline support and storytelling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Amharic interface</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Offline mobile access</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Regional station support</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all border-t-4 border-t-amber-500">
              <CardHeader>
                <Plane className="h-12 w-12 text-amber-600 mb-3" />
                <CardTitle className="text-xl">Department Coverage</CardTitle>
                <CardDescription className="text-base">
                  Tailored for Flight Ops, Engineering, Customer Service, Ground Ops
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Flight Operations</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Engineering & Maintenance</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Training Academy</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Personas Section */}
      <section className="py-24 px-4 bg-slate-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Real-World Scenarios</h2>
            <p className="text-lg text-slate-400">
              Key user personas demonstrating how Ethiopian Airlines staff use the KMS
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Plane className="h-6 w-6 text-amber-400" />
                </div>
                <h4 className="font-bold text-xl text-amber-400">Captain Abebe Bikila</h4>
              </div>
              <p className="text-slate-300 mb-4">Senior Pilot, 15 years experience, 10,000+ hours</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Shares expert knowledge via video stories about challenging weather approaches at HAAB (Addis Ababa).
                Documents Boeing 787 Dreamliner performance data for high-altitude operations.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-amber-400" />
                </div>
                <h4 className="font-bold text-xl text-amber-400">Engineer Tola Girma</h4>
              </div>
              <p className="text-slate-300 mb-4">Aircraft Maintenance, 14 years experience</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Uses mobile KMS at the hangar to troubleshoot hydraulic issues on Boeing 737.
                Accesses expert guidance and SOPs while working on the aircraft.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-amber-400" />
                </div>
                <h4 className="font-bold text-xl text-amber-400">Staff Tewodros Abebe</h4>
              </div>
              <p className="text-slate-300 mb-4">Ground Operations, Bahir Dar Station</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Accesses offline Amharic-language procedures at the regional station where
                internet connectivity is limited. Critical for passenger handling operations.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-amber-400" />
                </div>
                <h4 className="font-bold text-xl text-amber-400">Innovation Committee</h4>
              </div>
              <p className="text-slate-300 mb-4">Cross-departmental improvement team</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Reviews and approves high-impact ideas from staff across all departments.
                Tracks implementation of approved innovations like digital baggage tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-amber-500">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to Access the Knowledge Base?</h2>
          <p className="text-lg text-slate-800 mb-8 max-w-2xl mx-auto">
            Login with your Ethiopian Airlines credentials to explore SOPs, connect with experts,
            and contribute to our organizational knowledge.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white text-lg px-10 py-6">
              Login to Ethiopian Airlines KMS
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
