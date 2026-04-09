import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8 pt-[calc(3.5rem+2rem)] sm:px-8 md:px-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
