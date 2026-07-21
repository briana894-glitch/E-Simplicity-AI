import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";

// --- Types ---

export interface BlueprintSection {
  title: string;
  icon: string;
  content: unknown;
}

export interface BlueprintContent {
  executiveSummary: string;
  launchRoadmap: {
    phase1: { title: string; days: string; items: string[] };
    phase2: { title: string; days: string; items: string[] };
    phase3: { title: string; days: string; items: string[] };
    phase4: { title: string; days: string; items: string[] };
  };
  customerAvatar: {
    demographics: string;
    psychographics: string;
    painPoints: string;
    platforms: string;
    buyingTriggers: string;
  };
  brandMessaging: {
    uvp: string;
    brandVoice: { tone: string; personality: string; dos: string[]; donts: string[] };
    elevatorPitch: string;
    taglines: string[];
  };
  marketingStrategy: {
    channels: string[];
    contentPillars: { title: string; description: string }[];
    calendar30Day: { week: number; focus: string; posts: { platform: string; idea: string }[] }[];
    leadMagnet: string;
  };
  emailSequences: {
    welcome: { subject: string; body: string }[];
    nurture: { subject: string; body: string }[];
    sales: { subject: string; body: string }[];
  };
  salesFunnel: {
    topOfFunnel: string;
    middleOfFunnel: string;
    bottomOfFunnel: string;
    keyOffers: string[];
  };
  launchChecklist: { category: string; items: string[] }[];
  growthMilestones: {
    day30: string[];
    day60: string[];
    day90: string[];
    keyMetrics: string[];
  };
}

// --- Helper ---

function validateToken(token: string): number {
  if (!token) throw new Error("Authentication required");
  const session = db.getUserBySessionToken(token);
  if (!session) throw new Error("Session expired or invalid");
  return session.userId;
}

// --- AI Prompt Builder ---

function buildSystemPrompt(): string {
  return `You are a world-class business strategist and launch coach. You create detailed, personalized Business Blueprints for entrepreneurs.

Your tone: encouraging, practical, and specific. NEVER give generic advice — always reference the user's specific inputs. Focus on actionable steps, not theory. Include specific platform suggestions (e.g., "Post Instagram Reels about X" not "use social media"). Format for readability: short paragraphs, bullet points, clear headers.

You must respond with valid JSON matching this exact structure:

{
  "executiveSummary": "string (2-3 paragraphs)",
  "launchRoadmap": {
    "phase1": { "title": "Foundation", "days": "Days 1-7", "items": ["3-5 specific action items"] },
    "phase2": { "title": "Build", "days": "Days 8-30", "items": ["3-5 specific action items"] },
    "phase3": { "title": "Launch", "days": "Days 31-60", "items": ["3-5 specific action items"] },
    "phase4": { "title": "Grow", "days": "Days 61-90", "items": ["3-5 specific action items"] }
  },
  "customerAvatar": {
    "demographics": "string (detailed description)",
    "psychographics": "string (values, fears, desires)",
    "painPoints": "string (specific challenges)",
    "platforms": "string (where they spend time)",
    "buyingTriggers": "string (what makes them buy)"
  },
  "brandMessaging": {
    "uvp": "string (1-2 sentences)",
    "brandVoice": { "tone": "string", "personality": "string", "dos": ["3-5 do's"], "donts": ["3-5 don'ts"] },
    "elevatorPitch": "string (30-second pitch)",
    "taglines": ["3-5 tagline options"]
  },
  "marketingStrategy": {
    "channels": ["2-4 specific platforms"],
    "contentPillars": [{"title": "string", "description": "string"}, ...],
    "calendar30Day": [{"week": 1, "focus": "string", "posts": [{"platform": "string", "idea": "string"}, ...]}, ...],
    "leadMagnet": "string (specific to their audience)"
  },
  "emailSequences": {
    "welcome": [{"subject": "string", "body": "string"}, ...],
    "nurture": [{"subject": "string", "body": "string"}, ...],
    "sales": [{"subject": "string", "body": "string"}, ...]
  },
  "salesFunnel": {
    "topOfFunnel": "string",
    "middleOfFunnel": "string",
    "bottomOfFunnel": "string",
    "keyOffers": ["2-3 specific offers"]
  },
  "launchChecklist": [
    {"category": "Pre-Launch", "items": ["5-7 items"]},
    {"category": "Launch Week", "items": ["5-7 items"]},
    {"category": "Post-Launch", "items": ["4-6 items"]}
  ],
  "growthMilestones": {
    "day30": ["3-4 targets"],
    "day60": ["3-4 targets"],
    "day90": ["3-4 targets"],
    "keyMetrics": ["4-6 metrics to track"]
  }
}`;
}

