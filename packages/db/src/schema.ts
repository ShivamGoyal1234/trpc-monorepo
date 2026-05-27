import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const formStatusEnum = pgEnum("form_status", [
  "draft",
  "published",
  "archived",
]);
export const formVisibilityEnum = pgEnum("form_visibility", [
  "public",
  "unlisted",
]);
export const fieldTypeEnum = pgEnum("field_type", [
  "short_text",
  "long_text",
  "email",
  "number",
  "phone",
  "url",
  "date",
  "time",
  "select",
  "multi_select",
  "checkbox",
  "rating",
  "scale",
  "file",
  "matrix",
  "ranking",
  "statement",
]);
export const responseStatusEnum = pgEnum("response_status", [
  "complete",
  "partial",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  image: text("image"),
  hashedPassword: text("hashed_password"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at"),
  },
  (t) => [unique().on(t.provider, t.providerAccountId)],
);

export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  slug: text("slug").unique(),
  status: formStatusEnum("status").default("draft").notNull(),
  visibility: formVisibilityEnum("visibility").default("unlisted").notNull(),
  theme: jsonb("theme").default({}).notNull(),
  settings: jsonb("settings").default({}).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fields = pgTable("fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  type: fieldTypeEnum("type").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  placeholder: text("placeholder"),
  required: boolean("required").default(false).notNull(),
  order: integer("order").notNull(),
  options: jsonb("options"),
  validation: jsonb("validation"),
  conditionalLogic: jsonb("conditional_logic"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const responses = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  respondentEmail: text("respondent_email"),
  respondentIp: text("respondent_ip"),
  userAgent: text("user_agent"),
  completionTime: integer("completion_time"),
  status: responseStatusEnum("status").default("complete").notNull(),
  metadata: jsonb("metadata"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const answers = pgTable("answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  responseId: uuid("response_id")
    .notNull()
    .references(() => responses.id, { onDelete: "cascade" }),
  fieldId: uuid("field_id")
    .notNull()
    .references(() => fields.id, { onDelete: "cascade" }),
  value: jsonb("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const themes = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  isSystem: boolean("is_system").default(false).notNull(),
  config: jsonb("config").notNull(),
  previewImage: text("preview_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const formAnalytics = pgTable("form_analytics", {
  formId: uuid("form_id")
    .primaryKey()
    .references(() => forms.id, { onDelete: "cascade" }),
  totalViews: integer("total_views").default(0).notNull(),
  totalResponses: integer("total_responses").default(0).notNull(),
  completionRate: numeric("completion_rate", { precision: 5, scale: 2 })
    .default("0")
    .notNull(),
  avgCompletionTime: integer("avg_completion_time").default(0).notNull(),
  lastResponseAt: timestamp("last_response_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  forms: many(forms),
  themes: many(themes),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  user: one(users, { fields: [forms.userId], references: [users.id] }),
  fields: many(fields),
  responses: many(responses),
  analytics: one(formAnalytics),
}));

export const fieldsRelations = relations(fields, ({ one, many }) => ({
  form: one(forms, { fields: [fields.formId], references: [forms.id] }),
  answers: many(answers),
}));

export const responsesRelations = relations(responses, ({ one, many }) => ({
  form: one(forms, { fields: [responses.formId], references: [forms.id] }),
  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  response: one(responses, {
    fields: [answers.responseId],
    references: [responses.id],
  }),
  field: one(fields, { fields: [answers.fieldId], references: [fields.id] }),
}));

export const themesRelations = relations(themes, ({ one }) => ({
  user: one(users, { fields: [themes.userId], references: [users.id] }),
}));

export const formAnalyticsRelations = relations(formAnalytics, ({ one }) => ({
  form: one(forms, {
    fields: [formAnalytics.formId],
    references: [forms.id],
  }),
}));
