import { firestore } from "../config/firebase-admin";

const chatsRef = firestore.collection("chats");

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  const conversationId = [senderId, receiverId].sort().join("_");
  
  const message = {
    senderId,
    receiverId,
    content,
    timestamp: new Date().toISOString(),
    status: "sent"
  };

  await chatsRef.doc(conversationId).collection("messages").add(message);
  
  // Update conversation metadata
  await chatsRef.doc(conversationId).set({
    participants: [senderId, receiverId],
    lastMessage: content,
    lastMessageAt: new Date().toISOString()
  }, { merge: true });

  return message;
}

export async function getConversations(userId: string) {
  const snapshot = await chatsRef.where("participants", "array-contains", userId)
    .orderBy("lastMessageAt", "desc")
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getMessages(conversationId: string, limit = 50) {
  const snapshot = await chatsRef.doc(conversationId)
    .collection("messages")
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
}
