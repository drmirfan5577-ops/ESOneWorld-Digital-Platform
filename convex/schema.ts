import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  platforms: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    longDescription: v.optional(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    url: v.string(),
    logoUrl: v.optional(v.string()),
    logoEmoji: v.optional(v.string()),
    logoColor: v.optional(v.string()),
    featured: v.boolean(),
    pricing: v.union(
      v.literal("free"),
      v.literal("freemium"),
      v.literal("paid"),
      v.literal("open-source")
    ),
    favoritesCount: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_featured", ["featured"]),

  favorites: defineTable({
    userId: v.id("users"),
    platformId: v.id("platforms"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_platform", ["userId", "platformId"]),
});
