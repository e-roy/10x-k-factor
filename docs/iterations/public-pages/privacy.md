Create a complete **Privacy Policy** page for the product **10x K Factor**.

## Goals

- Ship a responsive, accessible **Privacy Policy** with a floating in-page table of contents, deep links, and SEO metadata.
- Reuse the legal components pattern (each section as its own component) to keep code manageable.
- Copy should be plain-English, privacy-forward, and tailored to an educational/AI product with social/viral features (presence, invites, share cards, leaderboards, rewards) and minors considerations.

## Files to create/update

- `app/(legal)/privacy/page.tsx` — main page (server component).
- Reuse (create if missing):
  - `app/(legal)/layout.tsx`
  - `app/(legal)/_components/LegalToc.tsx`
  - `app/(legal)/_components/LegalSection.tsx`
  - `app/(legal)/_components/UpdatedBadge.tsx`

> Keep each file under 350 LoC. No `any`. Strong typing. Semantic HTML. Accessible landmarks.

## Page requirements

- Path: `/privacy`
- `export const metadata`:
  - `title: "Privacy Policy — 10x K Factor"`
  - Description summarizing coverage (collection, use, sharing, rights).
  - OpenGraph + Twitter meta (title/description).
- Top hero: page title, short subhead, `UpdatedBadge` (pull date from a single constant).
- Left (or sticky on desktop) TOC with hash links; collapses to Drawer/Sheet on mobile.
- Headings have deep-link anchors shown on hover.
- Respect `prefers-reduced-motion` for smooth scroll.
- Footer note: “This policy is for general informational purposes and may vary based on your location.”

## Constants (define at top of `page.tsx`)

```

const ORG = "10x K Factor, LLC";
const PRODUCT = "10x K Factor";
const CONTACT_EMAIL = "[privacy@10xkfactor.com](mailto:privacy@10xkfactor.com)";
const POSTAL_ADDR = "123 Product Ave, Suite 100, Austin, TX 78701, USA";
const DPO_EMAIL = "[dpo@10xkfactor.com](mailto:dpo@10xkfactor.com)"; // if applicable
const GOVERNING_LAW = "State of Texas, USA";
const EFFECTIVE_DATE = "November 7, 2025";
const SUBPROCESSORS_URL = "[https://example.com/subprocessors](https://example.com/subprocessors)";
const COOKIE_SETTINGS_URL = "/cookie-settings";
const OPT_OUT_SALE_SHARE_URL = "/privacy-choices"; // for CPRA “Do Not Sell/Share”
const EXPORT_DELETE_PORTAL_URL = "/privacy-request"; // DSAR portal

```

## Copy (use verbatim, but render placeholders)

### PRIVACY POLICY — {{PRODUCT}}

**Short Summary:** We collect the minimum data needed to run {{PRODUCT}}, improve learning features (including AI), keep accounts secure, and enable social/viral mechanics (presence, invites, leaderboards, rewards). We don’t sell personal information. You control your data and can access, export, or delete it subject to applicable law.

1. **Who We Are**  
   {{PRODUCT}} is provided by {{ORG}} (“we,” “us”). Contact: {{CONTACT_EMAIL}} or mail {{POSTAL_ADDR}}. If a Data Protection Officer (DPO) is required, email {{DPO_EMAIL}}.

2. **What We Collect**  
   We collect information in three ways:

- **You provide:** account info (name, email, role/relationship: student/parent/tutor), authentication identifiers, profile, messages, study artifacts (prompts, answers, uploads), feedback, and settings.
- **Automatically:** device + app diagnostics (IP, device/OS, browser, app version), event logs (sign-in/out, clicks, session timing), presence pings, feature usage, referral codes, invite flows, coarse location (from IP), cookies/local storage identifiers.
- **From others:** school/organization admins, invited users (if they share your email), single sign-on providers, and lawful data enrichment (e.g., deliverability checks).

**Sensitive data:** We do not intentionally collect sensitive categories. Do not submit sensitive data unless requested and protected by an agreement (e.g., school contract).

3. **How We Use Data (Purposes)**

- Provide, maintain, and secure the Service (auth, sessions, fraud/abuse prevention).
- Enable learning + AI features (Socratic hints, feedback, diagnostics).
- Power social/viral mechanics (presence, activity feed, invites, leaderboards, rewards).
- Measure performance and improve the product (analytics, experiments/A-B tests).
- Communicate with you (service emails, feature updates, critical notices).
- Comply with law and enforce terms.

4. **Legal Bases (EEA/UK/CH)**

- **Contract:** to provide the Service you request.
- **Legitimate interests:** product improvement, security/anti-abuse, analytics with privacy safeguards.
- **Consent:** certain cookies/marketing; parental/school consent where required.
- **Legal obligation:** record-keeping, compliance.

5. **AI Features & Your Data**

- AI outputs may be inaccurate—verify important information.
- **Training:** By default, we do **not** use customer content to train foundation models. We may use **aggregated or de-identified** telemetry to improve features. Where optional fine-tuning on your data is available, we’ll present a clear **opt-in** control.
- **Third-party AI:** If we use third-party models or APIs, we minimize data sent and apply confidentiality controls under data processing agreements.

6. **Social/Viral Mechanics**

