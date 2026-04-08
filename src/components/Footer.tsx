import Link from "next/link";

const FOOTER_LINK_CLASS =
  "text-sm text-gray [font-family:var(--font-body),sans-serif] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:rounded-sm";

const FOOTER_HEADING_CLASS =
  "text-xs font-medium uppercase tracking-wider text-gray [font-family:var(--font-headline),sans-serif]";

type FooterProps = {
  /** Let a parent surface (e.g. homepage peach gradient) show through instead of solid white. */
  bleedBackground?: boolean;
};

export default function Footer({ bleedBackground = false }: FooterProps) {
  return (
    <footer
      id="footer"
      className={`border-t border-sand font-[family-name:var(--font-body),sans-serif] ${bleedBackground ? "bg-transparent" : "bg-white"}`}
      role="contentinfo"
    >
      <p className="py-5 text-center text-sm italic text-sky-blue [font-family:var(--font-headline),sans-serif] bg-pastel-blue-light">
        Faith, fitness & routine — Start your 7-day free trial
      </p>
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo + Social */}
          <div>
            <Link
              href="/"
              className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 focus-visible:rounded-sm"
            >
              <span className="block text-xl font-normal lowercase leading-[1.4] tracking-[0.135em] text-gray [font-family:var(--font-headline),sans-serif] [font-synthesis:none] md:text-2xl">
                awake+align
              </span>
              <span className="mt-0.5 block text-xs font-normal lowercase leading-[1.4] tracking-[0.135em] text-gray [font-family:var(--font-headline),sans-serif] [font-synthesis:none]">
                power love sound mind
              </span>
            </Link>
            <div className="mt-4 flex gap-3">
              <a
                href="https://instagram.com/awakeandalign_"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm text-gray transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm text-gray transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
                aria-label="YouTube"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Email capture */}
          <div className="min-w-0">
            <p id="footer-email-label" className={FOOTER_HEADING_CLASS}>
              Join our email list
            </p>
            <form
              className="mt-2 flex w-full min-w-0 flex-nowrap items-stretch gap-0 rounded-sm border border-sky-blue/60 bg-pastel-blue-light p-3"
              action="#"
              aria-labelledby="footer-email-label"
            >
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input
                id="footer-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Enter your email address"
                className="min-w-0 flex-1 rounded-l border border-r-0 border-sand bg-white px-3 py-2 text-sm text-gray placeholder:text-gray/60 [font-family:var(--font-body),sans-serif] focus:outline-none focus:ring-1 focus:ring-sky-blue focus:border-sky-blue"
              />
              <button
                type="submit"
                className="shrink-0 rounded-r border border-sand bg-gray px-4 py-2 text-xs font-medium uppercase tracking-wider text-white [font-family:var(--font-headline),sans-serif] transition hover:bg-gray/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Prayer & praise + app */}
          <nav aria-label="Prayer and praise">
            <p className={FOOTER_HEADING_CLASS}>Prayer & praise</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/journaling" className={FOOTER_LINK_CLASS}>Prayer journal</Link></li>
              <li>
                <Link href="/community" prefetch={false} className={FOOTER_LINK_CLASS}>
                  Community
                </Link>
              </li>
            </ul>
            <p className={`mt-6 ${FOOTER_HEADING_CLASS}`}>Download our app</p>
            <div className="mt-2 flex flex-col gap-2">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded border border-sand bg-white px-3 py-2 text-xs text-gray [font-family:var(--font-body),sans-serif] hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                App Store
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded border border-sand bg-white px-3 py-2 text-xs text-gray [font-family:var(--font-body),sans-serif] hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.634z"/></svg>
                Google Play
              </a>
            </div>
          </nav>

          {/* Support + Legal */}
          <div className="min-w-0">
            <nav aria-label="Support">
              <p className={FOOTER_HEADING_CLASS}>Support</p>
              <ul className="mt-3 space-y-2">
                <li><Link href="/refer" className={FOOTER_LINK_CLASS}>Refer a Friend</Link></li>
                <li><Link href="/contact" className={FOOTER_LINK_CLASS}>Contact Us</Link></li>
              </ul>
            </nav>
            <nav aria-label="Legal" className="mt-8">
              <p className={FOOTER_HEADING_CLASS}>Legal</p>
              <ul className="mt-3 space-y-2">
                <li><Link href="/terms" className={FOOTER_LINK_CLASS}>Terms of Use</Link></li>
                <li><Link href="/privacy" className={FOOTER_LINK_CLASS}>Privacy Policy</Link></li>
                <li><Link href="/faq" className={FOOTER_LINK_CLASS}>FAQ</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="border-t border-sand px-4 py-6 text-center [font-family:var(--font-body),sans-serif]">
        <p className="text-xs text-gray">
          This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
        </p>
        <p className="mt-1 text-xs font-normal lowercase leading-[1.4] tracking-[0.135em] text-gray [font-family:var(--font-headline),sans-serif] [font-synthesis:none]">
          © 2026 awake + align, All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
