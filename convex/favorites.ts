import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggle = mutation({
  args: { platformId: v.id("platforms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ message: "Not authenticated", code: "UNAUTHENTICATED" });

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new ConvexError({ message: "User not found", code: "NOT_FOUND" });

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_platform", (q) =>
        q.eq("userId", user._id).eq("platformId", args.platformId)
      )
      .unique();

    const platform = await ctx.db.get(args.platformId);
    if (!platform) throw new ConvexError({ message: "Platform not found", code: "NOT_FOUND" });

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.platformId, {
        favoritesCount: Math.max(0, platform.favoritesCount - 1),
      });
      return false;
    } else {
      await ctx.db.insert("favorites", { userId: user._id, platformId: args.platformId });
      await ctx.db.patch(args.platformId, {
        favoritesCount: platform.favoritesCount + 1,
      });
      return true;
    }
  },
});

export const getUserFavorites = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [];

    const favs = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return favs.map((f) => f.platformId);
  },
});