- We process presence, invites, referrals, leaderboards, and rewards to operate these features and prevent abuse. Public displays (like leaderboards) use minimal identifiers and can be controlled by settings where available.

7. **Cookies & Similar Technologies**

- Used for core functionality (session), preferences, analytics, and limited marketing attribution. Manage choices at **{{COOKIE_SETTINGS_URL}}**. Some features rely on cookies and may not function if disabled. We honor **Do Not Track** only where required by law; see settings for granular controls.

8. **“Selling” or “Sharing” (US State Laws)**  
   We do **not** sell personal information for money. Certain analytics/advertising disclosures could be considered “sharing” under CPRA. You can opt out at **{{OPT_OUT_SALE_SHARE_URL}}**.

9. **Data Sharing**  
   We share personal info with:

- **Service providers/processors** (hosting, storage, email, analytics, payments, abuse prevention) bound by contract to protect data. Current list: **{{SUBPROCESSORS_URL}}**.
- **School/organization admins** for managed accounts.
- **Legal/safety**: to comply with law, respond to lawful requests, or protect users and our Service.
- **Business transfers**: in a merger/acquisition; we’ll provide notice and choices as required.

We do not disclose student personal information for targeted advertising or build profiles unrelated to education purposes.

10. **Children & Students**

- **Minimum age:** 13 (or local equivalent). For users under 18, a parent/guardian or school authorization may be required.
- **School accounts:** Schools act as controllers for student data they provide. We act as a processor under a data processing agreement (DPA), limit use to educational purposes, and enable administrator controls.
- Parents/guardians can request access or deletion via {{CONTACT_EMAIL}} or **{{EXPORT_DELETE_PORTAL_URL}}** (subject to school approval where applicable).

11. **Your Privacy Choices & Rights**  
    Depending on your location (e.g., EEA/UK/CH, California, Virginia, Colorado, Connecticut, Utah), you may have rights to:

- Access/know, correct, delete, and port your data.
- Opt out of targeted advertising/“sharing” and certain profiling.
- Object or restrict certain processing; withdraw consent.
- Appeal a decision (US state laws).

Use **{{EXPORT_DELETE_PORTAL_URL}}** or email {{CONTACT_EMAIL}}. We will verify your request, including authorized agents as required by law. Non-discrimination: we will not deny services for exercising rights, though some features may not work without certain data.

12. **Data Retention**  
    We keep data only as long as needed for the purposes above, then delete or de-identify. Typical periods: account data (life of account + 90 days), logs (90–180 days), experiments (≤ 180 days), backups (rolling ≤ 35 days), legal/compliance (as required). You can request deletion at any time (subject to exemptions).

13. **Security**  
    We use industry-standard safeguards (encryption in transit/at rest where applicable, least-privilege access, secret rotation, monitoring). No method is 100% secure; promptly notify {{CONTACT_EMAIL}} if you suspect an issue.

14. **International Transfers**  
    We may process data in the US and other countries. Where required, we use appropriate safeguards (e.g., SCCs, UK IDTA/Addendum) and technical measures to protect data.

15. **Third-Party Services**  
    Links/integrations are governed by their own policies. Review those policies; we’re not responsible for third-party practices.

16. **Do Not Track & Global Privacy Control**  
    We respond to GPC/required signals where applicable and continue improving support. Manage additional preferences at **{{COOKIE_SETTINGS_URL}}**.

17. **Changes to This Policy**  
    We may update this policy. Material changes will be announced by reasonable means (e.g., email or in-app). Continued use after the effective date means you accept the updated policy.

18. **Contact Us**  
    Questions or requests: {{CONTACT_EMAIL}} or mail {{POSTAL_ADDR}}. If you are in the EEA/UK/CH and believe your rights were not addressed, you may contact your local supervisory authority.

**Effective Date:** {{EFFECTIVE_DATE}}

### END OF COPY

## Implementation details

- Use the same `<LegalSection id title>` wrapper approach as Terms.
- TOC is generated from a typed array of sections; no DOM queries.
- Add a compact “Back to top” button after major sections.
- Provide a `CookieSettings` CTA linking to **{{COOKIE_SETTINGS_URL}}** and privacy choices/DSAR portal buttons linking to **{{OPT_OUT_SALE_SHARE_URL}}** and **{{EXPORT_DELETE_PORTAL_URL}}**.

## Accessibility

- Landmarks: `header`, `nav[aria-label="In-page navigation"]`, `main`, `footer`.
- Skip link at top; visible focus; keyboard navigable Drawer for mobile TOC.
- Heading order: `h1` then `h2` for sections, optional `h3` for subsections.

## Acceptance criteria

- Visiting `/privacy` renders the full policy with hero header, Updated badge, sticky TOC on desktop, drawer TOC on mobile.
- Hash links scroll/focus correctly and persist in the URL.
- Lighthouse Accessibility ≥ 95; Best Practices ≥ 95 on this page.
- No `any`. No file > 350 LoC.
- All placeholders defined once at top and reused consistently.
- Buttons to **Cookie Settings**, **Do Not Sell/Share**, and **Data Requests** are visible and functional (link to provided routes).
- If school mode is enabled in the app, policy text still reads correctly (no broken references).

Now implement all the above.
