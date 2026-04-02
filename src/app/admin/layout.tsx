import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/schedule");

  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/workouts", label: "Workouts" },
    { href: "/admin/prayer", label: "Prayer / Audio" },
    { href: "/admin/schedules", label: "Schedules" },
    { href: "/admin/daily-verse", label: "Daily verses" },
    { href: "/admin/carousel", label: "Carousel" },
  ];

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950">
      <header className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <nav className="flex gap-4">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/schedule"
            className="text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-400"
          >
            ← Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
