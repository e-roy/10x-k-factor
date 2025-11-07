import type { Metadata } from "next";
import { LegalToc } from "../_components/LegalToc";
import { LegalSection } from "../_components/LegalSection";
import { UpdatedBadge } from "../_components/UpdatedBadge";
import { BackToTop } from "../_components/BackToTop";

// Placeholder constants - edit these at the top of the file
const ORG = "10x K Factor, LLC";
const CONTACT_EMAIL = "legal@10xkfactor.com";
const POSTAL_ADDR = "123 Product Ave, Suite 100, Austin, TX 78701";
const GOVERNING_LAW = "State of Texas, USA";
const EFFECTIVE_DATE = "November 7, 2025";

// TOC items - static array for scrollspy
const TOC_ITEMS = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "eligibility", title: "Who May Use the Service" },
  { id: "accounts", title: "Accounts and Security" },
  { id: "billing", title: "Subscriptions, Trials, and Billing" },
  { id: "educational", title: "Educational & AI Features" },
  { id: "user-content", title: "User Content and License" },
  { id: "prohibited", title: "Prohibited Conduct" },
  { id: "children-privacy", title: "Children's and Student Privacy" },
  { id: "data-privacy", title: "Data Use and Privacy" },
  { id: "rewards", title: "Rewards, Credits, and Virtual Items" },
  { id: "ip", title: "Intellectual Property" },
  { id: "feedback", title: "Feedback" },
  { id: "third-party", title: "Third-Party Services" },
  { id: "availability", title: "Availability and Changes" },
  { id: "termination", title: "Termination" },
  { id: "disclaimers", title: "Disclaimers" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "indemnification", title: "Indemnification" },
  { id: "governing-law", title: "Governing Law; Dispute Resolution" },
  { id: "export", title: "Export and Sanctions" },
  { id: "entire-agreement", title: "Entire Agreement; Severability; Waiver" },
  { id: "contact", title: "Contact" },
];

