import { SectionShell } from "@/components/SectionShell";
import { SITE_EMAIL } from "@/lib/site-emails";

const CONTACT_EMAIL = SITE_EMAIL.privacy;
const INACTIVE_DATA_EXPIRATION_MONTHS = 24;

/**
 * Public privacy policy page so users can understand what data is collected,
 * why it is used, how long it is retained, and how to request deletion.
 */
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white pt-24">
      <SectionShell className="max-w-3xl py-16 md:py-20">
        <h1 className="heading text-3xl font-bold text-[#231F20]">Privacy Policy</h1>
        <p className="mt-3 text-sm text-[#6B6B6B]">Last updated: March 11, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-[#231F20]">
          <section className="space-y-3">
            <h2 className="heading text-xl font-semibold">1. What we collect</h2>
            <p>
              When you use ActivityJournal, we collect account and activity information needed to provide the
              service, including your name, email, connected account identifiers, and workout metadata imported
              through Strava and/or Garmin integrations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="heading text-xl font-semibold">2. How we use data</h2>
            <p>
              We use this data to create and deliver your journal experience, operate your account, provide
              support, prevent abuse, and improve product quality. We do not sell personal data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="heading text-xl font-semibold">3. Strava and Garmin data terms</h2>
            <p>
              If you connect Strava or Garmin, we process only the data required for the features you use and
              handle it in line with applicable API platform requirements and privacy policies. You can revoke
              access from your Strava/Garmin account settings at any time.
            </p>
            <p>
              ActivityJournal is an independent service and is not endorsed by Strava or Garmin. We keep user
              data private, apply reasonable safeguards, and limit use of connected-platform data to user-facing
              product functionality and support.
            </p>
            <p>
              For platform-specific privacy information, see{" "}
              <a href="https://www.strava.com/legal/privacy" className="underline" target="_blank" rel="noreferrer">
                Strava Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://www.garmin.com/en-US/privacy/"
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                Garmin Privacy Policy
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="heading text-xl font-semibold">4. Retention and expiration</h2>
            <p>
              We retain data while your account is active so we can deliver your journals and account history.
              If your account is inactive, we may automatically delete or de-identify personal data after{" "}
              {INACTIVE_DATA_EXPIRATION_MONTHS} months of inactivity, unless we need to keep limited records for
              legal, fraud-prevention, or accounting reasons.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="heading text-xl font-semibold">5. Your rights and deletion requests</h2>
            <p>
              You may request access to, correction of, export of, or deletion of your personal data by emailing{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                {CONTACT_EMAIL}
              </a>
              . We will verify the request and process it within a reasonable timeframe, subject to legal
              obligations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="heading text-xl font-semibold">6. Policy updates</h2>
            <p>
              We may update this policy when our product or legal obligations change. If updates are material, we
              will update the date on this page and provide additional notice where required.
            </p>
          </section>
        </div>
      </SectionShell>
    </main>
  );
}
