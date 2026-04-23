import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — awake+align",
  description:
    "How awake+align collects, uses, and protects your information in the mobile app and on the web.",
};

const LAST_UPDATED = "April 22, 2026";
const CONTACT_EMAIL = "support@awakealign.app";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-stone-500 hover:text-stone-800">
          ← Back to awake+align
        </Link>
      </nav>
      <h1 className="text-3xl font-semibold text-stone-900 md:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-stone-500">Last updated: {LAST_UPDATED}</p>

      <section className="prose prose-stone mt-8 max-w-none text-stone-700 dark:text-stone-300">
        <p>
          This Privacy Policy describes how <strong>awake+align</strong> (the
          &quot;App&quot; or &quot;Service&quot;), provided through this website
          and the Awake &amp; Align iOS and Android applications, collects,
          uses, and shares information about you. By using the Service, you
          agree to the practices described here.
        </p>

        <h2>1. Information we collect</h2>
        <p>We collect only what&apos;s needed to run the Service:</p>
        <ul>
          <li>
            <strong>Account information.</strong> When you sign up, we collect
            your email address and a securely hashed password via our
            authentication provider (Supabase).
          </li>
          <li>
            <strong>Content you create.</strong> Prayer journal entries, prayer
            requests, praise reports, and any images you attach are stored so
            you can access them across devices.
          </li>
          <li>
            <strong>App usage state.</strong> Onboarding answers (faith journey,
            movement preferences, session length), schedule/workout completion
            flags, and daily streaks so the app can personalize your plan.
          </li>
          <li>
            <strong>Device information.</strong> Basic device metadata (OS,
            app version, device model) and crash diagnostics strictly needed to
            keep the app reliable.
          </li>
        </ul>
        <p>
          We do <strong>not</strong> collect your precise location, contacts,
          calendar, health data, or advertising identifiers. The App does not
          include third-party advertising SDKs or cross-app tracking.
        </p>

        <h2>2. How we use information</h2>
        <ul>
          <li>Provide, operate, and improve the Service.</li>
          <li>Authenticate you and keep your account secure.</li>
          <li>Sync your journal entries, community posts, and schedule
          progress across devices.</li>
          <li>Send service-related communications (e.g. password resets).</li>
          <li>Diagnose and fix crashes and bugs.</li>
        </ul>

        <h2>3. Sharing</h2>
        <p>
          We do not sell your personal information. We share information only
          with service providers that help us run the Service:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — authentication, database, and file
            storage.
          </li>
          <li>
            <strong>Vercel</strong> — website and API hosting.
          </li>
        </ul>
        <p>
          These providers process data on our behalf under their own security
          and privacy commitments. We may disclose information if required by
          law or to protect the rights, property, or safety of awake+align, our
          users, or others.
        </p>

        <h2>4. Community content</h2>
        <p>
          Prayer requests and praise reports you post to the community feed are
          visible to other members of the Service. Please do not share anything
          you would not want others to see. You can delete your own posts at
          any time; once deleted, posts are removed from the feed and
          permanently purged from our database within 30 days.
        </p>

        <h2>5. Photos</h2>
        <p>
          If you attach a photo to a journal entry, the App requests access to
          your photo library solely to import the image you pick. We do not
          read, upload, or retain any photos you do not explicitly choose.
        </p>

        <h2>6. Children</h2>
        <p>
          The Service is not directed to children under 13, and we do not
          knowingly collect personal information from children under 13. If
          you believe a child has provided us information, contact us at the
          email below and we will delete it.
        </p>

        <h2>7. Your choices and rights</h2>
        <ul>
          <li>
            <strong>Access / edit / delete.</strong> You can view and edit most
            of your data directly in the App. To delete your account and all
            associated data, email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </li>
          <li>
            <strong>Notifications.</strong> You can turn push notifications on
            or off in your device Settings &gt; Notifications &gt; Awake &amp;
            Align.
          </li>
          <li>
            <strong>Regional rights.</strong> Depending on where you live
            (e.g. EEA, UK, California), you may have additional rights such as
            access, correction, deletion, portability, or objection. Contact us
            to exercise any of these.
          </li>
        </ul>

        <h2>8. Data retention</h2>
        <p>
          We retain your information for as long as your account is active.
          When you delete your account, we remove your personal content from
          our active systems within 30 days, except where retention is required
          by law.
        </p>

        <h2>9. Security</h2>
        <p>
          We use industry-standard safeguards — encryption in transit (HTTPS),
          authenticated database access, and audited third-party infrastructure
          — to protect your information. No method of transmission or storage
          is 100% secure, so we cannot guarantee absolute security.
        </p>

        <h2>10. International transfers</h2>
        <p>
          Our hosting providers may process data in the United States and other
          countries. By using the Service, you consent to transfer of your
          information to those jurisdictions.
        </p>

        <h2>11. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the
          updated version at this URL and revise the &quot;Last updated&quot;
          date at the top.
        </p>

        <h2>12. Contact us</h2>
        <p>
          Questions, requests, or concerns? Email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </main>
  );
}
