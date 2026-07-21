import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";

export interface AssetSummary {
  id: number;
  title: string;
  description: string;
  category: string;
  emoji: string;
}

export interface AssetDetail extends AssetSummary {
  body: string;
  createdAt: string;
}

// Helper: validate session token
function validateToken(token: string): number {
  if (!token) throw new Error("Authentication required");
  const session = db.getUserBySessionToken(token);
  if (!session) throw new Error("Session expired or invalid");
  return session.userId;
}

// List all assets (optionally filtered by category)
export const listAssets = createServerFn()
  .validator(
    (data: unknown) => {
      const d = data as { token: string; category?: string };
      if (!d.token) throw new Error("Token is required");
      return d;
    }
  )
  .handler(async ({ data }) => {
    validateToken(data.token);
    seedAssetData(); // idempotent — seeds only if empty
    const assets = db.listAssets(data.category);
    return assets.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      category: a.category,
      emoji: a.emoji,
    })) as AssetSummary[];
  });

// Get a single asset by ID
export const getAssetById = createServerFn()
  .validator(
    (data: unknown) => {
      const d = data as { token: string; assetId: number };
      if (!d.token || !d.assetId) throw new Error("Token and asset ID are required");
      return d;
    }
  )
  .handler(async ({ data }) => {
    validateToken(data.token);
    const asset = db.getAssetById(data.assetId);
    if (!asset) throw new Error("Asset not found");
    return {
      id: asset.id,
      title: asset.title,
      description: asset.description,
      category: asset.category,
      emoji: asset.emoji,
      body: asset.body,
      createdAt: asset.created_at,
    } as AssetDetail;
  });

// Seed assets (idempotent — only seeds if empty)
export const seedAssets = createServerFn()
  .handler(async () => {
    seedAssetData();
    return { success: true };
  });

