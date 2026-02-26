import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    return messages;
  },
});

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const me = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!me) throw new Error("User not found");

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: me._id,
      content: args.content.trim(),
    });

    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    });

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return;

    for (const participantId of conversation.participantIds) {
      if (participantId !== me._id) {
        const membership = await ctx.db
          .query("conversationMembers")
          .withIndex("by_user_conversation", (q) =>
            q
              .eq("userId", participantId)
              .eq("conversationId", args.conversationId),
          )
          .unique();
        if (membership) {
          await ctx.db.patch(membership._id, { hasUnread: true });
        }
      }
    }

    // Also clear typing indicator for the sender if it exists
    const typingIndicator = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", me._id),
      )
      .unique();

    if (typingIndicator) {
      // Set expiresAt to 0 to immediately expire it
      await ctx.db.patch(typingIndicator._id, { expiresAt: 0 });
    }
  },
});
