import {
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  contact: varchar("contact", { length: 160 }).notNull(),
  interest: varchar("interest", { length: 80 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Key–value store for editable site content (managed via /admin). */
export const settings = pgTable("settings", {
  key: varchar("key", { length: 40 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Prototype articles for the in-app Portal-Hub demo (not the live portal-hub.online backend). */
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 220 }).notNull(),
  category: varchar("category", { length: 40 }).notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  source: varchar("source", { length: 120 }).notNull().default("Portal-Hub"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
