/**
 * Small sky-blue loading state for Movement, Audio, and Prayer journal tab navigations (see route `loading.tsx` files).
 */
export default function MovementAudioTabLoading() {
  return (
    <div
      className="flex min-h-[50vh] w-full items-center justify-center bg-app-surface px-4"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="relative h-10 w-10" aria-hidden>
        <span className="absolute inset-0 rounded-full border-2 border-sand" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-sky-blue border-r-sky-blue/40 motion-reduce:animate-none" />
      </div>
    </div>
  );
}
