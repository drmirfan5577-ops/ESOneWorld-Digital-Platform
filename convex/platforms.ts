import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let platforms = await ctx.db.query("platforms").collect();

    if (args.category && args.category !== "All") {
      platforms = platforms.filter((p) => p.category === args.category);
    }

    if (args.search) {
      const q = args.search.toLowerCase();
      platforms = platforms.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return platforms;
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("platforms")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("platforms")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const platforms = await ctx.db.query("platforms").collect();
    const cats = new Set(platforms.map((p) => p.category));
    return Array.from(cats).sort();
  },
});
