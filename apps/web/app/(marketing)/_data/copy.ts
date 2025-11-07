export const brand = {
  name: "10x K Factor",
  ctaPrimary: "Get Started Free",
  ctaSecondary: "See a Live Demo",
};

export const nav = {
  links: [
    { label: "How it works", href: "#process" },
    { label: "Features", href: "#features" },
    { label: "FAQ", href: "#faq" },
  ],
};

export const hero = {
  eyebrow: "Viral Growth for Learning Apps",
  headline: "Turn every result into a referral.",
  subheadline:
    "10x K Factor adds share cards, smart links, presence, and rewards—so your learners invite friends right after moments that matter.",
  primaryCta: brand.ctaPrimary,
  secondaryCta: brand.ctaSecondary,
  microProof: "Loved by growth teams shipping in weeks, not months.",
  highlights: [
    "Closed-loop viral mechanics",
    "Results-page share cards",
    "Presence & mini-leaderboards",
  ],
};

export const trust = {
  headline: "Trusted by fast-moving teams",
  logos: ["Acme Tutors", "StudyWave", "CoachHQ", "BrightPrep", "LessonLab"],
  note: "Logos for illustration",
};

export const benefits = {
  headline: "Why teams add 10x K Factor",
  items: [
    {
      title: "K ≥ 1.20 potential",
      body: "Launch closed-loop viral mechanics that lift invites per user and invite conversion rate.",
    },
    {
      title: "Built-in presence",
      body: "Show who's learning now—spark FOMO with activity feed and mini-leaderboards.",
    },
    {
      title: "Results that share themselves",
      body: "Auto-generate privacy-safe cards from diagnostics, practice, and AI sessions.",
    },
    {
      title: "Immediate rewards",
      body: "Offer streak shields, AI minutes, or class passes that unlock at first-value moments.",
    },
  ],
};

export const process = {
  id: "process",
  headline: "How it works",
  steps: [
    {
      step: "1",
      title: "Instrument moments",
      body: "Connect results pages and session summaries—no heavy lift. We detect 'shareable wins'.",
    },
    {
      step: "2",
      title: "Trigger smart invites",
      body: "Personalized copy + smart links land friends in a 5-question micro-task or class sampler.",
    },
    {
      step: "3",
      title: "Close the loop",
      body: "Track joins → first-value moment, reward both sides, and measure K in real time.",
    },
  ],
};

export const dashboardMock = {
  headline: "Your growth cockpit",
  bullets: [
    "Live K, invites, join → FVM conversion",
    "Loop performance by persona and surface",
    "Presence heatmap, cohort leaderboards",
  ],
  caption: "Demo view — data shown for illustration.",
};

export const features = {
  id: "features",
  headline: "Features that make growth feel alive",
  items: [
    {
      title: "Results-Page Share Cards",
      body: "Auto cards for students, parents, and tutors—safe by default with deep links.",
    },
    {
      title: "Smart Links & Attribution",
      body: "Signed short links with UTM; cross-device continuity and clear referral credit.",
    },
    {
      title: "Presence & Mini-Leaderboards",
      body: "Show friends online and subject clubs; nudge co-practice with one tap.",
    },
    {
      title: "Rewards & Economy",
      body: "Instant AI-minutes, streak shields, or class passes; anti-abuse guardrails included.",
    },
    {
      title: "Experimentation",
      body: "Allocate traffic, log exposures, and read lift with guardrail metrics.",
    },
    {
      title: "Compliance-First",
      body: "COPPA/FERPA aware defaults and privacy-safe media by design.",
    },
  ],
};

export const testimonials = {
  headline: "What teams say",
  items: [
    {
      name: "Maya R.",
      role: "Head of Growth, StudyWave",
      quote:
        "We shipped two loops in 10 days and lifted invites/user by 38%. The presence layer made the product feel alive.",
      avatar: "/images/maya.png",
    },
    {
      name: "Carlos D.",
      role: "Product Lead, BrightPrep",
      quote:
        "Share cards on results pages were an instant win. Friends land in a 5-question micro-task and hit FVM fast.",
      avatar: "/images/carlos.png",
    },
    {
      name: "Nina S.",
      role: "Director, CoachHQ",
      quote:
        "Attribution finally made sense. We could see the whole path from invite to join to first-value moment.",
      avatar: "/images/nina.png",
    },
  ],
};

export const faq = {
  id: "faq",
  headline: "Frequently asked questions",
  items: [
    {
      q: "How does 10x K Factor measure K?",
      a: "We log invites sent, invite opens, account creation, and first-value moment (FVM). K = invites per user × invite conversion.",
    },
    {
      q: "Is it safe for student data?",
      a: "Yes. We use privacy-safe defaults, minimize PII, and support COPPA/FERPA-aware flows.",
    },
    {
      q: "What's a first-value moment?",
      a: "A quick win for a newcomer, e.g., completing a 5-question skill check or first AI-tutor minute.",
    },
    {
      q: "Do we need a redesign?",
      a: "No. You can drop widgets on existing results pages and enable loops incrementally.",
    },
  ],
};

export const cta = {
  headline: "Ready to make growth feel alive?",
  sub: "Add presence, share cards, and smart links—then watch K climb.",
  primaryCta: brand.ctaPrimary,
  secondaryCta: brand.ctaSecondary,
};

export const footer = {
  links: [
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
  ],
  tagline:
    "© " + new Date().getFullYear() + " 10x K Factor. All rights reserved.",
};