function buildUserPrompt(answers: Record<string, unknown>): string {
  const businessName = answers.businessName || "the business";
  return `Create a personalized Business Blueprint based on this entrepreneur's Project Brief answers:

BUSINESS IDEA: ${answers.businessIdea || "Not specified"}
PROBLEM IT SOLVES: ${answers.problemSolved || "Not specified"}
WHY NOW: ${answers.whyNow || "Not specified"}
OFFERING TYPE: ${answers.offeringType || "Not specified"}
OFFERING DESCRIPTION: ${answers.offeringDescription || "Not specified"}
DELIVERY METHOD: ${answers.deliveryMethod || "Not specified"}
IDEAL CUSTOMER: ${answers.idealCustomer || "Not specified"}
WHERE THEY SPEND TIME: ${JSON.stringify(answers.customerPlatforms || [])}
CUSTOMER CHALLENGE: ${answers.customerChallenge || "Not specified"}
BUSINESS NAME: ${answers.businessName || "Not specified"}
BRAND PERSONALITY: ${JSON.stringify(answers.brandPersonality || [])}
WHAT MAKES THEM DIFFERENT: ${answers.differentiation || "Not specified"}
CUSTOMER FEELING: ${answers.customerFeeling || "Not specified"}
PRIMARY GOAL (6 months): ${answers.primaryGoal || "Not specified"}
REVENUE TARGET: ${answers.revenueTarget || "Not specified"}
WEEKLY TIME: ${answers.weeklyTime || "Not specified"}
BIGGEST FEAR: ${answers.biggestFear || "Not specified"}

Remember: be specific, actionable, and reference their exact inputs throughout. Use "${businessName}" as the business name. Return ONLY valid JSON — no markdown, no extra text.`;
}

// --- Demo Blueprint Generator (no API key required) ---

