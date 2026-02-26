import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreate = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const me = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!me) throw new Error("User not found");
    if (me._id === args.otherUserId) throw new Error("Cannot message yourself");

    // Find existing conversation
    const myMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .collect();

    for (const membership of myMemberships) {
      const conversation = await ctx.db.get(membership.conversationId);
      if (
        conversation &&
        conversation.participantIds.includes(args.otherUserId)
      ) {
        return conversation._id;
      }
    }

    // Create new
    const conversationId = await ctx.db.insert("conversations", {
      participantIds: [me._id, args.otherUserId],
      updatedAt: Date.now(),
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: me._id,
      hasUnread: false,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: args.otherUserId,
      hasUnread: false,
    });

    return conversationId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const me = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!me) return [];

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .collect();

    const conversations = await Promise.all(
      memberships.map(async (membership) => {
        const conversation = await ctx.db.get(membership.conversationId);
        if (!conversation) return null;

        // Get the other participant
        const otherUserId = conversation.participantIds.find(
          (id) => id !== me._id,
        )!;
        const otherUser = await ctx.db.get(otherUserId);

        // Get last message
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conversation._id),
          )
          .order("desc")
          .first();

        return {
          id: conversation._id,
          otherUser,
          lastMessage,
          updatedAt: conversation.updatedAt,
          hasUnread: membership.hasUnread,
        };
      }),
    );

    return conversations
      .filter((c) => c !== null)
      .sort((a, b) => b!.updatedAt - a!.updatedAt);
  },
});

export const markRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const me = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!me) return;

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", me._id).eq("conversationId", args.conversationId),
      )
      .unique();

    if (membership && membership.hasUnread) {
      await ctx.db.patch(membership._id, { hasUnread: false });
    }
  },
});
