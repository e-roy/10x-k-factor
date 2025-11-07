import type { Metadata } from "next";
import Link from "next/link";
import { LegalToc } from "../_components/LegalToc";
import { LegalSection } from "../_components/LegalSection";
import { UpdatedBadge } from "../_components/UpdatedBadge";
import { BackToTop } from "../_components/BackToTop";
import { Button } from "@/components/ui/button";

// Placeholder constants - edit these at the top of the file
const ORG = "10x K Factor, LLC";
const PRODUCT = "10x K Factor";
const CONTACT_EMAIL = "privacy@10xkfactor.com";
const POSTAL_ADDR = "123 Product Ave, Suite 100, Austin, TX 78701, USA";
const DPO_EMAIL = "dpo@10xkfactor.com";
const _GOVERNING_LAW = "State of Texas, USA";
const EFFECTIVE_DATE = "November 7, 2025";
const SUBPROCESSORS_URL = "https://example.com/subprocessors";
const COOKIE_SETTINGS_URL = "/cookie-settings";
const OPT_OUT_SALE_SHARE_URL = "/privacy-choices";
const EXPORT_DELETE_PORTAL_URL = "/privacy-request";

// TOC items - static array for scrollspy
const TOC_ITEMS = [
  { id: "who-we-are", title: "Who We Are" },
  { id: "what-we-collect", title: "What We Collect" },
  { id: "how-we-use", title: "How We Use Data" },
  { id: "legal-bases", title: "Legal Bases" },
  { id: "ai-features", title: "AI Features & Your Data" },
  { id: "social-viral", title: "Social/Viral Mechanics" },
  { id: "cookies", title: "Cookies & Similar Technologies" },
  { id: "selling-sharing", title: '"Selling" or "Sharing"' },
  { id: "data-sharing", title: "Data Sharing" },
  { id: "children-students", title: "Children & Students" },
  { id: "privacy-rights", title: "Your Privacy Choices & Rights" },
  { id: "data-retention", title: "Data Retention" },
  { id: "security", title: "Security" },
  { id: "international-transfers", title: "International Transfers" },
  { id: "third-party", title: "Third-Party Services" },
  { id: "do-not-track", title: "Do Not Track & Global Privacy Control" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact Us" },
];

export const metadata: Metadata = {
  title: "Privacy Policy — 10x K Factor",
  description:
    "Privacy Policy for 10x K Factor. Learn how we collect, use, and protect your data, including information about AI features, social mechanics, and your privacy rights.",
  openGraph: {
    title: "Privacy Policy — 10x K Factor",
    description:
      "Privacy Policy for 10x K Factor. Learn how we collect, use, and protect your data.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy — 10x K Factor",
    description:
      "Privacy Policy for 10x K Factor. Learn how we collect, use, and protect your data.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <LegalToc items={TOC_ITEMS} />
        <main id="main-content" className="min-w-0">
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
            <p className="mb-4 text-lg text-muted-foreground">
              We collect the minimum data needed to run {PRODUCT}, improve
              learning features (including AI), keep accounts secure, and enable
              social/viral mechanics (presence, invites, leaderboards, rewards).
              We don&apos;t sell personal information. You control your data and can
              access, export, or delete it subject to applicable law.
            </p>
            <UpdatedBadge date={EFFECTIVE_DATE} />
          </div>

          <div className="mb-8 flex flex-wrap gap-4">
            <Button asChild variant="outline">
              <Link href={COOKIE_SETTINGS_URL}>Cookie Settings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={OPT_OUT_SALE_SHARE_URL}>Do Not Sell/Share</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={EXPORT_DELETE_PORTAL_URL}>Data Requests</Link>
            </Button>
          </div>

          <LegalSection id="who-we-are" title="Who We Are">
            <p>
              {PRODUCT} is provided by {ORG} (&quot;we,&quot; &quot;us&quot;). Contact:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline hover:no-underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              or mail {POSTAL_ADDR}. If a Data Protection Officer (DPO) is
              required, email{" "}
              <a
                href={`mailto:${DPO_EMAIL}`}
                className="text-primary underline hover:no-underline"
              >
                {DPO_EMAIL}
              </a>
              .
            </p>
          </LegalSection>

          <LegalSection id="what-we-collect" title="What We Collect">
            <p>We collect information in three ways:</p>
            <ul>
              <li>
                <strong>You provide:</strong> account info (name, email,
                role/relationship: student/parent/tutor), authentication
                identifiers, profile, messages, study artifacts (prompts,
                answers, uploads), feedback, and settings.
              </li>
              <li>
                <strong>Automatically:</strong> device + app diagnostics (IP,
                device/OS, browser, app version), event logs (sign-in/out,
                clicks, session timing), presence pings, feature usage, referral
                codes, invite flows, coarse location (from IP), cookies/local
                storage identifiers.
              </li>
              <li>
                <strong>From others:</strong> school/organization admins,
                invited users (if they share your email), single sign-on
                providers, and lawful data enrichment (e.g., deliverability
                checks).
              </li>
            </ul>
            <p className="mt-4">
              <strong>Sensitive data:</strong> We do not intentionally collect
              sensitive categories. Do not submit sensitive data unless
              requested and protected by an agreement (e.g., school contract).
            </p>
          </LegalSection>

          <LegalSection id="how-we-use" title="How We Use Data (Purposes)">
            <ul>
              <li>
                Provide, maintain, and secure the Service (auth, sessions,
                fraud/abuse prevention).
              </li>
              <li>
                Enable learning + AI features (Socratic hints, feedback,
                diagnostics).
              </li>
              <li>
                Power social/viral mechanics (presence, activity feed, invites,
                leaderboards, rewards).
              </li>
              <li>
                Measure performance and improve the product (analytics,
                experiments/A-B tests).
              </li>
              <li>
                Communicate with you (service emails, feature updates, critical
                notices).
              </li>
              <li>Comply with law and enforce terms.</li>
            </ul>
          </LegalSection>

          <LegalSection id="legal-bases" title="Legal Bases (EEA/UK/CH)">
            <ul>
              <li>
                <strong>Contract:</strong> to provide the Service you request.
              </li>
              <li>
                <strong>Legitimate interests:</strong> product improvement,
                security/anti-abuse, analytics with privacy safeguards.
              </li>
              <li>
                <strong>Consent:</strong> certain cookies/marketing;
                parental/school consent where required.
              </li>
              <li>
                <strong>Legal obligation:</strong> record-keeping, compliance.
              </li>
            </ul>
          </LegalSection>

          <LegalSection id="ai-features" title="AI Features & Your Data">
            <p>AI outputs may be inaccurate—verify important information.</p>
            <p className="mt-4">
              <strong>Training:</strong> By default, we do <strong>not</strong>{" "}
              use customer content to train foundation models. We may use{" "}
              <strong>aggregated or de-identified</strong> telemetry to improve
              features. Where optional fine-tuning on your data is available,
              we&apos;ll present a clear <strong>opt-in</strong> control.
            </p>
            <p className="mt-4">
              <strong>Third-party AI:</strong> If we use third-party models or
              APIs, we minimize data sent and apply confidentiality controls
              under data processing agreements.
            </p>
          </LegalSection>

          <LegalSection id="social-viral" title="Social/Viral Mechanics">
            <p>
              We process presence, invites, referrals, leaderboards, and rewards
              to operate these features and prevent abuse. Public displays (like
              leaderboards) use minimal identifiers and can be controlled by
              settings where available.
            </p>
          </LegalSection>

          <LegalSection id="cookies" title="Cookies & Similar Technologies">
            <p>
              Used for core functionality (session), preferences, analytics, and
              limited marketing attribution. Manage choices at{" "}
              <Link
                href={COOKIE_SETTINGS_URL}
                className="text-primary underline hover:no-underline"
              >
                {COOKIE_SETTINGS_URL}
              </Link>
              . Some features rely on cookies and may not function if disabled.
              We honor <strong>Do Not Track</strong> only where required by law;
              see settings for granular controls.
            </p>
          </LegalSection>

          <LegalSection
            id="selling-sharing"
            title={'"Selling" or "Sharing" (US State Laws)'}
          >
            <p>
              We do <strong>not</strong> sell personal information for money.
              Certain analytics/advertising disclosures could be considered
              &quot;sharing&quot; under CPRA. You can opt out at{" "}
              <Link
                href={OPT_OUT_SALE_SHARE_URL}
                className="text-primary underline hover:no-underline"
              >
                {OPT_OUT_SALE_SHARE_URL}
              </Link>
              .
            </p>
          </LegalSection>

          <LegalSection id="data-sharing" title="Data Sharing">
            <p>We share personal info with:</p>
            <ul>
              <li>
                <strong>Service providers/processors</strong> (hosting, storage,
                email, analytics, payments, abuse prevention) bound by contract
                to protect data. Current list:{" "}
                <a
                  href={SUBPROCESSORS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  {SUBPROCESSORS_URL}
                </a>
                .
              </li>
              <li>
                <strong>School/organization admins</strong> for managed
                accounts.
              </li>
              <li>
                <strong>Legal/safety:</strong> to comply with law, respond to
                lawful requests, or protect users and our Service.
              </li>
              <li>
                <strong>Business transfers:</strong> in a merger/acquisition;
                we&apos;ll provide notice and choices as required.
              </li>
            </ul>
            <p className="mt-4">
              We do not disclose student personal information for targeted
              advertising or build profiles unrelated to education purposes.
            </p>
          </LegalSection>

          <LegalSection id="children-students" title="Children & Students">
            <p>
              <strong>Minimum age:</strong> 13 (or local equivalent). For users
              under 18, a parent/guardian or school authorization may be
              required.
            </p>
            <p className="mt-4">
              <strong>School accounts:</strong> Schools act as controllers for
              student data they provide. We act as a processor under a data
              processing agreement (DPA), limit use to educational purposes, and
              enable administrator controls.
            </p>
            <p className="mt-4">
              Parents/guardians can request access or deletion via{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline hover:no-underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              or{" "}
              <Link
                href={EXPORT_DELETE_PORTAL_URL}
                className="text-primary underline hover:no-underline"
              >
                {EXPORT_DELETE_PORTAL_URL}
              </Link>{" "}
              (subject to school approval where applicable).
            </p>
          </LegalSection>

          <LegalSection
            id="privacy-rights"
            title="Your Privacy Choices & Rights"
          >
            <p>
              Depending on your location (e.g., EEA/UK/CH, California, Virginia,
              Colorado, Connecticut, Utah), you may have rights to:
            </p>
            <ul>
              <li>Access/know, correct, delete, and port your data.</li>
              <li>
                Opt out of targeted advertising/&quot;sharing&quot; and certain profiling.
              </li>
              <li>Object or restrict certain processing; withdraw consent.</li>
              <li>Appeal a decision (US state laws).</li>
            </ul>
            <p className="mt-4">
              Use{" "}
              <Link
                href={EXPORT_DELETE_PORTAL_URL}
                className="text-primary underline hover:no-underline"
              >
                {EXPORT_DELETE_PORTAL_URL}
              </Link>{" "}
              or email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline hover:no-underline"
              >
                {CONTACT_EMAIL}
              </a>
              . We will verify your request, including authorized agents as
              required by law. Non-discrimination: we will not deny services for
              exercising rights, though some features may not work without
              certain data.
            </p>
          </LegalSection>

          <LegalSection id="data-retention" title="Data Retention">
            <p>
              We keep data only as long as needed for the purposes above, then
              delete or de-identify. Typical periods: account data (life of
              account + 90 days), logs (90–180 days), experiments (≤ 180 days),
              backups (rolling ≤ 35 days), legal/compliance (as required). You
              can request deletion at any time (subject to exemptions).
            </p>
          </LegalSection>

          <LegalSection id="security" title="Security">
            <p>
              We use industry-standard safeguards (encryption in transit/at rest
              where applicable, least-privilege access, secret rotation,
              monitoring). No method is 100% secure; promptly notify{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline hover:no-underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              if you suspect an issue.
            </p>
          </LegalSection>

          <LegalSection
            id="international-transfers"
            title="International Transfers"
          >
            <p>
              We may process data in the US and other countries. Where required,
              we use appropriate safeguards (e.g., SCCs, UK IDTA/Addendum) and
              technical measures to protect data.
            </p>
          </LegalSection>

          <LegalSection id="third-party" title="Third-Party Services">
            <p>
              Links/integrations are governed by their own policies. Review
              those policies; we&apos;re not responsible for third-party practices.
            </p>
          </LegalSection>

          <LegalSection
            id="do-not-track"
            title="Do Not Track & Global Privacy Control"
          >
            <p>
              We respond to GPC/required signals where applicable and continue
              improving support. Manage additional preferences at{" "}
              <Link
                href={COOKIE_SETTINGS_URL}
                className="text-primary underline hover:no-underline"
              >
                {COOKIE_SETTINGS_URL}
              </Link>
              .
            </p>
          </LegalSection>

          <LegalSection id="changes" title="Changes to This Policy">
            <p>
              We may update this policy. Material changes will be announced by
              reasonable means (e.g., email or in-app). Continued use after the
              effective date means you accept the updated policy.
            </p>
          </LegalSection>

          <LegalSection id="contact" title="Contact Us">
            <p>
              Questions or requests:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline hover:no-underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              or mail {POSTAL_ADDR}. If you are in the EEA/UK/CH and believe
              your rights were not addressed, you may contact your local
              supervisory authority.
            </p>
            <p className="mt-4">
              <strong>Effective Date:</strong> {EFFECTIVE_DATE}
            </p>
          </LegalSection>

          <BackToTop />

          <footer className="mt-12 border-t pt-8">
            <p className="text-sm text-muted-foreground">
              This policy is for general informational purposes and may vary
              based on your location.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
