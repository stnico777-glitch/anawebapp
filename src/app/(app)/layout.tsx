import SiteHeader from "@/components/SiteHeader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader variant="app" />
      <main className="w-full max-w-none flex-1 overflow-x-hidden bg-background pb-10 pt-14 md:pb-12">
        {children}
      </main>
    </div>
  );
}
