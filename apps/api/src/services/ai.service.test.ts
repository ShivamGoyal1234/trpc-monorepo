import { createPromptAwareFallback, toTitleCase } from "./ai.service";
import { describe, it, expect } from "vitest";

describe("ai.service fallback helpers", () => {
  it("builds title case from prompt text", () => {
    expect(toTitleCase("customer feedback survey")).toBe(
      "Customer Feedback Survey",
    );
  });

  it("returns exactly requested number of fields", () => {
    const generated = createPromptAwareFallback("job application form", 6);
    expect(generated.fields).toHaveLength(6);
  });

  it("adapts field mix for feedback prompts", () => {
    const generated = createPromptAwareFallback("restaurant feedback form", 5);
    const types = generated.fields.map((f) => f.type);
    expect(types).toContain("rating");
    expect(types).toContain("long_text");
  });
});
