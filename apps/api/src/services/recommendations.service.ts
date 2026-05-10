import axios from "axios";

import { env } from "../config/env";
import { firestore } from "../config/firebase-admin";

type PersonalizationInput = {
  interests: string[];
  userId: string;
};

export async function getPersonalizedRecommendations(input: PersonalizationInput): Promise<Record<string, unknown>[]> {
  const [eventsSnapshot, opportunitiesSnapshot] = await Promise.all([
    firestore.collection("events").limit(20).get(),
    firestore.collection("opportunities").limit(20).get()
  ]);

  const corpus = [
    ...eventsSnapshot.docs.map((doc) => ({ id: doc.id, type: "event", ...doc.data() })),
    ...opportunitiesSnapshot.docs.map((doc) => ({ id: doc.id, type: "opportunity", ...doc.data() }))
  ];

  const response = await axios.post(`${env.AI_SERVICE_URL}/api/v1/recommendations/personalized`, {
    user_id: input.userId,
    interests: input.interests,
    items: corpus
  });

  return response.data.data as Record<string, unknown>[];
}
