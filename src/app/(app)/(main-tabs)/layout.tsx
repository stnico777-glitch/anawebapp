import AppTabHeroBand from "@/components/AppTabHeroBand";

export default function MainTabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppTabHeroBand />
      {children}
    </>
  );
}
