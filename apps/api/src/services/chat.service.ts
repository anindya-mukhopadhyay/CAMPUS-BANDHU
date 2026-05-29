import ChatModel from "../models/chat.model";
import MessageModel from "../models/message.model";

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  const conversationId = [senderId, receiverId].sort().join("_");
  
  const message = await MessageModel.create({
    conversationId,
    senderId,
    receiverId,
    content,
    timestamp: new Date(),
    status: "sent"
  });

  // Update conversation metadata
  await ChatModel.findOneAndUpdate(
    { conversationId },
    {
      conversationId,
      $addToSet: { participants: [senderId, receiverId] },
      $set: {
        lastMessage: content,
        lastMessageAt: new Date()
      }
    },
    { upsert: true, new: true }
  );

  return message.toJSON();
}

export async function getConversations(userId: string) {
  const conversations = await ChatModel.find({
    participants: userId
  }).sort({ lastMessageAt: -1 });
  
  return conversations.map(doc => doc.toJSON());
}

export async function getMessages(conversationId: string, limit = 50) {
  const messages = await MessageModel.find({
    conversationId
  })
  .sort({ timestamp: -1 })
  .limit(limit);
  
  return messages.map(doc => doc.toJSON()).reverse();
}
