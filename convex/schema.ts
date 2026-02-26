import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(), // Clerk Subject ID
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    lastSeen: v.number(),
  }).index("by_token", ["tokenIdentifier"]),

  conversations: defineTable({
    participantIds: v.array(v.id("users")),
    isGroup: v.boolean(),
    name: v.optional(v.string()),
    updatedAt: v.number(),
  }),

  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    hasUnread: v.boolean(),
    unreadCount: v.optional(v.number()),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"])
    .index("by_user_conversation", ["userId", "conversationId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.string(), // "text", "image", "system"
    status: v.optional(v.string()), // "sent", "delivered", "read"
    isDeleted: v.optional(v.boolean()),
    reactions: v.optional(
      v.array(
        v.object({
          emoji: v.string(),
          userIds: v.array(v.id("users")),
        }),
      ),
    ),
  }).index("by_conversation", ["conversationId"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_conversation_user", ["conversationId", "userId"]),
});
