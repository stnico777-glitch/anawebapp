import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — awake+align",
  description:
    "Terms and conditions for using the awake+align mobile app and website.",
};

const LAST_UPDATED = "April 22, 2026";
const CONTACT_EMAIL = "support@awakealign.app";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-stone-500 hover:text-stone-800">
          ← Back to awake+align
        </Link>
      </nav>
      <h1 className="text-3xl font-semibold text-stone-900 md:text-4xl">
        Terms of Use
      </h1>
      <p className="mt-2 text-sm text-stone-500">Last updated: {LAST_UPDATED}</p>

      <section className="prose prose-stone mt-8 max-w-none text-stone-700 dark:text-stone-300">
        <p>
          Welcome to <strong>awake+align</strong> (the &quot;App&quot; or
          &quot;Service&quot;). These Terms of Use (&quot;Terms&quot;) form a
          legal agreement between you and awake+align governing your access to
          and use of the Service. By creating an account or using the Service,
          you agree to these Terms. If you do not agree, do not use the
          Service.
        </p>

        <h2>1. Eligibility</h2>
        <p>
          You must be at least 13 years old to use the Service. If you are
          under 18, you may only use the Service with the involvement of a
          parent or legal guardian.
        </p>

        <h2>2. Accounts</h2>
        <p>
          You are responsible for the activity on your account and for keeping
          your credentials confidential. Notify us immediately at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> if you
          suspect unauthorized access.
        </p>

        <h2>3. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Violate any law or regulation while using the Service.</li>
          <li>
            Post content that is harassing, hateful, defamatory, sexually
            explicit, exploitative, or otherwise harmful.
          </li>
          <li>
            Impersonate any person, misrepresent your affiliation, or collect
            information about other users.
          </li>
          <li>
            Interfere with, disrupt, or attempt to compromise the security of
            the Service or its infrastructure.
          </li>
          <li>
            Reverse-engineer, decompile, or extract source code, except as
            expressly permitted by law.
          </li>
        </ul>
        <p>
          We reserve the right to remove content and suspend or terminate
          accounts that violate these Terms.
        </p>

        <h2>4. Community content</h2>
        <p>
          Prayer requests, praise reports, comments, journal entries, and any
          other content you submit (&quot;User Content&quot;) remain yours. By
          posting User Content you grant awake+align a worldwide, non-exclusive,
          royalty-free license to host, display, and distribute that content
          solely to operate the Service. Do not post anything you do not have
          the right to share.
        </p>

        <h2>5. Spiritual and health disclaimer</h2>
        <p>
          awake+align provides spiritual encouragement, devotional content, and
          general movement guidance. It is <strong>not</strong> a substitute
          for professional medical, psychological, financial, or legal advice.
          Always consult a qualified professional before beginning any exercise
          program or acting on content in the App, especially if you have a
          medical condition or injury. You assume full responsibility for your
          participation in any physical activity suggested by the Service.
        </p>

        <h2>6. Subscriptions and purchases</h2>
        <p>
          Certain features may be offered on a subscription basis via the Apple
          App Store or other authorized platforms. If you purchase a
          subscription, billing and renewal are handled by the platform you
          purchased from under that platform&apos;s terms. You can manage or
          cancel a subscription at any time from your device&apos;s account
          settings (iOS: Settings &gt; Apple ID &gt; Subscriptions). Refund
          requests are also handled by the relevant platform.
        </p>

        <h2>7. Intellectual property</h2>
        <p>
          The Service, including its code, design, branding, and original
          content (excluding User Content), is owned by awake+align and
          protected by copyright, trademark, and other laws. We grant you a
          limited, revocable, non-transferable license to use the Service for
          personal, non-commercial purposes.
        </p>

        <h2>8. Third-party services</h2>
        <p>
          The Service relies on third-party providers (for example Apple,
          Supabase, Vercel). Your use of those services is governed by their
          own terms. We are not responsible for third-party services.
        </p>

        <h2>9. Termination</h2>
        <p>
          You can stop using the Service at any time. We may suspend or
          terminate your access with or without notice if we believe you have
          violated these Terms or if we need to for legal, security, or
          operational reasons. Sections that by their nature should survive
          termination will survive (including disclaimers, indemnity, and
          limitation of liability).
        </p>

        <h2>10. Disclaimers</h2>
        <p>
          The Service is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis. To the fullest extent permitted by law,
          awake+align disclaims all warranties, express or implied, including
          merchantability, fitness for a particular purpose, and
          non-infringement. We do not warrant that the Service will be
          uninterrupted, error-free, or free of harmful components.
        </p>

        <h2>11. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, awake+align and its
          affiliates will not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or any loss of profits, data, or
          goodwill, arising out of or relating to your use of the Service. Our
          total liability for any claim relating to the Service will not
          exceed the greater of $50 USD or the amount you paid us in the
          twelve months before the claim.
        </p>

        <h2>12. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless awake+align and
          its affiliates from any claims, liabilities, damages, and expenses
          (including reasonable attorneys&apos; fees) arising from your use of
          the Service, your User Content, or your violation of these Terms.
        </p>

        <h2>13. Governing law</h2>
        <p>
          These Terms are governed by the laws of the United States and the
          state in which awake+align is organized, without regard to conflict
          of law principles. Disputes will be resolved in the state or federal
          courts located there, and you consent to personal jurisdiction there.
        </p>

        <h2>14. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will be
          communicated in the App or on this page. Continued use of the
          Service after changes become effective constitutes acceptance of the
          updated Terms.
        </p>

        <h2>15. Contact</h2>
        <p>
          Questions about these Terms? Email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </main>
  );
}
