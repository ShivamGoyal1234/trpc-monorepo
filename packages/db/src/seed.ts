import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "./index";
import {
  answers,
  fields,
  formAnalytics,
  forms,
  responses,
  themes,
  users,
} from "./schema";

const BROWSERS = ["Chrome", "Firefox", "Safari", "Edge"];
const OS_LIST = ["Windows", "macOS", "Linux", "iOS", "Android"];
const DEVICES = ["desktop", "mobile", "tablet"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomEmail(): string {
  const names = ["alex", "jordan", "sam", "taylor", "casey", "riley", "morgan"];
  return `${pick(names)}${Math.floor(Math.random() * 9999)}@example.com`;
}

function randomIp(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

async function main() {
  console.log("🌊 Seeding FormCraft Deep Station database...");

  await db.delete(answers);
  await db.delete(responses);
  await db.delete(fields);
  await db.delete(formAnalytics);
  await db.delete(forms);
  await db.delete(themes);
  await db.delete(users);

  const demoHash = await bcrypt.hash("Demo@1234", 12);
  const adminHash = await bcrypt.hash("Admin@1234", 12);

  const [demoUser] = await db
    .insert(users)
    .values({
      email: "demo@formcraft.io",
      name: "Dr. Marina Deep",
      hashedPassword: demoHash,
      emailVerified: true,
      role: "user",
    })
    .returning();

  await db.insert(users).values({
    email: "admin@formcraft.io",
    name: "Commander Abyss",
    hashedPassword: adminHash,
    emailVerified: true,
    role: "admin",
  });

  if (!demoUser) throw new Error("Failed to create demo user");

  const systemThemes = [
    {
      name: "Midnight Hacker",
      description: "Dark terminal aesthetic",
      config: {
        primaryColor: "#00ff41",
        backgroundColor: "#0d0d0d",
        textColor: "#e0e0e0",
        accentColor: "#00cc33",
        cardColor: "#1a1a1a",
        borderColor: "#00ff4133",
        fontFamily: "'JetBrains Mono', monospace",
        borderRadius: "4px",
        buttonStyle: "sharp",
      },
    },
    {
      name: "Sakura Bloom",
      description: "Soft pink Japanese-inspired",
      config: {
        primaryColor: "#e91e8c",
        backgroundColor: "#fff5f9",
        textColor: "#2d1b2e",
        accentColor: "#ff6bb3",
        cardColor: "#ffffff",
        borderColor: "#f8bbd9",
        fontFamily: "'Noto Sans JP', sans-serif",
        borderRadius: "20px",
        buttonStyle: "pill",
      },
    },
    {
      name: "Retro Arcade",
      description: "Neon 80s gaming vibes",
      config: {
        primaryColor: "#ffff00",
        backgroundColor: "#120458",
        textColor: "#ffffff",
        accentColor: "#ff00ff",
        cardColor: "#1a0870",
        borderColor: "#ff00ff44",
        fontFamily: "'Press Start 2P', monospace",
        borderRadius: "0px",
        buttonStyle: "sharp",
      },
    },
    {
      name: "Corporate Clean",
      description: "Professional business look",
      config: {
        primaryColor: "#0066cc",
        backgroundColor: "#f8fafc",
        textColor: "#1e293b",
        accentColor: "#0052a3",
        cardColor: "#ffffff",
        borderColor: "#e2e8f0",
        fontFamily: "'Inter', sans-serif",
        borderRadius: "8px",
        buttonStyle: "rounded",
      },
    },
    {
      name: "Forest Deep",
      description: "Natural green tones",
      config: {
        primaryColor: "#2d6a4f",
        backgroundColor: "#f0f7f4",
        textColor: "#1b2d23",
        accentColor: "#40916c",
        cardColor: "#ffffff",
        borderColor: "#b7e4c7",
        fontFamily: "'Lora', serif",
        borderRadius: "12px",
        buttonStyle: "rounded",
      },
    },
    {
      name: "Sunset Gradient",
      description: "Warm sunset colors",
      config: {
        primaryColor: "#f4845f",
        backgroundColor: "#fff8f5",
        textColor: "#2d1b0e",
        accentColor: "#e05c34",
        cardColor: "#ffffff",
        borderColor: "#fcd5be",
        fontFamily: "'Poppins', sans-serif",
        borderRadius: "16px",
        buttonStyle: "pill",
      },
    },
  ];

  const insertedThemes = await db
    .insert(themes)
    .values(
      systemThemes.map((t) => ({
        ...t,
        isSystem: true,
        userId: null,
      })),
    )
    .returning();

  const themeByName = Object.fromEntries(
    insertedThemes.map((t) => [t.name, t]),
  );

  type FieldDef = {
    type: (typeof fields.$inferInsert)["type"];
    label: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    validation?: Record<string, unknown>;
  };

  type FormDef = {
    title: string;
    description: string;
    slug: string;
    status: "published" | "draft" | "archived";
    visibility: "public" | "unlisted";
    themeName: string;
    fieldDefs: FieldDef[];
    responseCount: number;
    analytics: {
      totalViews: number;
      totalResponses: number;
      completionRate: string;
      avgCompletionTime: number;
    };
    answerGenerator: (
      field: FieldDef,
      fieldId: string,
    ) => string | number | boolean | string[];
  };

  const formDefs: FormDef[] = [
    {
      title: "The Matrix Simulation Survey",
      description:
        "Have you ever questioned the nature of your reality?",
      slug: "matrix-simulation-survey",
      status: "published",
      visibility: "public",
      themeName: "Midnight Hacker",
      responseCount: 45,
      analytics: {
        totalViews: 312,
        totalResponses: 45,
        completionRate: "71.20",
        avgCompletionTime: 187,
      },
      fieldDefs: [
        {
          type: "rating",
          label: "How real does this feel to you right now?",
          required: true,
          validation: { max: 10 },
        },
        {
          type: "select",
          label: "Which pill do you choose?",
          required: true,
          options: [
            { value: "red", label: "Red Pill — I want the truth" },
            { value: "blue", label: "Blue Pill — Ignorance is bliss" },
          ],
        },
        {
          type: "short_text",
          label: "What is your real name (not your matrix name)?",
          required: true,
        },
        {
          type: "scale",
          label: "How deep does the rabbit hole go for you?",
          required: true,
          validation: { min: 1, max: 10 },
        },
        {
          type: "multi_select",
          label: "Which aspects of the simulation intrigue you most?",
          options: [
            { value: "deja-vu", label: "Déjà vu" },
            { value: "glitches", label: "Glitches in reality" },
            { value: "dreams", label: "Dreams vs reality" },
            { value: "consciousness", label: "The nature of consciousness" },
            { value: "free-will", label: "Free will" },
          ],
        },
        {
          type: "long_text",
          label: "If you could send one message to Morpheus, what would it say?",
          placeholder: "The answer is out there...",
        },
        {
          type: "email",
          label: "Your contact frequency (email)",
          required: true,
        },
        {
          type: "checkbox",
          label: "I am ready to unplug from the matrix",
          required: true,
        },
      ],
      answerGenerator: (f) => {
        if (f.type === "rating" || f.type === "scale")
          return Math.floor(Math.random() * 10) + 1;
        if (f.type === "select") return pick(f.options ?? [])?.value ?? "red";
        if (f.type === "multi_select")
          return (f.options ?? []).slice(0, 2).map((o) => o.value);
        if (f.type === "checkbox") return true;
        if (f.type === "email") return randomEmail();
        if (f.type === "short_text") return pick(["Neo", "Trinity", "Morpheus"]);
        return "Wake up, Neo...";
      },
    },
    {
      title: "Anime Character Alignment Quiz",
      description: "Discover which anime archetype matches your soul",
      slug: "anime-character-quiz",
      status: "published",
      visibility: "public",
      themeName: "Sakura Bloom",
      responseCount: 38,
      analytics: {
        totalViews: 445,
        totalResponses: 38,
        completionRate: "68.40",
        avgCompletionTime: 143,
      },
      fieldDefs: [
        {
          type: "select",
          label: "What is your favorite anime genre?",
          required: true,
          options: [
            { value: "shonen", label: "Shonen" },
            { value: "isekai", label: "Isekai" },
            { value: "psychological", label: "Psychological" },
          ],
        },
        {
          type: "rating",
          label: "Rate your weeabo power level",
          required: true,
          validation: { max: 10 },
        },
        {
          type: "multi_select",
          label: "Which studios have your heart?",
          required: true,
          options: [
            { value: "mappa", label: "MAPPA" },
            { value: "ghibli", label: "Ghibli" },
            { value: "kyoani", label: "KyoAni" },
          ],
        },
        { type: "short_text", label: "What is your spirit animal in anime form?" },
        {
          type: "number",
          label: "How many episodes have you watched in your life?",
          required: true,
          validation: { min: 0, max: 99999 },
        },
        {
          type: "long_text",
          label: "If you were isekai'd, what would your cheat ability be?",
        },
        {
          type: "email",
          label: "Email for your anilist updates",
          required: true,
        },
      ],
      answerGenerator: (f) => {
        if (f.type === "rating") return Math.floor(Math.random() * 10) + 1;
        if (f.type === "select") return pick(f.options ?? [])?.value ?? "shonen";
        if (f.type === "multi_select")
          return (f.options ?? []).map((o) => o.value);
        if (f.type === "number") return Math.floor(Math.random() * 5000);
        if (f.type === "email") return randomEmail();
        return "Overpowered protagonist";
      },
    },
    {
      title: "Startup Pitch Validator",
      description: "Is your startup idea actually good? Let's find out.",
      slug: "startup-pitch-validator",
      status: "published",
      visibility: "unlisted",
      themeName: "Corporate Clean",
      responseCount: 29,
      analytics: {
        totalViews: 198,
        totalResponses: 29,
        completionRate: "82.10",
        avgCompletionTime: 264,
      },
      fieldDefs: [
        { type: "short_text", label: "Company / Idea name", required: true },
        {
          type: "long_text",
          label: "What problem are you solving? (Be specific)",
          required: true,
          placeholder: "The problem with X is that Y happens when Z...",
        },
        {
          type: "long_text",
          label: "Your solution in 2-3 sentences",
          required: true,
        },
        {
          type: "select",
          label: "Current funding stage",
          required: true,
          options: [
            { value: "pre-seed", label: "Pre-seed" },
            { value: "seed", label: "Seed" },
            { value: "bootstrapped", label: "Bootstrapped" },
          ],
        },
        {
          type: "number",
          label: "Current MRR in USD (0 if pre-revenue)",
          validation: { min: 0 },
        },
        {
          type: "number",
          label: "Team size",
          required: true,
          validation: { min: 1, max: 10000 },
        },
        {
          type: "multi_select",
          label: "Target market segments",
          required: true,
          options: [
            { value: "b2b-saas", label: "B2B SaaS" },
            { value: "fintech", label: "Fintech" },
            { value: "devtools", label: "Developer Tools" },
          ],
        },
        {
          type: "rating",
          label: "How strong is your founder-market fit?",
          required: true,
          validation: { max: 10 },
        },
        { type: "email", label: "Best email to reach you", required: true },
      ],
      answerGenerator: (f) => {
        if (f.type === "rating") return Math.floor(Math.random() * 10) + 1;
        if (f.type === "number") return Math.floor(Math.random() * 100);
        if (f.type === "select") return "seed";
        if (f.type === "multi_select") return ["b2b-saas"];
        if (f.type === "email") return randomEmail();
        return "FormCraft for forms";
      },
    },
    {
      title: "Linux Distro Personality Test",
      description: "Your OS choice reveals your true personality",
      slug: "linux-distro-personality",
      status: "published",
      visibility: "public",
      themeName: "Midnight Hacker",
      responseCount: 52,
      analytics: {
        totalViews: 621,
        totalResponses: 52,
        completionRate: "74.80",
        avgCompletionTime: 112,
      },
      fieldDefs: [
        {
          type: "select",
          label: "What is your current daily driver OS?",
          required: true,
          options: [
            { value: "arch", label: "Arch" },
            { value: "ubuntu", label: "Ubuntu" },
            { value: "macos", label: "macOS" },
          ],
        },
        {
          type: "rating",
          label: "How comfortable are you in a terminal?",
          required: true,
          validation: { max: 10 },
        },
        {
          type: "multi_select",
          label: "Tools you actually use daily",
          options: [
            { value: "vim", label: "vim/neovim" },
            { value: "git", label: "git" },
            { value: "docker", label: "docker" },
          ],
        },
        {
          type: "scale",
          label: "Open source devotion level",
          required: true,
          validation: { min: 1, max: 10 },
        },
        { type: "short_text", label: "What was your first Linux distro?" },
        { type: "email", label: "For your distrowatch newsletter", required: true },
      ],
      answerGenerator: (f) => {
        if (f.type === "rating" || f.type === "scale")
          return Math.floor(Math.random() * 10) + 1;
        if (f.type === "select") return "arch";
        if (f.type === "multi_select") return ["vim", "git"];
        if (f.type === "email") return randomEmail();
        return "Ubuntu 12.04";
      },
    },
    {
      title: "Game Jam Application Form",
      description: "Apply to participate in the 2024 Pixel Pulse Game Jam",
      slug: "game-jam-application",
      status: "published",
      visibility: "unlisted",
      themeName: "Retro Arcade",
      responseCount: 20,
      analytics: {
        totalViews: 134,
        totalResponses: 20,
        completionRate: "90.00",
        avgCompletionTime: 198,
      },
      fieldDefs: [
        { type: "short_text", label: "Game title (or working title)", required: true },
        {
          type: "select",
          label: "Primary engine / framework",
          required: true,
          options: [
            { value: "godot", label: "Godot" },
            { value: "unity", label: "Unity" },
            { value: "phaser", label: "Phaser" },
          ],
        },
        {
          type: "multi_select",
          label: "Game genres (select all that apply)",
          required: true,
          options: [
            { value: "platformer", label: "Platformer" },
            { value: "roguelike", label: "Roguelike" },
            { value: "puzzle", label: "Puzzle" },
          ],
        },
        {
          type: "long_text",
          label: "Describe your game concept in 2-3 sentences",
          required: true,
          validation: { minLength: 50, maxLength: 500 },
        },
        {
          type: "number",
          label: "Team size (including you)",
          required: true,
          validation: { min: 1, max: 5 },
        },
        {
          type: "rating",
          label: "Experience level with your chosen engine",
          required: true,
          validation: { max: 5 },
        },
        { type: "email", label: "Team lead email", required: true },
      ],
      answerGenerator: (f) => {
        if (f.type === "rating") return Math.floor(Math.random() * 5) + 1;
        if (f.type === "number") return Math.floor(Math.random() * 4) + 1;
        if (f.type === "select") return "godot";
        if (f.type === "multi_select") return ["platformer", "puzzle"];
        if (f.type === "email") return randomEmail();
        return "Pixel Quest — A retro platformer where time rewinds on death.";
      },
    },
    {
      title: "Tech Company Culture Fit",
      description: "Find out which big tech company matches your vibe",
      slug: "tech-culture-fit",
      status: "published",
      visibility: "public",
      themeName: "Corporate Clean",
      responseCount: 61,
      analytics: {
        totalViews: 782,
        totalResponses: 61,
        completionRate: "66.30",
        avgCompletionTime: 134,
      },
      fieldDefs: [
        {
          type: "select",
          label: "Which company would you most want to work at?",
          required: true,
          options: [
            { value: "vercel", label: "Vercel" },
            { value: "linear", label: "Linear" },
            { value: "anthropic", label: "Anthropic" },
          ],
        },
        {
          type: "rating",
          label: "How much do you love remote work?",
          required: true,
          validation: { max: 10 },
        },
        {
          type: "multi_select",
          label: "Which perks matter most to you?",
          options: [
            { value: "remote", label: "Remote-first" },
            { value: "pto", label: "Unlimited PTO" },
            { value: "learning", label: "Learning budget" },
          ],
        },
        {
          type: "scale",
          label: "Work-life balance importance",
          required: true,
          validation: { min: 1, max: 10 },
        },
        {
          type: "long_text",
          label: "Describe your dream project in one paragraph",
          placeholder: "I would love to build...",
        },
        { type: "short_text", label: "Your one professional superpower" },
        { type: "email", label: "For your recruiter network", required: true },
      ],
      answerGenerator: (f) => {
        if (f.type === "rating" || f.type === "scale")
          return Math.floor(Math.random() * 10) + 1;
        if (f.type === "select") return "vercel";
        if (f.type === "multi_select") return ["remote", "learning"];
        if (f.type === "email") return randomEmail();
        return "Type-safe everything";
      },
    },
    {
      title: "Hogwarts House Sorting Ceremony",
      description: "The sorting hat speaks through algorithms now",
      slug: "hogwarts-sorting",
      status: "published",
      visibility: "public",
      themeName: "Sakura Bloom",
      responseCount: 88,
      analytics: {
        totalViews: 1204,
        totalResponses: 88,
        completionRate: "79.50",
        avgCompletionTime: 98,
      },
      fieldDefs: [
        {
          type: "multi_select",
          label: "Which values define you most?",
          required: true,
          options: [
            { value: "bravery", label: "Bravery" },
            { value: "wisdom", label: "Wisdom" },
            { value: "ambition", label: "Ambition" },
          ],
        },
        {
          type: "select",
          label: "What is your greatest fear?",
          required: true,
          options: [
            { value: "failure", label: "Failure" },
            { value: "loneliness", label: "Loneliness" },
            { value: "heights", label: "Heights" },
          ],
        },
        {
          type: "rating",
          label: "Rate your ambition from 1-10",
          required: true,
          validation: { max: 10 },
        },
        {
          type: "long_text",
          label: "What would you sacrifice for power?",
          required: true,
          validation: { minLength: 20 },
        },
        { type: "email", label: "Your owl post address", required: true },
      ],
      answerGenerator: (f) => {
        if (f.type === "rating") return Math.floor(Math.random() * 10) + 1;
        if (f.type === "select") return "failure";
        if (f.type === "multi_select") return ["bravery", "wisdom"];
        if (f.type === "email") return randomEmail();
        return "I would sacrifice my comfort zone for knowledge and growth.";
      },
    },
    {
      title: "FormCraft Product Feedback",
      description: "Help us build a better FormCraft for you",
      slug: "formcraft-feedback",
      status: "published",
      visibility: "public",
      themeName: "Forest Deep",
      responseCount: 34,
      analytics: {
        totalViews: 287,
        totalResponses: 34,
        completionRate: "76.50",
        avgCompletionTime: 156,
      },
      fieldDefs: [
        {
          type: "rating",
          label: "Overall satisfaction with FormCraft",
          required: true,
          validation: { max: 10 },
        },
        {
          type: "rating",
          label: "Ease of use rating",
          required: true,
          validation: { max: 5 },
        },
        {
          type: "multi_select",
          label: "Which features do you love most?",
          options: [
            { value: "builder", label: "Form builder" },
            { value: "ai", label: "AI generation" },
            { value: "themes", label: "Themes" },
            { value: "analytics", label: "Analytics" },
          ],
        },
        {
          type: "long_text",
          label: "What should we improve?",
          placeholder: "I wish FormCraft could...",
        },
        {
          type: "select",
          label: "Would you recommend FormCraft to a colleague?",
          required: true,
          options: [
            { value: "definitely", label: "Definitely" },
            { value: "probably", label: "Probably" },
            { value: "not-sure", label: "Not sure" },
          ],
        },
        { type: "email", label: "Email for product updates", required: true },
      ],
      answerGenerator: (f) => {
        if (f.type === "rating")
          return f.label.includes("Ease")
            ? Math.floor(Math.random() * 5) + 1
            : Math.floor(Math.random() * 10) + 1;
        if (f.type === "select") return "definitely";
        if (f.type === "multi_select") return ["builder", "ai", "themes"];
        if (f.type === "email") return randomEmail();
        return "More integrations with Slack and Notion!";
      },
    },
  ];

  for (const formDef of formDefs) {
    const theme = themeByName[formDef.themeName];
    const [form] = await db
      .insert(forms)
      .values({
        userId: demoUser.id,
        title: formDef.title,
        description: formDef.description,
        slug: formDef.slug,
        status: formDef.status,
        visibility: formDef.visibility,
        theme: theme?.config ?? {},
        settings: {
          submitMessage: "Thank you for your response!",
          collectEmail: true,
          allowMultipleResponses: true,
          showProgressBar: true,
        },
        publishedAt: new Date(),
      })
      .returning();

    if (!form) continue;

    await db.insert(formAnalytics).values({
      formId: form.id,
      totalViews: formDef.analytics.totalViews,
      totalResponses: formDef.analytics.totalResponses,
      completionRate: formDef.analytics.completionRate,
      avgCompletionTime: formDef.analytics.avgCompletionTime,
      lastResponseAt: new Date(),
    });

    const insertedFields = await db
      .insert(fields)
      .values(
        formDef.fieldDefs.map((fd, i) => ({
          formId: form.id,
          type: fd.type,
          label: fd.label,
          description: fd.description,
          placeholder: fd.placeholder,
          required: fd.required ?? false,
          order: i + 1,
          options: fd.options,
          validation: fd.validation,
        })),
      )
      .returning();

    for (let r = 0; r < formDef.responseCount; r++) {
      const isComplete = Math.random() > 0.15;
      const fieldsToAnswer = isComplete
        ? insertedFields
        : insertedFields.slice(
            0,
            Math.max(1, Math.floor(insertedFields.length * 0.6)),
          );

      const [response] = await db
        .insert(responses)
        .values({
          formId: form.id,
          respondentEmail: randomEmail(),
          respondentIp: randomIp(),
          userAgent: `Mozilla/5.0 (${pick(OS_LIST)}) ${pick(BROWSERS)}/120.0`,
          completionTime: 60 + Math.floor(Math.random() * 540),
          status: isComplete ? "complete" : "partial",
          metadata: {
            browser: pick(BROWSERS),
            os: pick(OS_LIST),
            device: pick(DEVICES),
            country: pick(["US", "UK", "IN", "DE", "JP"]),
          },
        })
        .returning();

      if (!response) continue;

      for (const field of fieldsToAnswer) {
        const def = formDef.fieldDefs[field.order - 1];
        if (!def) continue;
        const value = formDef.answerGenerator(def, field.id);
        await db.insert(answers).values({
          responseId: response.id,
          fieldId: field.id,
          value,
        });
      }
    }

    console.log(`  ✓ ${formDef.title} (${formDef.responseCount} responses)`);
  }

  console.log("✅ Seed complete!");
  console.log("   Demo: demo@formcraft.io / Demo@1234");
  console.log("   Admin: admin@formcraft.io / Admin@1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
