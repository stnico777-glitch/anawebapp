import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import SiteHeader from "@/components/SiteHeader";
import AppTabHeroBand from "@/components/AppTabHeroBand";
import AdminCmsNav from "@/components/AdminCmsNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/schedule");

  return (
    <div className="min-h-screen bg-app-surface">
      <SiteHeader variant="app" />
      <AppTabHeroBand />
      <AdminCmsNav />
      <main className="relative z-10 w-full max-w-none overflow-x-hidden pb-10 pt-0 md:pb-12">
        <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-10 [font-family:var(--font-body),sans-serif]">
          {children}
        </div>
      </main>
    </div>
  );
}
