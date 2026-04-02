import SiteHeader from "@/components/SiteHeader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-app-surface">
      <SiteHeader variant="app" />
      <main className="w-full max-w-none overflow-x-hidden pb-10 pt-5 md:pb-12 md:pt-6">
        {children}
      </main>
    </div>
  );
}
