import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (user !== null) {
      // If we've seen this identity before but the name/email/image changed, update the value.
      if (
        user.name !== identity.name ||
        user.email !== identity.email ||
        user.image !== identity.pictureUrl
      ) {
        await ctx.db.patch(user._id, {
          name: identity.name ?? "Anonymous",
          email: identity.email ?? "",
          image: identity.pictureUrl,
          lastSeen: Date.now(),
        });
      }
      return user._id;
    }

    // If it's a new identity, create a new User.
    return await ctx.db.insert("users", {
      tokenIdentifier: identity.subject,
      name: identity.name ?? "Anonymous",
      email: identity.email ?? "",
      image: identity.pictureUrl,
      lastSeen: Date.now(),
    });
  },
});

export const updatePresence = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        lastSeen: Date.now(),
      });
    }
  },
});

export const search = query({
  args: { searchQuery: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!currentUser) return [];

    let users = await ctx.db.query("users").collect();

    // Filter out current user
    users = users.filter((u) => u._id !== currentUser._id);

    // Filter by search query
    if (args.searchQuery.trim().length > 0) {
      const query = args.searchQuery.toLowerCase();
      users = users.filter((u) => u.name.toLowerCase().includes(query));
    }

    // Return users mapped with a computed isOnline boolean (active within last 15s)
    const now = Date.now();
    return users.map((u) => ({
      ...u,
      isOnline: now - u.lastSeen < 15000,
    }));
  },
});
