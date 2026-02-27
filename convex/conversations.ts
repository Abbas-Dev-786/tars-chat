import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { paginationOptsValidator } from "convex/server";

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

    const now = Date.now();
    // Create new
    const conversationId = await ctx.db.insert("conversations", {
      participantIds: [me._id, args.otherUserId],
      isGroup: false,
      updatedAt: now,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: me._id,
      hasUnread: false,
      unreadCount: 0,
      updatedAt: now,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: args.otherUserId,
      hasUnread: false,
      unreadCount: 0,
      updatedAt: now,
    });

    return conversationId;
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true, continueCursor: "" };

    const me = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!me) return { page: [], isDone: true, continueCursor: "" };

    const paginatedMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user_updatedAt", (q) => q.eq("userId", me._id))
      .order("desc") // newest updated conversations first
      .paginate(args.paginationOpts);

    const conversations = await Promise.all(
      paginatedMemberships.page.map(async (membership) => {
        const conversation = await ctx.db.get(membership.conversationId);
        if (!conversation) return null;

        // Get the other participant
        const otherUserId = conversation.participantIds.find(
          (id) => id !== me._id,
        );
        if (!otherUserId) return null; // skip malformed conversations
        const otherUserDoc = await ctx.db.get(otherUserId);

        // Compute isOnline based on lastSeen
        const otherUser = otherUserDoc
          ? {
              ...otherUserDoc,
              isOnline: Date.now() - otherUserDoc.lastSeen < 15000,
            }
          : null;

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
          unreadCount: membership.unreadCount || 0,
        };
      }),
    );

    return {
      ...paginatedMemberships,
      page: conversations.filter((c) => c !== null),
    };
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

    if (membership && (membership.hasUnread || membership.unreadCount)) {
      await ctx.db.patch(membership._id, { hasUnread: false, unreadCount: 0 });
    }
  },
});