function generateDemoBlueprint(answers: Record<string, unknown>): BlueprintContent {
  const biz = (answers.businessName as string) || "your business";
  const idea = (answers.businessIdea as string) || "your idea";
  const audience = (answers.idealCustomer as string) || "your target audience";
  const offering = (answers.offeringDescription as string) || idea;
  const diff = (answers.differentiation as string) || "your unique approach";
  const personality = (answers.brandPersonality as string[]) || [];
  const platforms = (answers.customerPlatforms as string[]) || [];
  const feeling = (answers.customerFeeling as string) || "confident and supported";
  const challenge = (answers.customerChallenge as string) || "finding reliable solutions";

  const primaryPlatform = platforms.length > 0 ? platforms[0] : "Instagram";
  const secondaryPlatform = platforms.length > 1 ? platforms[1] : "LinkedIn";
  const personalityStr = personality.length > 0 ? personality.join(", ") : "professional and friendly";

  return {
    executiveSummary: `${biz} is poised to make an impact by ${idea.slice(0, 100).toLowerCase()}.\n\nYou're building something that matters — and you're not alone. Based on everything you've shared, you have a clear vision and a real understanding of who you're serving: ${audience}.\n\nThis Blueprint is your personalized launch guide. It breaks down exactly what to do over the next 90 days, from building your foundation to growing your audience and generating revenue. Every recommendation here is tailored to your specific business, audience, and goals. Let's make it happen.`,

    launchRoadmap: {
      phase1: {
        title: "Foundation",
        days: "Days 1-7",
        items: [
          `Finalize your business name ("${biz}") and register your domain`,
          `Set up your ${primaryPlatform} and ${secondaryPlatform} business profiles`,
          "Create a simple one-page website or landing page with a waitlist signup",
          "Draft your UVP and elevator pitch (see Brand Messaging section)",
          "Set up a business email (e.g., hello@yourdomain.com)",
        ],
      },
      phase2: {
        title: "Build",
        days: "Days 8-30",
        items: [
          `Develop your core offering: ${offering.slice(0, 80)}`,
          `Create 2-3 pieces of content for ${primaryPlatform} that speak directly to ${audience}`,
          "Set up payment processing and define your pricing",
          "Build your lead magnet and email capture system",
          "Network with 10-15 potential customers or collaborators for feedback",
        ],
      },
      phase3: {
        title: "Launch",
        days: "Days 31-60",
        items: [
          `Launch your offer on ${primaryPlatform} with a clear call-to-action`,
          "Run your email welcome sequence to new subscribers (see Email Sequences)",
          `Post consistently on ${primaryPlatform} (3-5x/week) focused on your content pillars`,
          "Reach out to 5 potential partners or affiliates for cross-promotion",
          "Collect testimonials or social proof from early customers",
        ],
      },
      phase4: {
        title: "Grow",
        days: "Days 61-90",
        items: [
          "Analyze what's working — double down on top-performing content and channels",
          "Optimize your sales funnel based on conversion data",
          "Launch a referral program or limited-time offer to drive growth",
          "Expand to an additional marketing channel based on audience feedback",
          "Set your next 90-day goals and plan your first product/service expansion",
        ],
      },
    },

    customerAvatar: {
      demographics: `${audience} represents your ideal customer. Based on your input, they're likely active on ${primaryPlatform} and ${secondaryPlatform}, tech-savvy, and value-driven in their purchasing decisions.`,
      psychographics: `Your audience values authenticity and results. They want to feel ${feeling}. They may fear wasting time or money on solutions that don't work, and they're drawn to brands that understand their specific situation.`,
      painPoints: `Primary challenge: ${challenge}. They've likely tried generic solutions that didn't address their specific needs. They need a provider who speaks their language and delivers consistent results.`,
      platforms: `Your audience spends time on: ${platforms.join(", ") || "Instagram, LinkedIn"}. Focus your content efforts where they already are — don't try to be everywhere at once.`,
      buyingTriggers: "They buy when they see social proof (testimonials, case studies), when they feel understood by a brand's messaging, and when the offer clearly solves their specific pain point with minimal risk. Offer a guarantee or trial to reduce friction.",
    },

    brandMessaging: {
      uvp: `${biz} helps ${audience} achieve [their desired outcome] through ${diff.toLowerCase()}.`,
      brandVoice: {
        tone: `${personalityStr.charAt(0).toUpperCase() + personalityStr.slice(1)} — every piece of content should reflect this`,
        personality: `Your brand voice is ${personalityStr}. Lean into this consistently across all channels.`,
        dos: [
          "Be specific and actionable — give your audience steps they can take today",
          "Share behind-the-scenes content to build trust and relatability",
          `Stay true to your ${personalityStr} personality in every post`,
          "Use storytelling to connect emotionally with your audience",
        ],
        donts: [
          "Don't use jargon or corporate speak — keep it conversational",
          "Don't post without a clear call-to-action or takeaway",
          "Don't copy competitors' voice — your authenticity is your edge",
          "Don't go silent — consistency builds trust",
        ],
      },
      elevatorPitch: `I help ${audience} who struggle with ${challenge.toLowerCase()}. Unlike other options, ${diff.toLowerCase()}. The result? ${feeling}.`,
      taglines: [
        `${biz} — where ${diff.slice(0, 40).toLowerCase()} meets results`,
        `Helping ${audience} ${feeling.toLowerCase()}`,
        `${biz}: ${diff.slice(0, 50)}`,
        `Your partner in [outcome]`,
        `Finally, a solution that gets it.`,
      ],
    },

    marketingStrategy: {
      channels: [primaryPlatform, secondaryPlatform, "Email"],
      contentPillars: [
        { title: "Education", description: `Teach your audience something valuable about ${idea.slice(0, 60)}` },
        { title: "Behind the Scenes", description: `Show how ${biz} works — humanize your brand and build trust` },
        { title: "Social Proof", description: "Share testimonials, results, and customer stories" },
        { title: "Personal Story", description: "Share your journey — why you started, what drives you" },
      ],
      calendar30Day: [
        {
          week: 1,
          focus: "Brand Introduction",
          posts: [
            { platform: primaryPlatform, idea: `Introduce ${biz} — share your story and mission` },
            { platform: secondaryPlatform, idea: "Post about the problem you solve and why it matters" },
            { platform: primaryPlatform, idea: "Behind-the-scenes of building your offer" },
          ],
        },
        {
          week: 2,
          focus: "Education & Value",
          posts: [
            { platform: primaryPlatform, idea: "3 mistakes your audience makes (and how to avoid them)" },
            { platform: secondaryPlatform, idea: "Share a quick win or tip related to your niche" },
            { platform: primaryPlatform, idea: "Customer spotlight or testimonial (even if it's a beta tester)" },
          ],
        },
        {
          week: 3,
          focus: "Building Desire",
          posts: [
            { platform: primaryPlatform, idea: "Before/after or transformation story" },
            { platform: secondaryPlatform, idea: "Poll: What's your biggest struggle with [topic]?" },
            { platform: primaryPlatform, idea: "Sneak peek of your offer — create anticipation" },
          ],
        },
        {
          week: 4,
          focus: "Call to Action",
          posts: [
            { platform: primaryPlatform, idea: "Launch announcement with clear CTA" },
            { platform: secondaryPlatform, idea: "Limited-time offer or bonus for first customers" },
            { platform: primaryPlatform, idea: "Live Q&A or AMA about your offer" },
          ],
        },
      ],
      leadMagnet: `Create a free resource that solves one specific problem for ${audience} — e.g., a checklist, mini-course, template, or guide. Use it to grow your email list.`,
    },

    emailSequences: {
      welcome: [
        { subject: `Welcome to ${biz} — here's your free gift! 🎉`, body: "Deliver the lead magnet, introduce yourself warmly, and set expectations for what they'll receive from you. End with a question to encourage replies." },
        { subject: "The story behind " + biz, body: `Share your personal journey — why you started ${biz}, what drives you. Connect emotionally and build trust.` },
        { subject: "The #1 mistake [audience] makes", body: "Provide genuine value. Solve a problem. Show that you understand them. No pitch — just help." },
        { subject: "Here's how I can help you", body: "Introduce your offer naturally. Explain who it's for, what it does, and how it changes things. Include a clear CTA." },
      ],
      nurture: [
        { subject: "Quick tip: [specific actionable advice]", body: "Short, value-packed email. One tip they can use in 5 minutes. Keep them engaged between offers." },
        { subject: "What [successful person] taught me about [topic]", body: "Storytelling email that reinforces your expertise and relatability. Connect the lesson back to their situation." },
        { subject: "You asked, I answered (FAQs)", body: "Address common objections or questions about your offer. Build confidence and reduce risk perception." },
        { subject: "A small win to celebrate 🎉", body: "Share a win (yours or a customer's). Positivity builds momentum and keeps subscribers opening your emails." },
      ],
      sales: [
        { subject: `Ready to [desired outcome]?`, body: "Direct offer email. Recap the problem, present your solution, share social proof, and include a strong CTA with urgency (if genuine)." },
        { subject: "Last chance: [offer deadline if applicable]", body: "Scarcity email. Remind them what they'll miss. Reinforce value. Clear, single CTA." },
      ],
    },

    salesFunnel: {
      topOfFunnel: `Attract ${audience} through consistent content on ${primaryPlatform} and ${secondaryPlatform}. Use your lead magnet to capture emails.`,
      middleOfFunnel: `Nurture leads with your email welcome and nurture sequences. Share social proof, case studies, and educational content that builds trust and demonstrates your expertise.`,
      bottomOfFunnel: `Convert with a clear, risk-reduced offer. Use your sales email sequence, a time-limited bonus, and direct calls-to-action. Follow up personally with warm leads.`,
      keyOffers: ["Core product/service launch offer", "Limited-time founding member pricing", "Referral discount for early customers"],
    },

    launchChecklist: [
      {
        category: "Pre-Launch",
        items: [
          "Finalize business name and register domain",
          "Set up social media profiles with consistent branding",
          "Build simple landing page with email capture",
          "Create lead magnet (PDF, template, mini-course)",
          "Set up email marketing platform and sequences",
          "Develop your core offer and pricing",
          "Create 2 weeks of launch content in advance",
        ],
      },
      {
        category: "Launch Week",
        items: [
          "Announce launch across all social channels",
          "Send launch email to your list",
          "Post daily launch content (stories, reels, posts)",
          "Engage with every comment and DM promptly",
          "Host a live Q&A or launch event",
          "Follow up personally with warm leads",
          "Track conversions and engagement metrics daily",
        ],
      },
      {
        category: "Post-Launch",
        items: [
          "Send thank-you messages to first customers",
          "Collect and showcase testimonials",
          "Analyze what worked and what didn't",
          "Plan next month's content based on launch data",
          "Check in with customers for feedback and retention",
          "Set next growth milestone targets",
        ],
      },
    ],

    growthMilestones: {
      day30: [
        "Complete your brand setup and online presence",
        "Publish your first 10 pieces of content",
        "Grow email list to first 50 subscribers",
        "Get feedback from 5-10 potential customers",
      ],
      day60: [
        "Launch your offer and secure first 5-10 paying customers",
        "Reach 200+ followers/subscribers on primary platform",
        "Achieve first month of consistent revenue",
        "Collect 3-5 testimonials or case studies",
      ],
      day90: [
        "Optimize and scale your best-performing channel",
        "Hit 50+ email subscribers with 30%+ open rate",
        "Generate consistent monthly revenue (even if small)",
        "Launch referral program or second offer",
      ],
      keyMetrics: [
        "Email subscribers and open rate",
        "Social media follower growth and engagement rate",
        "Website/landing page traffic and conversion rate",
        "Monthly recurring revenue (MRR)",
        "Customer acquisition cost (if running paid ads)",
      ],
    },
  };
}

