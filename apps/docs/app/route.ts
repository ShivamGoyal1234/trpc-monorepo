import { ApiReference } from "@scalar/nextjs-api-reference";

export const GET = ApiReference({
  url: "/openapi.json",
  theme: "purple",
  metaData: {
    title: "FormCraft API",
    description:
      "Type-safe form builder API — authentication, forms, public submission, and analytics.",
  },
});