// Seed data function — call this from server startup or a route
export function seedAssetData(): void {
  db.seedAssets([
    // === COURSES ===
    {
      title: "Entrepreneurship Fundamentals",
      description: "Getting started, validating ideas, building foundations",
      category: "courses",
      emoji: "🎓",
      body: `# Entrepreneurship Fundamentals

## About This Course

Starting a business can feel overwhelming. This course breaks down the essentials into actionable steps that anyone can follow — whether you're launching a side hustle or going all-in on your dream.

## What You'll Learn

### Module 1: Idea Validation
Before you invest time and money, you need to know if your idea has legs. We'll cover:
- Running "smoke tests" before building anything
- Talking to potential customers without leading them
- Analyzing competitor weaknesses you can exploit
- The 5-minute validation framework

### Module 2: Business Model Design
Not all business models are created equal. We'll explore:
- Service vs. product vs. marketplace models
- Subscription and recurring revenue design
- Pricing psychology and tiered offerings
- Choosing the right model for your lifestyle goals

### Module 3: Building Your Foundation
The boring stuff that makes everything else work:
- Legal structure selection (LLC, sole prop, etc.)
- Banking, accounting, and tax essentials
- Brand identity and positioning basics
- Setting up your operations toolkit

### Module 4: First Customers
How to get from zero to paying customers:
- Outreach strategies that don't feel salesy
- Building a waitlist before launch
- Leveraging your existing network effectively
- Closing your first 5 sales

### Module 5: Growth Systems
Building repeatable processes:
- Customer feedback loops
- Referral program design
- Content marketing foundations
- When and how to hire help

---

*Estimated completion time: 4-6 hours. Self-paced with worksheets and templates included.*`,
    },
    {
      title: "AI Marketing 101",
      description: "Using AI tools for content, social media, and campaigns",
      category: "courses",
      emoji: "🎓",
      body: `# AI Marketing 101

## About This Course

AI is transforming marketing — but most entrepreneurs don't know where to start or how to use it effectively. This course shows you practical, hands-on ways to leverage AI without needing a technical background.

## What You'll Learn

### Module 1: AI Marketing Landscape
- What AI can (and can't) do for your marketing
- Overview of the best tools for entrepreneurs
- Ethical considerations and best practices
- Setting up your AI marketing toolkit

### Module 2: Content Creation with AI
- Writing blog posts, social media captions, and emails
- Generating content ideas and outlines
- Repurposing content across platforms
- Maintaining your brand voice with AI assistance

### Module 3: Social Media Automation
- Scheduling and optimizing posts with AI
- Hashtag and trend analysis
- AI-powered engagement strategies
- Measuring what works

### Module 4: Ad Campaigns & Targeting
- Writing ad copy that converts
- Audience targeting with AI insights
- A/B testing at scale
- Budget optimization strategies

### Module 5: Analytics & Reporting
- Using AI to interpret marketing data
- Predictive analytics for campaign planning
- Automated reporting dashboards
- Continuous improvement frameworks

---

*Estimated completion time: 3-4 hours. Includes prompt templates and tool recommendations.*`,
    },
    {
      title: "Social Media Growth",
      description: "Building an audience from zero across platforms",
      category: "courses",
      emoji: "🎓",
      body: `# Social Media Growth

## About This Course

Growing an audience from scratch is hard — but it's not impossible. This course gives you a proven framework for building a loyal following, regardless of your niche or budget.

## What You'll Learn

### Module 1: Platform Strategy
- Choosing the right platforms for your audience
- Understanding platform algorithms
- Content format optimization (short-form, long-form, live)
- Cross-platform content strategies

### Module 2: Content That Connects
- The 4 content pillars framework
- Storytelling techniques for social media
- Creating scroll-stopping visuals
- Writing captions that drive engagement

### Module 3: Growth Tactics
- Hashtag strategies that actually work
- Collaboration and cross-promotion
- Engagement pods and communities
- Paid promotion on a budget

### Module 4: Consistency Systems
- Batch content creation workflows
- Content calendar design
- Templates and repurposing
- Tools and automation

### Module 5: Monetization
- When and how to start selling
- Affiliate marketing on social media
- Building a funnel from social traffic
- Brand partnership strategies

---

*Estimated completion time: 5-7 hours. Includes content calendar templates.*`,
    },
    {
      title: "Digital Products Masterclass",
      description: "Creating and selling e-books, templates, and courses",
      category: "courses",
      emoji: "🎓",
      body: `# Digital Products Masterclass

## About This Course

Digital products are the ultimate scalable business model — create once, sell forever. This masterclass walks you through the entire process from idea to launch.

## What You'll Learn

### Module 1: Finding Your Product
- Identifying marketable skills and knowledge
- Validating demand before building
- Competitive analysis and differentiation
- Pricing research and strategy

### Module 2: Product Creation
- E-books: writing, formatting, and design
- Templates: what makes a great template
- Online courses: structure and delivery
- Tools and software for creation

### Module 3: Sales Page Design
- High-converting sales page structure
- Copywriting essentials for digital products
- Pricing psychology and upsells
- Social proof and testimonial strategies

### Module 4: Launch Strategy
- Pre-launch buzz building
- Email sequence design for launches
- Social media launch playbook
- Affiliate and partnership launches

### Module 5: Scaling
- Building a product ecosystem
- Membership and subscription models
- Automating delivery and support
- Expanding to new markets

---

*Estimated completion time: 6-8 hours. Includes product idea worksheet and launch checklist.*`,
    },
    {
      title: "Email Marketing That Converts",
      description: "Building lists, sequences, and automations",
      category: "courses",
      emoji: "🎓",
      body: `# Email Marketing That Converts

## About This Course

Email marketing consistently delivers the highest ROI of any marketing channel. This course teaches you how to build an engaged list and convert subscribers into customers.

## What You'll Learn

### Module 1: List Building Fundamentals
- Lead magnet design that attracts ideal customers
- Opt-in form placement and optimization
- Landing page creation for list growth
- Compliance (GDPR, CAN-SPAM)

### Module 2: Welcome Sequences
- The critical first 5 emails
- Building trust and setting expectations
- Delivering value before asking for anything
- Segmentation from day one

### Module 3: Nurture Sequences
- Keeping subscribers engaged between launches
- Educational content that builds authority
- Story-driven emails that connect
- Re-engagement strategies for cold subscribers

### Module 4: Sales Sequences
- Launch email structure (tease, value, offer, close)
- Scarcity and urgency (ethical application)
- Abandoned cart and follow-up sequences
- Split testing for optimization

### Module 5: Automation & Analytics
- Setting up behavior-triggered emails
- Tagging and segmentation strategies
- Key metrics to track
- Continuous improvement framework

---

*Estimated completion time: 4-5 hours. Includes email sequence templates.*`,
    },
    // === TEMPLATES ===
    {
      title: "Business Plan Template",
      description: "One-page lean business plan to clarify your vision",
      category: "templates",
      emoji: "📄",
      body: `# Business Plan Template

## What's Included

A comprehensive one-page lean business plan template designed for entrepreneurs who want clarity without complexity. This isn't a 40-page document — it's a focused, actionable plan you can complete in an afternoon.

## Template Sections

### 1. Value Proposition
- What problem are you solving?
- Who has this problem?
- How is your solution different/better?

### 2. Target Market
- Customer demographics and psychographics
- Market size and growth potential
- Key customer segments

### 3. Revenue Model
- Pricing strategy
- Revenue streams
- Projected customer lifetime value

### 4. Marketing & Sales
- Customer acquisition channels
- Sales process overview
- Key partnerships

### 5. Operations
- Key activities and resources
- Technology and tools needed
- Team structure (current and planned)

### 6. Financial Projections
- Startup costs
- Monthly operating expenses
- Revenue projections (12 months)
- Break-even analysis

### 7. Milestones
- 30-day goals
- 90-day goals
- 6-month goals
- 12-month vision

---

*Format: Editable PDF and Google Docs template. Fill in the blanks and you're ready to go.*`,
    },
    {
      title: "Email Sequence Templates",
      description: "Welcome, nurture, and sales sequences ready to customize",
      category: "templates",
      emoji: "📄",
      body: `# Email Sequence Templates

## What's Included

Three complete email sequences — Welcome, Nurture, and Sales — written by professional copywriters. Just fill in your details and hit send.

## Welcome Sequence (5 Emails)

### Email 1: The Welcome
- Subject line formula
- Body template (deliver lead magnet, introduce yourself)
- CTA suggestions

### Email 2: Your Story
- Connection-building framework
- Vulnerable share prompts
- Bridge to their situation

### Email 3: Value Drop
- Educational content structure
- Quick-win format
- Engagement question

### Email 4: Soft Pitch
- Natural offer introduction
- Objection handling preview
- Social proof placement

### Email 5: The Ask
- Direct CTA template
- Urgency elements (without pressure)
- What to expect next

## Nurture Sequence (4 Emails)

### Bi-Weekly Value Emails
- Tip format (quick, actionable)
- Story format (relatable, educational)
- FAQ format (objection crushing)
- Celebration format (community building)

## Sales Sequence (3 Emails)

### Launch Structure
- Pre-launch teaser
- Launch announcement
- Last chance / deadline

---

*Format: Copy-paste ready text files with placeholders clearly marked. Works with any email platform.*`,
    },
    {
      title: "Social Media Content Calendar",
      description: "30-day posting schedule with content ideas",
      category: "templates",
      emoji: "📄",
      body: `# Social Media Content Calendar

## What's Included

A fully structured 30-day content calendar with post ideas, format suggestions, and best posting times. Pre-filled with ideas you can adapt to any niche.

## Calendar Structure

### Week 1: Brand Introduction
- Day 1: Founder story / why you started
- Day 2: Behind-the-scenes of your work
- Day 3: Educational post (teach something)
- Day 4: Engagement post (poll, question)
- Day 5: Customer spotlight or testimonial
- Day 6: Personal insight or lesson learned
- Day 7: Weekly roundup or reflection

### Week 2: Education & Value
- Day 8: How-to or tutorial
- Day 9: Common mistake post
- Day 10: Tool or resource recommendation
- Day 11: Case study or example
- Day 12: Myth-busting post
- Day 13: Quick tip
- Day 14: Community feature

### Week 3: Building Desire
- Day 15: Before/after transformation
- Day 16: Benefits of your approach
- Day 17: Customer success story
- Day 18: Sneak peek of your offer
- Day 19: Q&A or AMA
- Day 20: Comparison post
- Day 21: Value-packed thread

### Week 4: Call to Action
- Day 22: Offer introduction
- Day 23: Social proof dump
- Day 24: Limited-time bonus
- Day 25: FAQ about your offer
- Day 26: Final call / deadline
- Day 27: Launch celebration
- Day 28-30: Recap and next steps

---

*Format: Google Sheets template with columns for platform, format, caption draft, hashtags, and media notes.*`,
    },
    {
      title: "Sales Page Outline",
      description: "Structure for high-converting sales pages",
      category: "templates",
      emoji: "📄",
      body: `# Sales Page Outline

## What's Included

A proven sales page structure used by top marketers and conversion experts. This isn't a fill-in-the-blanks template — it's a strategic framework you adapt to your specific offer.

## Section-by-Section Outline

### 1. Hero Section
- Headline formula (outcome + timeframe + uniqueness)
- Subheadline (who it's for + key benefit)
- Hero image or video placement
- Primary CTA button

### 2. Problem Agitation
- Describe the pain your audience feels
- Share relatable scenarios
- Explain why existing solutions fail
- Create urgency for a solution

### 3. Solution Introduction
- Introduce your offer as the answer
- High-level benefits overview
- What makes it different
- Who it's perfect for

### 4. Features & Benefits
- Feature → Benefit → Transformation format
- Use icons or visuals
- Group related features
- Address potential objections

### 5. Social Proof
- Testimonial placement and format
- Results and metrics
- Client logos or names
- Case study highlights

### 6. Pricing
- Option comparison table
- Value stacking (total value vs. price)
- Payment plan options
- Guarantee statement

### 7. FAQ Section
- Address top 5-10 objections
- Shipping, access, support details
- Refund and guarantee policies
- Technical requirements

### 8. Final CTA
- Recap key benefits
- Restate guarantee
- Urgency element (if genuine)
- Final call-to-action button

---

*Format: Google Docs outline with copywriting prompts and examples for each section.*`,
    },
    {
      title: "Client Onboarding Checklist",
      description: "Steps for onboarding new customers smoothly",
      category: "templates",
      emoji: "📄",
      body: `# Client Onboarding Checklist

## What's Included

A comprehensive onboarding checklist covering every step from signed contract to fully integrated client. Map this to your own process and never miss a step.

## Checklist Phases

### Phase 1: Pre-Onboarding (Before Day 1)
- [ ] Signed contract received and filed
- [ ] Payment processed (first invoice or retainer)
- [ ] Welcome email sent with next steps
- [ ] Client portal / workspace created
- [ ] Kickoff call scheduled
- [ ] Intake questionnaire sent
- [ ] Access requests submitted (tools, accounts)

### Phase 2: Kickoff (Day 1-3)
- [ ] Kickoff call completed (use agenda template)
- [ ] Goals and expectations documented
- [ ] Timeline and milestones confirmed
- [ ] Communication preferences noted
- [ ] Key contacts list created
- [ ] Project management board set up
- [ ] File sharing and asset collection complete

### Phase 3: First Week (Day 4-7)
- [ ] First deliverable or milestone completed
- [ ] Check-in call or update sent
- [ ] Feedback process established
- [ ] Adjustments made based on initial feedback
- [ ] Client training (if applicable)
- [ ] Reporting cadence confirmed

### Phase 4: Ongoing (Week 2+)
- [ ] Weekly status updates sent
- [ ] Monthly review calls scheduled
- [ ] Renewal or upsell opportunities identified
- [ ] Testimonial request timing planned
- [ ] Referral program explained

---

*Format: Printable PDF checklist and editable Google Sheets version. Includes email templates for each phase.*`,
    },
    // === GUIDES ===
    {
      title: "SEO Starter Guide",
      description: "Keyword research, on-page, and content SEO fundamentals",
      category: "guides",
      emoji: "📘",
      body: `# SEO Starter Guide

## Overview

Search engine optimization doesn't have to be overwhelming. This guide covers the fundamentals that matter most for small businesses and entrepreneurs — no technical expertise required.

## Key Takeaways

### 1. Keyword Research
Start with what your customers are actually searching for:
- Use free tools like Google Keyword Planner and Ubersuggest
- Focus on long-tail keywords (3+ words) — they're less competitive
- Look for "buying intent" keywords like "best [product] for [problem]"
- Create a keyword map: one primary keyword per page

### 2. On-Page SEO
Make each page crystal clear to Google:
- Include your primary keyword in the title tag, H1, and first paragraph
- Write compelling meta descriptions (under 160 characters)
- Use descriptive URLs (e.g., /seo-starter-guide not /page-123)
- Add alt text to all images
- Internal linking: connect related pages

### 3. Content SEO
Create content that ranks:
- Write for humans first, search engines second
- Answer the question better than anyone else
- Use headers (H2, H3) to structure content logically
- Aim for comprehensive coverage of your topic
- Update old content regularly

### 4. Technical SEO Basics
The minimum you need:
- Make sure your site is mobile-friendly
- Improve page load speed (compress images, minimize code)
- Submit your sitemap to Google Search Console
- Fix broken links
- Use HTTPS

### 5. Local SEO (if applicable)
- Claim and optimize your Google Business Profile
- Get listed in relevant directories
- Collect and respond to reviews
- Include location keywords naturally

---

*Estimated read time: 15 minutes. Includes a keyword research worksheet.*`,
    },
    {
      title: "Branding Basics",
      description: "Logo, colors, voice, and positioning for new businesses",
      category: "guides",
      emoji: "📘",
      body: `# Branding Basics

## Overview

Branding is more than a logo — it's the feeling people get when they interact with your business. This guide helps you build a consistent, memorable brand from day one.

## Key Takeaways

### 1. Brand Positioning
Define where you fit:
- Identify your unique value proposition (what makes you different?)
- Map your competitors and find your white space
- Write a one-sentence brand promise
- Define who you're NOT for (it's okay to be polarizing)

### 2. Visual Identity
The elements people see:
- **Logo**: Start simple — a clean wordmark is better than a bad icon
- **Color Palette**: Choose 3-5 colors (primary, secondary, accent, neutral)
- **Typography**: Pick 1-2 fonts (heading + body) that reflect your personality
- **Imagery Style**: Define photo style, illustration preference, and icon set

### 3. Brand Voice
How you sound:
- Define 3-5 brand personality traits (e.g., warm, direct, playful, authoritative)
- Write brand voice guidelines: Do's and Don'ts
- Create a swipe file of brands whose voice you admire
- Be consistent across every channel

### 4. Brand Assets Checklist
What you need to create:
- [ ] Logo (primary, secondary, favicon)
- [ ] Color palette with hex codes
- [ ] Font selections with fallbacks
- [ ] Email signature template
- [ ] Social media profile images
- [ ] Business card design
- [ ] Presentation template
- [ ] Brand one-pager / style guide

### 5. Consistency Rules
- Use the same logo everywhere
- Stick to your color palette (no random colors)
- Maintain your brand voice in every post and email
- Create templates for repeated content types
- Audit your brand every quarter

---

*Estimated read time: 12 minutes. Includes a brand identity worksheet.*`,
    },
    {
      title: "Pricing Strategy Guide",
      description: "How to price your products and services confidently",
      category: "guides",
      emoji: "📘",
      body: `# Pricing Strategy Guide

## Overview

Pricing is one of the hardest decisions for new entrepreneurs. Price too low and you burn out. Price too high and you scare customers away. This guide gives you frameworks to find the sweet spot.

## Key Takeaways

### 1. Pricing Models
Choose the right approach:
- **Hourly/Project**: Best for services, easy to start, hard to scale
- **Product**: One-time purchase, simple but needs volume
- **Subscription**: Recurring revenue, predictable income
- **Tiered**: Good-better-best options to capture different segments
- **Value-Based**: Price based on the outcome you deliver, not your time

### 2. Cost-Plus Pricing
The floor — know your minimum:
- Calculate all costs (time, tools, materials, overhead)
- Add your desired profit margin
- This is your absolute minimum — never go below it

### 3. Competitor Analysis
The market — know your range:
- Research 5-10 competitors' pricing
- Note what's included at each price point
- Identify gaps in the market you can fill
- Don't just undercut — differentiate

### 4. Value-Based Pricing
The ceiling — know your worth:
- What is the outcome you deliver worth to your customer?
- Quantify savings (time, money, stress)
- Use tiered pricing to capture different willingness to pay
- Test pricing with early customers and adjust

### 5. Pricing Psychology
Ways to present prices effectively:
- Charm pricing ($97 vs $100)
- Anchor pricing (show a higher option first)
- Bundle pricing (package deals feel like better value)
- Money-back guarantee (reduces perceived risk)

### 6. When to Raise Prices
- You're consistently fully booked
- Customers rave about results
- You've added significant value
- Your costs have increased
- Raise gradually and communicate clearly

---

*Estimated read time: 10 minutes. Includes a pricing calculator spreadsheet.*`,
    },
    {
      title: "Launch Checklist",
      description: "Everything you need before going live with your business",
      category: "guides",
      emoji: "📘",
      body: `# Launch Checklist

## Overview

Launching a business is exciting — and there are a lot of moving parts. This checklist ensures you don't miss anything critical before, during, or after your launch.

## Key Takeaways

### Pre-Launch (2-4 Weeks Before)
- [ ] Business name registered and domain purchased
- [ ] Legal structure established (LLC, sole prop, etc.)
- [ ] Business bank account opened
- [ ] Brand identity finalized (logo, colors, fonts)
- [ ] Website or landing page live
- [ ] Email marketing platform set up
- [ ] Lead magnet created and delivery automated
- [ ] Social media profiles created and branded
- [ ] Content calendar for launch month prepared
- [ ] Payment processing configured
- [ ] Customer support system ready
- [ ] Analytics and tracking installed

### Launch Week
- [ ] Announcement post published across all channels
- [ ] Launch email sent to your list
- [ ] Daily social media content posted
- [ ] Engagement with every comment and message
- [ ] Live event or Q&A hosted
- [ ] Personal outreach to warm leads
- [ ] Press or influencer outreach (if applicable)
- [ ] Monitor analytics daily

### Post-Launch (Week 1-4)
- [ ] Thank-you messages sent to first customers
- [ ] Testimonials and feedback collected
- [ ] Launch performance analyzed
- [ ] Adjustments made based on data
- [ ] Content calendar for next month planned
- [ ] Customer onboarding refined
- [ ] Referral program launched

### Common Launch Mistakes to Avoid
1. Waiting until everything is "perfect" — launch at 80% ready
2. No email list — start building your list months before launch
3. Launching to crickets — build anticipation before you launch
4. No clear CTA — make it obvious what people should do
5. Going silent after launch — maintain momentum

---

*Estimated read time: 8 minutes. Printable PDF checklist included.*`,
    },
    {
      title: "Customer Avatar Worksheet",
      description: "Define your ideal customer in vivid detail",
      category: "guides",
      emoji: "📘",
      body: `# Customer Avatar Worksheet

## Overview

You can't market to "everyone." The more specific you are about who you serve, the more effective your marketing becomes. This worksheet helps you create a detailed picture of your ideal customer.

## Key Takeaways

### Section 1: Demographics
- Age range:
- Gender:
- Location:
- Income level:
- Education:
- Occupation:
- Family status:

### Section 2: Psychographics
- Values and beliefs:
- Hobbies and interests:
- Lifestyle description:
- What do they read/watch/listen to?
- Who do they admire or follow?

### Section 3: Goals & Aspirations
- What do they want to achieve?
- What does success look like to them?
- What are they working toward this year?
- What would make their life better?

### Section 4: Pain Points & Frustrations
- What keeps them up at night?
- What have they tried that didn't work?
- What are they afraid of?
- What's the biggest obstacle in their way?
- What do they complain about?

### Section 5: Buying Behavior
- Where do they spend time online?
- How do they research purchases?
- What influences their decisions?
- What makes them trust a brand?
- What makes them say "yes"?

### Section 6: Objections
- Why might they NOT buy from you?
- Price concerns?
- Trust concerns?
- Timing concerns?
- Alternative solutions they might choose?

### Section 7: Your Customer in One Sentence
Write a single sentence that captures everything:

"My ideal customer is [description] who wants [goal] but struggles with [pain point]."

---

*Estimated work time: 30-45 minutes. The more detailed you are, the more effective your marketing becomes.*`,
    },
    // === AI PROMPTS ===
    {
      title: "Social Media Caption Generator",
      description: "Prompt templates for each platform",
      category: "prompts",
      emoji: "🤖",
      body: `# Social Media Caption Generator

## How to Use These Prompts

Copy the prompt, fill in the [bracketed] placeholders with your specific details, and paste into ChatGPT, Claude, or any AI assistant. Each prompt is optimized for a specific platform.

---

## Instagram Caption Prompt

\`\`\`
Write 3 Instagram caption options for a post about [topic]. 

Context:
- My brand: [brand name]
- My audience: [target audience description]
- Brand voice: [tone — e.g., warm and encouraging, bold and direct]
- Goal of this post: [educate / inspire / entertain / sell]

For each option include:
1. The caption (including hook, body, and call-to-action)
2. 5-10 relevant hashtags
3. A suggested first comment

Make the hook scroll-stopping and the CTA clear but not pushy.
\`\`\`

---

## LinkedIn Post Prompt

\`\`\`
Write a LinkedIn post about [topic] that positions me as a thought leader.

Context:
- My expertise: [area of expertise]
- Target reader: [who am I writing for?]
- Key message: [the one thing I want them to remember]
- Desired action: [what should they do after reading?]

Requirements:
- Start with a strong hook (question, bold statement, or counterintuitive insight)
- Use short paragraphs (1-2 sentences max)
- Include a personal story or example
- End with a clear takeaway and CTA
- Add 3-5 relevant hashtags
\`\`\`

---

## Twitter/X Thread Prompt

\`\`\`
Write a Twitter/X thread (5-7 tweets) about [topic].

Requirements:
- Tweet 1: Strong hook that makes people want to read the thread
- Tweets 2-5: Each tweet delivers one key insight or step
- Final tweet: Summary and CTA (follow, reply, or check out link)

Make it punchy. No fluff. Each tweet should be valuable on its own.
\`\`\`

---

## TikTok / Short-Form Video Script Prompt

\`\`\`
Write a 30-60 second video script for [platform] about [topic].

Requirements:
- Hook (first 3 seconds): grab attention immediately
- Body: deliver the value quickly and clearly
- CTA: what should viewers do?

Keep sentences short and conversational. Include visual notes in [brackets].
\`\`\`

---

*Use these prompts as starting points. The more specific you are with your [bracketed] details, the better the output.*`,
    },
    {
      title: "Email Subject Line Prompts",
      description: "High-open-rate subject line formulas",
      category: "prompts",
      emoji: "🤖",
      body: `# Email Subject Line Prompts

## How to Use These Prompts

These prompts help you generate high-performing email subject lines. Copy, fill in your details, and iterate until you find winners.

---

## Subject Line Generator (General)

\`\`\`
Generate 10 email subject lines for an email about [topic/offer].

Context:
- My audience: [description]
- Email purpose: [welcome / nurture / launch / follow-up]
- Brand voice: [tone]
- Key benefit: [what's in it for them?]

Requirements:
- Mix of styles: curiosity, direct benefit, personal, urgent
- Keep under 50 characters when possible
- No spam trigger words
- Make each feel personal, not generic
\`\`\`

---

## Curiosity-Driven Subject Lines

\`\`\`
Write 5 curiosity-driven email subject lines for [topic].

Examples of the style I want:
- "The thing nobody tells you about [topic]"
- "I tried [something] for 30 days. Here's what happened."
- "This one change doubled my [result]"

Make them intriguing without being clickbaity.
\`\`\`

---

## Benefit-Driven Subject Lines

\`\`\`
Write 5 benefit-driven email subject lines for [offer/topic].

The core benefit is: [what does the reader get?]

Style: Clear, direct, and value-focused. The reader should know exactly what's in it for them.
\`\`\`

---

## A/B Test Subject Line Pairs

\`\`\`
Generate 3 pairs of A/B test subject lines for an email about [topic].

For each pair:
- Version A: Curiosity-driven
- Version B: Benefit-driven

Context: [audience, brand voice, email purpose]
\`\`\`

---

## Re-engagement Subject Lines

\`\`\`
Write 5 subject lines for re-engaging subscribers who haven't opened emails in 30+ days.

Tone: Friendly, no guilt. Give them a reason to come back or make it easy to leave.
\`\`\`

---

*Pro tip: Always A/B test subject lines. A small change can mean a 20%+ difference in open rates.*`,
    },
    {
      title: "Landing Page Copy Prompts",
      description: "Generate hero, features, and CTA copy",
      category: "prompts",
      emoji: "🤖",
      body: `# Landing Page Copy Prompts

## How to Use These Prompts

Each prompt generates copy for a specific section of your landing page. Use them together for a complete page, or pick the sections you need.

---

## Hero Section Prompt

\`\`\`
Write 3 options for a landing page hero section.

Context:
- My product/service: [description]
- Target customer: [who is it for?]
- Key benefit: [what's the main outcome?]
- What makes it different: [unique angle]

For each option provide:
1. Headline (outcome-focused, under 12 words)
2. Subheadline (who it's for + how it works, under 25 words)
3. CTA button text (action-oriented, 2-4 words)

Make the headline impossible to ignore and the CTA irresistible.
\`\`\`

---

## Features & Benefits Prompt

\`\`\`
Write copy for [number] key features/benefits of [product/service].

For each feature provide:
1. Feature name (3-5 words)
2. Benefit description (1-2 sentences)
3. Why it matters (1 sentence connecting to customer pain point)

Format: Feature → Benefit → Transformation

Context:
- Product: [description]
- Customer pain points: [list 3-5]
- Brand voice: [tone]
\`\`\`

---

## Social Proof Prompt

\`\`\`
Write 3 testimonial templates I can use as examples for my landing page. 

Each testimonial should follow this structure:
- Before state: what was their struggle?
- Discovery: how did they find my product?
- After state: what specific result did they get?
- Recommendation: who is this for?

Context:
- Product: [description]
- Typical customer: [description]
- Typical results: [what outcomes do customers get?]
\`\`\`

---

## FAQ Section Prompt

\`\`\`
Generate 8 FAQ questions and answers for a landing page selling [product/service].

Include questions about:
- Pricing and payment
- Who it's for (and not for)
- How it works
- Results and timeline
- Support and guarantees
- Comparisons to alternatives

Write answers that are honest, clear, and reassuring. Address objections directly.
\`\`\`

---

## CTA Section Prompt

\`\`\`
Write copy for a final call-to-action section of a landing page.

Include:
1. Headline (reinforce the main benefit)
2. Supporting text (1-2 sentences removing final doubts)
3. CTA button text
4. Risk-reversal statement (guarantee, free trial, etc.)

Make it feel like the natural next step, not a hard sell.
\`\`\`

---

*Use these prompts sequentially to build a complete, high-converting landing page.*`,
    },
    {
      title: "Product Description Prompts",
      description: "For e-commerce and digital products",
      category: "prompts",
      emoji: "🤖",
      body: `# Product Description Prompts

## How to Use These Prompts

Great product descriptions sell the transformation, not just the features. These prompts help you write copy that converts.

---

## Physical Product Description

\`\`\`
Write a product description for [product name].

Context:
- Product: [what is it, materials, specs]
- Target customer: [who buys this?]
- Key benefits: [top 3 benefits]
- Price point: [budget / mid-range / premium]
- Brand voice: [tone]

Structure:
1. Emotional hook (connect to customer desire or pain)
2. Key benefits (3-5 bullet points, benefit-first)
3. Features and specs (concise list)
4. Social proof (who loves this product?)
5. Call to action (why buy now?)

Make it feel premium but accessible. No generic phrases like "high quality."
\`\`\`

---

## Digital Product Description

\`\`\`
Write a product description for a digital product: [product name].

Context:
- What is it: [e-book / template / course / etc.]
- Who it's for: [ideal customer]
- What they'll achieve: [specific outcome]
- What's included: [modules, files, bonuses]
- Format: [PDF, video, Notion, etc.]

Structure:
1. Promise (what will they be able to do after?)
2. Who this is for (and not for)
3. What's inside (detailed breakdown)
4. Bonuses (if any)
5. Price and guarantee
6. CTA

Focus on the transformation, not just the content.
\`\`\`

---

## Service Description

\`\`\`
Write a service description for [service name].

Context:
- What I do: [service description]
- Who it's for: [ideal client]
- Process: [how it works, timeline]
- Results: [what clients get]
- Pricing model: [hourly / package / retainer]
- What makes me different: [unique angle]

Structure:
1. Who I help and what I do
2. The problem I solve
3. How I solve it (process overview)
4. What's included
5. Results and testimonials
6. How to get started
\`\`\`

---

## E-commerce Collection Description

\`\`\`
Write a collection/category page description for [collection name] in my [type of store].

Context:
- What's in this collection: [product types]
- Who shops this collection: [customer profile]
- Vibe/aesthetic: [description]
- Key selling points: [what makes these products special]

Write 2-3 paragraphs that set the mood and encourage browsing.
\`\`\`

---

*Remember: Features tell, benefits sell. Always connect features to the customer's life.*`,
    },
    {
      title: "Content Idea Generator",
      description: "Never run out of content ideas again",
      category: "prompts",
      emoji: "🤖",
      body: `# Content Idea Generator

## How to Use These Prompts

Writer's block is real. These prompts generate endless content ideas tailored to your niche, audience, and goals — so you never stare at a blank page again.

---

## Monthly Content Ideas

\`\`\`
Generate 30 content ideas for [month] for my [platform].

Context:
- My niche/topic: [what do I talk about?]
- My audience: [who am I creating for?]
- Content pillars: [3-5 main topics I cover]
- My goal: [grow audience / drive sales / build authority / engage community]

Requirements:
- Mix of formats: educational, personal story, behind-the-scenes, engagement, promotional
- Each idea should include: title/hook + format suggestion + why it works
- Vary between quick wins and deeper content
- Include 3-5 seasonal or trending angle ideas
\`\`\`

---

## Content Pillar Expander

\`\`\`
Take my content pillar "[pillar name]" and generate 15 specific content ideas.

Context:
- This pillar is about: [description]
- Why my audience cares: [what's in it for them?]
- I want content that: [educates / entertains / inspires / converts]

For each idea, give me: the hook, the angle, and the format.
\`\`\`

---

## Repurpose Content

\`\`\`
I have a piece of content: [describe content — e.g., "a blog post about X"].

Give me 10 ways to repurpose this into different formats and platforms. For each suggestion:
- What platform is it for?
- What format should it take?
- What's the hook/angle?

Make sure each repurposed piece stands on its own — don't just say "post the link."
\`\`\`

---

## Trending Content Angles

\`\`\`
Based on my niche [describe niche], suggest 10 content ideas that could tap into current trends or conversations.

For each idea:
- What's the trend or conversation?
- How can I authentically connect it to my niche?
- What's my unique take?

I don't want to chase every trend — just the ones where I have something genuine to add.
\`\`\`

---

## Engaging Question Prompts

\`\`\`
Generate 20 engaging questions I can post on [platform] to spark conversation with my audience.

Context:
- My niche: [description]
- My audience: [description]
- Goal: [engagement / market research / community building]

Questions should be easy to answer, interesting, and relevant to my audience's lives.
\`\`\`

---

*Bookmark this page. Run a prompt whenever you need fresh ideas. Consistency beats perfection.*`,
    },
  ]);
}
