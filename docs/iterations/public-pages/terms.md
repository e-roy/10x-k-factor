Create a complete **Terms of Service** page for the product **10x K Factor**.

## Goals

- Ship a responsive, accessible **Terms of Service** page with a floating in-page table of contents, deep links, and SEO metadata.
- Use clean, modular components; each section is its own component to keep code manageable.
- Include high-quality, plain-English legal copy tailored to an educational/AI product with social/viral features, rewards, presence signals, and minors’ privacy considerations.
- No new deps beyond our stack.

## Files to create/update

- `app/(legal)/terms/page.tsx` — main page (server component).
- `app/(legal)/layout.tsx` — lightweight layout used by legal pages only (if not present).
- `app/(legal)/_components/LegalToc.tsx` — floating in-page TOC with scrollspy + hash links.
- `app/(legal)/_components/LegalSection.tsx` — small wrapper for consistent headings/ids.
- `app/(legal)/_components/UpdatedBadge.tsx` — tiny badge showing “Last updated”.
- `app/(legal)/robots.ts` and `app/(legal)/sitemap.ts` are NOT needed; the site-wide ones will cover this route.

> Keep each file under 350 LoC. No `any`. Strong typing. Accessible landmarks. Semantic HTML.

## Page requirements

- Path: `/terms`
- `export const metadata` with:
  - `title: "Terms of Service — 10x K Factor"`
  - Description summarizing coverage.
  - OpenGraph + Twitter meta (title/description, no image needed).
- Top hero: page title, short subhead, `UpdatedBadge` (pull date from a single constant).
- Left (or sticky on desktop) **TOC** with section anchors.
- Main content composed of section components, each with an `id` and `h2`.
- Footer note: “This page is for general informational purposes and not legal advice.”

## Styling / UX

- Respect system theme; light by default.
- Max-width prose (`prose` styles), generous spacing, focus-visible rings, skip-to-content link.
- Hash deep-links on headings (chain link icon shown on hover).
- Smooth scrolling (prefers-reduced-motion respected).
- Mobile: TOC collapses into a `Sheet`/`Drawer` (shadcn).

## Copy (use verbatim but keep placeholders)

Use the copy below as the content for the sections. Insert the following placeholders that can be quickly edited at the top of `page.tsx`:

```

const ORG = "10x K Factor, LLC";
const CONTACT_EMAIL = "[legal@10xkfactor.com](mailto:legal@10xkfactor.com)";
const POSTAL_ADDR = "123 Product Ave, Suite 100, Austin, TX 78701";
const GOVERNING_LAW = "State of Texas, USA";
const EFFECTIVE_DATE = "November 7, 2025";

```

### TERMS OF SERVICE — 10x K Factor

**Short Summary (not a substitute for the terms):** These terms form a contract between you and {{ORG}}. By accessing or using 10x K Factor, you agree to them. If you don’t agree, do not use the Service.

1. **Acceptance of Terms**
   By accessing or using the websites, mobile/web apps, extensions, APIs, or services offered by {{ORG}} (the “Service”), you agree to these Terms of Service (“Terms”) and our Privacy Policy. If you use the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.

2. **Who May Use the Service (Eligibility)**
   You must be at least 13 years old, or the minimum age required by your country, to use the Service. Certain educational features may require a parent/guardian or school consent. If you are under 18, you must have permission from a parent/guardian or school authority, as applicable.

3. **Accounts and Security**
   You are responsible for your account, credentials, and all activity under it. Keep your password secure and notify us promptly at {{CONTACT_EMAIL}} of any suspected misuse. We may require identity or parental/administrator verification for specific features.

4. **Subscriptions, Trials, and Billing (If Applicable)**
   We may offer free tiers, trials, credits, or paid plans. Trials convert to paid unless canceled before the trial ends. Fees are non-refundable except where required by law. We may change prices with reasonable advance notice. Taxes may apply.

5. **Educational & AI Features**
   The Service may include AI-generated guidance, study suggestions, practice sets, and social/viral mechanics (e.g., challenges, share links, presence, leaderboards, rewards). AI outputs may be inaccurate or incomplete. Always verify critical information independently. The Service is for educational support only and does not replace a qualified teacher, tutor, or advisor.

6. **User Content and License to Us**
   You retain ownership of content you submit (e.g., text, images, answers, study sets, feedback) (“User Content”). To operate and improve the Service, you grant {{ORG}} a worldwide, non-exclusive, royalty-free license to host, process, transmit, display, and create non-identifying derivatives of your User Content, solely to provide and enhance the Service. You are responsible for having the necessary rights to submit User Content.

7. **Prohibited Conduct**
   You agree not to:
   - Break the law or infringe others’ rights.
   - Upload unlawful, harmful, or deceptive content; attempt to de-anonymize minors or other users.
   - Reverse-engineer or abuse rate limits; probe or disrupt the Service.
   - Misrepresent your identity or affiliation; engage in spam, fraud, or gaming of rewards.
   - Use the Service to build competing datasets or models in violation of these Terms.