// --- Main Server Functions ---

// Generate a blueprint (called after brief submission)
export const generateBlueprint = createServerFn()
  .validator(
    (data: unknown) => {
      const d = data as { token: string; briefId: number };
      if (!d.token || !d.briefId) throw new Error("Token and brief ID are required");
      return d;
    }
  )
  .handler(async ({ data }) => {
    const userId = validateToken(data.token);
    const brief = db.getBriefById(data.briefId);
    if (!brief || brief.user_id !== userId) {
      throw new Error("Brief not found");
    }

    const answers = JSON.parse(brief.answers || "{}");
    const title = `${answers.businessName || "My Business"} — Business Blueprint`;

    // Check if blueprint already exists for this brief
    const existing = db.getBlueprintByBriefId(data.briefId);
    if (existing) {
      return {
        blueprintId: existing.id,
        status: existing.status,
        content: existing.status === "complete" ? JSON.parse(existing.content) : null,
      };
    }

    // Create blueprint record
    const blueprint = db.createBlueprint(userId, data.briefId, title);

    // Generate blueprint — try AI first, fall back to demo
    const apiKey = process.env.OPENAI_API_KEY;
    let content: BlueprintContent;
    let isDemo = false;

    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: buildSystemPrompt() },
              { role: "user", content: buildUserPrompt(answers) },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const json = await response.json() as {
          choices: [{ message: { content: string } }];
        };
        const rawContent = json.choices[0].message.content;

        // Try to parse JSON from response (handle markdown code fences)
        let parsed: BlueprintContent;
        const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          parsed = JSON.parse(rawContent);
        }

        content = parsed;
      } catch (err: any) {
        console.error("AI generation failed, using demo blueprint:", err.message);
        content = generateDemoBlueprint(answers);
        isDemo = true;
      }
    } else {
      content = generateDemoBlueprint(answers);
      isDemo = true;
    }

    // Add demo flag if applicable
    const finalContent = { ...content, _isDemo: isDemo };

    // Store the blueprint
    db.updateBlueprintContent(
      blueprint.id,
      title,
      JSON.stringify(finalContent),
      "complete"
    );

    return {
      blueprintId: blueprint.id,
      status: "complete",
      content: finalContent,
    };
  });