export const metadata: Metadata = {
  title: "Terms of Service — 10x K Factor",
  description:
    "Terms of Service for 10x K Factor. Learn about your rights and responsibilities when using our educational platform with AI features, social mechanics, and rewards.",
  openGraph: {
    title: "Terms of Service — 10x K Factor",
    description:
      "Terms of Service for 10x K Factor. Learn about your rights and responsibilities when using our educational platform.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service — 10x K Factor",
    description:
      "Terms of Service for 10x K Factor. Learn about your rights and responsibilities when using our educational platform.",
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <LegalToc items={TOC_ITEMS} />
        <main id="main-content" className="min-w-0">
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-bold">Terms of Service</h1>
            <p className="mb-4 text-lg text-muted-foreground">
              These terms form a contract between you and {ORG}. By accessing or
              using 10x K Factor, you agree to them. If you don&apos;t agree, do
              not use the Service.
            </p>
            <UpdatedBadge date={EFFECTIVE_DATE} />
          </div>

          <LegalSection id="acceptance" title="Acceptance of Terms">
            <p>
              By accessing or using the websites, mobile/web apps, extensions,
              APIs, or services offered by {ORG} (the &quot;Service&quot;), you
              agree to these Terms of Service (&quot;Terms&quot;) and our
              Privacy Policy. If you use the Service on behalf of an
              organization, you represent that you have authority to bind that
              organization to these Terms.
            </p>
          </LegalSection>

          <LegalSection
            id="eligibility"
            title="Who May Use the Service (Eligibility)"
          >
            <p>
              You must be at least 13 years old, or the minimum age required by
              your country, to use the Service. Certain educational features may
              require a parent/guardian or school consent. If you are under 18,
              you must have permission from a parent/guardian or school
              authority, as applicable.
            </p>
          </LegalSection>

          <LegalSection id="accounts" title="Accounts and Security">
            <p>
              You are responsible for your account, credentials, and all
              activity under it. Keep your password secure and notify us
              promptly at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline hover:no-underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              of any suspected misuse. We may require identity or
              parental/administrator verification for specific features.
            </p>
          </LegalSection>

          <LegalSection
            id="billing"
            title="Subscriptions, Trials, and Billing (If Applicable)"
          >
            <p>
              We may offer free tiers, trials, credits, or paid plans. Trials
              convert to paid unless canceled before the trial ends. Fees are
              non-refundable except where required by law. We may change prices
              with reasonable advance notice. Taxes may apply.
            </p>
          </LegalSection>

          <LegalSection id="educational" title="Educational & AI Features">
            <p>
              The Service may include AI-generated guidance, study suggestions,
              practice sets, and social/viral mechanics (e.g., challenges, share
              links, presence, leaderboards, rewards). AI outputs may be
              inaccurate or incomplete. Always verify critical information
              independently. The Service is for educational support only and
              does not replace a qualified teacher, tutor, or advisor.
            </p>
          </LegalSection>

          <LegalSection
            id="user-content"
            title="User Content and License to Us"
          >
            <p>
              You retain ownership of content you submit (e.g., text, images,
              answers, study sets, feedback) (&quot;User Content&quot;). To
              operate and improve the Service, you grant {ORG} a worldwide,
              non-exclusive, royalty-free license to host, process, transmit,
              display, and create non-identifying derivatives of your User
              Content, solely to provide and enhance the Service. You are
              responsible for having the necessary rights to submit User
              Content.
            </p>
          </LegalSection>

          <LegalSection id="prohibited" title="Prohibited Conduct">
            <p>You agree not to:</p>
            <ul>
              <li>Break the law or infringe others&apos; rights.</li>
              <li>
                Upload unlawful, harmful, or deceptive content; attempt to
                de-anonymize minors or other users.
              </li>
              <li>
                Reverse-engineer or abuse rate limits; probe or disrupt the
                Service.
              </li>
              <li>
                Misrepresent your identity or affiliation; engage in spam,
                fraud, or gaming of rewards.
              </li>
              <li>
                Use the Service to build competing datasets or models in
                violation of these Terms.
              </li>
            </ul>
          </LegalSection>

          <LegalSection
            id="children-privacy"
            title="Children's and Student Privacy"
          >
            <p>
              We design child-safe defaults and obtain consent where required.
              School-managed accounts must be established by authorized school
              personnel who are responsible for obtaining any required consents
              and disclosures. Do not share personal data of minors in public
              areas of the Service. See our Privacy Policy for details.
            </p>
          </LegalSection>

          <LegalSection id="data-privacy" title="Data Use and Privacy">
            <p>
              Our Privacy Policy explains what we collect, why, and how we use
              and share information, including logs and analytics related to
              social/viral features (e.g., invites, challenges, presence). By
              using the Service, you consent to these practices.
            </p>
          </LegalSection>

          <LegalSection
            id="rewards"
            title="Rewards, Credits, and Virtual Items"
          >
            <p>
              We may issue time-limited credits, passes, badges, or virtual
              items. These have no cash value, are non-transferable (unless
              explicitly stated), and may expire or be revoked for abuse or
              breach of these Terms.
            </p>
          </LegalSection>

          <LegalSection id="ip" title="Intellectual Property">
            <p>
              The Service, including software, design, logos, and content
              (excluding User Content), is owned by {ORG} or its licensors and
              is protected by law. You receive a limited, non-exclusive,
              non-transferable license to access and use the Service in
              accordance with these Terms.
            </p>
          </LegalSection>

          <LegalSection id="feedback" title="Feedback">
            <p>
              If you provide feedback or suggestions, you grant {ORG} a
              perpetual, royalty-free license to use them without restrictions
              or compensation.
            </p>
          </LegalSection>

          <LegalSection id="third-party" title="Third-Party Services">
            <p>
              The Service may link to or integrate third-party tools (e.g.,
              sign-in, payments, messaging). {ORG} is not responsible for
              third-party services; your use is governed by their terms and
              policies.
            </p>
          </LegalSection>

          <LegalSection id="availability" title="Availability and Changes">
            <p>
              The Service may change, suspend, or discontinue features at any
              time. We may update these Terms; material changes will be
              communicated by reasonable means. Continued use after changes
              constitutes acceptance.
            </p>
          </LegalSection>

          <LegalSection id="termination" title="Termination">
            <p>
              You may stop using the Service at any time. We may suspend or
              terminate access for any violation of these Terms, risk to users,
              legal requirements, or operational reasons. Upon termination,
              rights and obligations that by nature should survive (e.g., IP,
              disclaimers, limitations, governing law) will survive.
            </p>
          </LegalSection>

          <LegalSection id="disclaimers" title="Disclaimers">
            <p className="font-semibold uppercase">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
              AVAILABLE.&quot; {ORG} DISCLAIMS ALL WARRANTIES, EXPRESS OR
              IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT ACCURACY,
              RELIABILITY, OR AVAILABILITY, NOR THAT THE SERVICE WILL BE
              ERROR-FREE OR SECURE.
            </p>
          </LegalSection>

          <LegalSection id="liability" title="Limitation of Liability">
            <p className="font-semibold uppercase">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, {ORG} AND ITS AFFILIATES
              WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF
              PROFITS, REVENUE, DATA, OR GOODWILL, EVEN IF ADVISED OF THE
              POSSIBILITY. OUR AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO
              THE SERVICE WILL NOT EXCEED THE GREATER OF (A) AMOUNTS PAID BY YOU
              TO {ORG} IN THE 12 MONTHS BEFORE THE CLAIM OR (B) USD $100.
            </p>
          </LegalSection>

          <LegalSection id="indemnification" title="Indemnification">
            <p>
              You agree to defend, indemnify, and hold harmless {ORG} and its
              affiliates from any claims, losses, and expenses (including
              attorneys&apos; fees) arising from your use of the Service, your
              User Content, or your violation of these Terms.
            </p>
          </LegalSection>

          <LegalSection
            id="governing-law"
            title="Governing Law; Dispute Resolution"
          >
            <p>
              These Terms are governed by the laws of {GOVERNING_LAW} without
              regard to conflicts of law rules. Venue and jurisdiction will lie
              exclusively in courts located there, unless applicable law
              requires otherwise.
            </p>
          </LegalSection>

          <LegalSection id="export" title="Export and Sanctions">
            <p>
              You represent you are not prohibited by export controls or
              sanctions from using the Service. Do not use the Service in
              violation of such laws.
            </p>
          </LegalSection>

          <LegalSection
            id="entire-agreement"
            title="Entire Agreement; Severability; Waiver"
          >
            <p>
              These Terms constitute the entire agreement between you and {ORG}{" "}
              regarding the Service. If any provision is unenforceable, it will
              be modified to the minimum extent necessary, and the remainder
              will remain in effect. Failure to enforce a provision is not a
              waiver.
            </p>
          </LegalSection>

          <LegalSection id="contact" title="Contact">
            <p>
              Questions about these Terms may be sent to{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline hover:no-underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              or by mail to {POSTAL_ADDR}.
            </p>
            <p className="mt-4">
              <strong>Effective Date:</strong> {EFFECTIVE_DATE}
            </p>
          </LegalSection>

          <BackToTop />

          <footer className="mt-12 border-t pt-8">
            <p className="text-sm text-muted-foreground">
              This page is for general informational purposes and not legal
              advice.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
