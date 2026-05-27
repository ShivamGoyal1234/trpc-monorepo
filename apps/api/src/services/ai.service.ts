import { createHash } from "node:crypto";

import { GeneratedFormSchema } from "@repo/schemas";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { z } from "zod";

import { redis } from "../lib/redis";

type GeneratedForm = z.infer<typeof GeneratedFormSchema>;

const CACHE_TTL = 60 * 60 * 24;
const CACHE_PREFIX = "ai:generate:";

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

function cacheKey(prompt: string, fieldCount: number): string {
  const hash = createHash("sha256")
    .update(`${prompt.trim().toLowerCase()}:${fieldCount}`)
    .digest("hex");
  return `${CACHE_PREFIX}${hash}`;
}

export function toTitleCase(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function createPromptAwareFallback(
  prompt: string,
  fieldCount: number,
): GeneratedForm {
  const lower = prompt.toLowerCase();
  const title = `${toTitleCase(prompt.replace(/[^a-z0-9\s]/gi, " ")) || "Custom"} Form`;
  const description = `Generated from your prompt: ${prompt.slice(0, 180)}`;

  const fields: GeneratedForm["fields"] = [
    {
      type: "short_text",
      label: "Full Name",
      required: true,
      placeholder: "Jane Doe",
    },
    {
      type: "email",
      label: "Email Address",
      required: true,
      placeholder: "jane@example.com",
    },
  ];

  if (/(feedback|review|satisfaction|experience)/.test(lower)) {
    fields.push({
      type: "rating",
      label: "Overall Rating",
      required: true,
      description: "Rate from 1 to 5",
    });
    fields.push({
      type: "long_text",
      label: "Detailed Feedback",
      required: false,
      placeholder: "Share your thoughts...",
    });
  } else if (/(event|booking|appointment|meeting)/.test(lower)) {
    fields.push({
      type: "date",
      label: "Preferred Date",
      required: true,
    });
    fields.push({
      type: "time",
      label: "Preferred Time",
      required: true,
    });
  } else if (/(job|hiring|candidate|application)/.test(lower)) {
    fields.push({
      type: "short_text",
      label: "Current Role",
      required: true,
    });
    fields.push({
      type: "long_text",
      label: "Why are you a good fit?",
      required: true,
    });
  } else {
    fields.push({
      type: "short_text",
      label: "Primary Response",
      required: true,
      placeholder: "Your answer",
    });
    fields.push({
      type: "long_text",
      label: "Additional Details",
      required: false,
      placeholder: "Optional context",
    });
  }

  while (fields.length < fieldCount) {
    fields.push({
      type: "short_text",
      label: `Question ${fields.length + 1}`,
      required: fields.length % 2 === 0,
      placeholder: "Your answer",
    });
  }

  return {
    title,
    description,
    suggestedTheme: "corporate-clean",
    fields: fields.slice(0, fieldCount),
  };
}

export const aiService = {
  async generateForm(
    prompt: string,
    fieldCount: number,
  ): Promise<GeneratedForm> {
    const key = cacheKey(prompt, fieldCount);

    try {
      const cached = await redis.get(key);
      if (cached) {
        return GeneratedFormSchema.parse(JSON.parse(cached));
      }
    } catch {
      // Continue without cache
    }

    const client = getOpenAIClient();
    if (!client) {
      return createPromptAwareFallback(prompt, fieldCount);
    }

    try {
      const completion = await client.beta.chat.completions.parse({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a form design expert. Generate professional form structures with appropriate field types.",
          },
          {
            role: "user",
            content: `Create a form based on: "${prompt}". Include exactly ${fieldCount} fields.`,
          },
        ],
        response_format: zodResponseFormat(
          GeneratedFormSchema,
          "generated_form",
        ),
      });

      const parsed = completion.choices[0]?.message.parsed;
      if (!parsed) {
        return createPromptAwareFallback(prompt, fieldCount);
      }

      const normalized = {
        ...parsed,
        fields: parsed.fields.slice(0, fieldCount),
      };

      try {
        await redis.setex(key, CACHE_TTL, JSON.stringify(normalized));
      } catch {
        // Ignore cache errors
      }

      return normalized;
    } catch {
      return createPromptAwareFallback(prompt, fieldCount);
    }
  },

  async improveField(
    fieldLabel: string,
    fieldType: string,
    instruction: string,
  ): Promise<{
    label: string;
    description: string | null;
    placeholder: string | null;
    required: boolean;
  }> {
    const client = getOpenAIClient();
    if (!client) {
      return {
        label: fieldLabel,
        description: `Improved: ${instruction}`,
        placeholder: null,
        required: true,
      };
    }

    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Improve form field copy. Return JSON with label, description, placeholder, required.",
          },
          {
            role: "user",
            content: `Field type: ${fieldType}\nCurrent label: ${fieldLabel}\nInstruction: ${instruction}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message.content;
      if (!content) {
        throw new Error("No response");
      }

      const parsed = JSON.parse(content) as {
        label?: string;
        description?: string | null;
        placeholder?: string | null;
        required?: boolean;
      };

      return {
        label: parsed.label ?? fieldLabel,
        description: parsed.description ?? null,
        placeholder: parsed.placeholder ?? null,
        required: parsed.required ?? true,
      };
    } catch {
      return {
        label: fieldLabel,
        description: instruction,
        placeholder: null,
        required: true,
      };
    }
  },

  async suggestFields(
    formTitle: string,
    formDescription: string | null,
    topic?: string,
  ): Promise<
    Array<{
      type: string;
      label: string;
      required: boolean;
      description?: string | null;
    }>
  > {
    const client = getOpenAIClient();
    const fallback = [
      { type: "short_text", label: "Name", required: true },
      { type: "email", label: "Email", required: true },
      { type: "long_text", label: "Comments", required: false },
    ];

    if (!client) {
      return fallback;
    }

    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              'Suggest 3-5 form fields as JSON array under key "fields". Each item: type, label, required, optional description.',
          },
          {
            role: "user",
            content: `Form: ${formTitle}\nDescription: ${formDescription ?? ""}\nTopic: ${topic ?? "general"}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message.content;
      if (!content) {
        return fallback;
      }

      const parsed = JSON.parse(content) as {
        fields?: Array<{
          type: string;
          label: string;
          required: boolean;
          description?: string | null;
        }>;
      };

      return parsed.fields?.length ? parsed.fields : fallback;
    } catch {
      return fallback;
    }
  },
};
