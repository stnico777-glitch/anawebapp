/**
 * Blank placeholder while a main-tab route resolves; real content fades in via `template.tsx` + globals.css.
 */
export default function MainTabsLoading() {
  return (
    <div className="min-h-[50vh] w-full bg-app-surface" aria-busy="true" aria-label="Loading" />
  );
}
