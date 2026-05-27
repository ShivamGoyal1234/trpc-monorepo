import { createTRPCRouter } from "@repo/trpc";

import { adminRouter } from "./routers/admin";
import { aiRouter } from "./routers/ai";
import { analyticsRouter } from "./routers/analytics";
import { authRouter } from "./routers/auth";
import { fieldsRouter } from "./routers/fields";
import { formsRouter } from "./routers/forms";
import { publicRouter } from "./routers/public";
import { responsesRouter } from "./routers/responses";
import { themesRouter } from "./routers/themes";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  forms: formsRouter,
  fields: fieldsRouter,
  responses: responsesRouter,
  analytics: analyticsRouter,
  themes: themesRouter,
  public: publicRouter,
  ai: aiRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
