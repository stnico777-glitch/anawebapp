export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md space-y-8 rounded-sm bg-white p-8 shadow-md ring-1 ring-sand">
      <div className="text-center">
        <h1 className="text-2xl font-medium tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
          Forgot password
        </h1>
        <p className="mt-2 text-sm text-gray">
          Password reset flow coming soon. Contact support for assistance.
        </p>
        <a
          href="/login"
          className="mt-6 inline-block text-sky-blue hover:text-sky-blue/80"
        >
          ← Back to sign in
        </a>
      </div>
    </div>
  );
}