// Get a single blueprint
export const getBlueprint = createServerFn()
  .validator(
    (data: unknown) => {
      const d = data as { token: string; blueprintId: number };
      if (!d.token || !d.blueprintId) throw new Error("Token and blueprint ID are required");
      return d;
    }
  )
  .handler(async ({ data }) => {
    const userId = validateToken(data.token);
    const bp = db.getBlueprintById(data.blueprintId);
    if (!bp || bp.user_id !== userId) {
      throw new Error("Blueprint not found");
    }
    return {
      id: bp.id,
      briefId: bp.brief_id,
      title: bp.title,
      status: bp.status,
      content: JSON.parse(bp.content || "{}"),
      createdAt: bp.created_at,
    };
  });

// List all blueprints for a user
export const listBlueprints = createServerFn()
  .validator((data: unknown) => data as { token: string })
  .handler(async ({ data }) => {
    const userId = validateToken(data.token);
    const blueprints = db.listBlueprints(userId);
    return blueprints.map((bp) => ({
      id: bp.id,
      briefId: bp.brief_id,
      title: bp.title,
      status: bp.status,
      createdAt: bp.created_at,
    }));
  });

// Poll blueprint status (for async generation)
export const pollBlueprintStatus = createServerFn()
  .validator(
    (data: unknown) => {
      const d = data as { token: string; blueprintId: number };
      if (!d.token || !d.blueprintId) throw new Error("Token and blueprint ID are required");
      return d;
    }
  )
  .handler(async ({ data }) => {
    const userId = validateToken(data.token);
    const bp = db.getBlueprintById(data.blueprintId);
    if (!bp || bp.user_id !== userId) {
      throw new Error("Blueprint not found");
    }
    return {
      status: bp.status,
      content: bp.status === "complete" ? JSON.parse(bp.content || "{}") : null,
    };
  });
