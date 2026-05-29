import axios from "axios";

import { env } from "../config/env";
import EventModel from "../models/event.model";
import OpportunityModel from "../models/opportunity.model";

type PersonalizationInput = {
  interests: string[];
  userId: string;
};

export async function getPersonalizedRecommendations(input: PersonalizationInput): Promise<Record<string, unknown>[]> {
  const [events, opportunities] = await Promise.all([
    EventModel.find({}).limit(20),
    OpportunityModel.find({}).limit(20)
  ]);

  const corpus = [
    ...events.map((doc) => ({ id: doc.id, type: "event", ...doc.toJSON() })),
    ...opportunities.map((doc) => ({ id: doc.id, type: "opportunity", ...doc.toJSON() }))
  ];

  try {
    const response = await axios.post(`${env.AI_SERVICE_URL}/api/v1/recommendations/personalized`, {
      user_id: input.userId,
      interests: input.interests,
      items: corpus
    });

    return response.data.data as Record<string, unknown>[];
  } catch (error) {
    // If AI service is down/not configured, return a basic intersection or top items as fallback
    const matched = corpus.filter(item => {
      const tags = (item as any).tags || (item as any).skills || [];
      return tags.some((t: string) => input.interests.includes(t));
    });
    
    return matched.length > 0 ? matched : corpus.slice(0, 10);
  }
}