8. **Children’s and Student Privacy**
   We design child-safe defaults and obtain consent where required. School-managed accounts must be established by authorized school personnel who are responsible for obtaining any required consents and disclosures. Do not share personal data of minors in public areas of the Service. See our Privacy Policy for details.

9. **Data Use and Privacy**
   Our Privacy Policy explains what we collect, why, and how we use and share information, including logs and analytics related to social/viral features (e.g., invites, challenges, presence). By using the Service, you consent to these practices.

10. **Rewards, Credits, and Virtual Items**
    We may issue time-limited credits, passes, badges, or virtual items. These have no cash value, are non-transferable (unless explicitly stated), and may expire or be revoked for abuse or breach of these Terms.

11. **Intellectual Property**
    The Service, including software, design, logos, and content (excluding User Content), is owned by {{ORG}} or its licensors and is protected by law. You receive a limited, non-exclusive, non-transferable license to access and use the Service in accordance with these Terms.

12. **Feedback**
    If you provide feedback or suggestions, you grant {{ORG}} a perpetual, royalty-free license to use them without restrictions or compensation.

13. **Third-Party Services**
    The Service may link to or integrate third-party tools (e.g., sign-in, payments, messaging). {{ORG}} is not responsible for third-party services; your use is governed by their terms and policies.

14. **Availability and Changes**
    The Service may change, suspend, or discontinue features at any time. We may update these Terms; material changes will be communicated by reasonable means. Continued use after changes constitutes acceptance.

15. **Termination**
    You may stop using the Service at any time. We may suspend or terminate access for any violation of these Terms, risk to users, legal requirements, or operational reasons. Upon termination, rights and obligations that by nature should survive (e.g., IP, disclaimers, limitations, governing law) will survive.

16. **Disclaimers**
    THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” {{ORG}} DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT ACCURACY, RELIABILITY, OR AVAILABILITY, NOR THAT THE SERVICE WILL BE ERROR-FREE OR SECURE.

17. **Limitation of Liability**
    TO THE MAXIMUM EXTENT PERMITTED BY LAW, {{ORG}} AND ITS AFFILIATES WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, EVEN IF ADVISED OF THE POSSIBILITY. OUR AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) AMOUNTS PAID BY YOU TO {{ORG}} IN THE 12 MONTHS BEFORE THE CLAIM OR (B) USD $100.

18. **Indemnification**
    You agree to defend, indemnify, and hold harmless {{ORG}} and its affiliates from any claims, losses, and expenses (including attorneys’ fees) arising from your use of the Service, your User Content, or your violation of these Terms.

19. **Governing Law; Dispute Resolution**
    These Terms are governed by the laws of {{GOVERNING_LAW}} without regard to conflicts of law rules. Venue and jurisdiction will lie exclusively in courts located there, unless applicable law requires otherwise.

20. **Export and Sanctions**
    You represent you are not prohibited by export controls or sanctions from using the Service. Do not use the Service in violation of such laws.

21. **Entire Agreement; Severability; Waiver**
    These Terms constitute the entire agreement between you and {{ORG}} regarding the Service. If any provision is unenforceable, it will be modified to the minimum extent necessary, and the remainder will remain in effect. Failure to enforce a provision is not a waiver.

22. **Contact**
    Questions about these Terms may be sent to {{CONTACT_EMAIL}} or by mail to {{POSTAL_ADDR}}.

**Effective Date:** {{EFFECTIVE_DATE}}

### END OF COPY

## Implementation details

- Each section is a `<LegalSection id="..." title="...">` wrapper receiving children.
- Build the TOC dynamically from a static array of section ids/titles to avoid querying the DOM.
- Add deep-link icons on headings that appear on hover/focus.
- Respect `prefers-reduced-motion` for smooth-scroll.
- Include a compact “Back to top” button after each major section (visually subtle).

## Accessibility

- Use `main`, `nav[aria-label="In-page navigation"]`, and `aside` landmarks.
- Skip link: a visually hidden “Skip to content” anchor at the top.
- Ensure heading hierarchy starts at `h1` then `h2` for sections, `h3` for any nested items.
- All interactive elements keyboard-navigable with visible focus.

## Acceptance criteria

- Visiting `/terms` renders the full Terms with hero header, Updated badge, sticky TOC on desktop, drawer TOC on mobile.
- All TOC links scroll to the correct section and update the URL hash.
- Hash URLs opened directly (e.g., `/terms#privacy`) land on the correct section with focus management.
- Lighthouse Accessibility ≥ 95, Best Practices ≥ 95 on this page.
- No TypeScript `any`. No file > 350 LoC.
- Content placeholders are defined in a single place at the top of the page and used throughout.

Now implement all the above.
