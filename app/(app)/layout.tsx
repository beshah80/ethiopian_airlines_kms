import { SiteHeader } from "@/components/site-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-chakra-petch">
      <SiteHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
