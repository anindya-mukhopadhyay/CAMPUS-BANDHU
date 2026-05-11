import { z } from "zod";

import { firestore } from "../config/firebase-admin";

const listingsRef = firestore.collection("marketplace");

const listingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.string().min(2),
  price: z.number().nonnegative()
});

export async function listMarketplace(): Promise<Record<string, unknown>[]> {
  const snapshot = await listingsRef.orderBy("createdAt", "desc").limit(50).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function createListing(payload: unknown, sellerId: string): Promise<Record<string, unknown>> {
  const parsed = listingSchema.parse(payload);
  const listing = {
    ...parsed,
    sellerId,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const created = await listingsRef.add(listing);
  return { id: created.id, ...listing };
}

export async function markListingSold(id: string): Promise<Record<string, unknown>> {
  const docRef = listingsRef.doc(id);
  await docRef.update({ status: "sold", updatedAt: new Date().toISOString() });
  return { id, status: "sold" };
}

export async function updateListing(id: string, payload: Partial<z.infer<typeof listingSchema>>, sellerId: string): Promise<Record<string, unknown>> {
  const docRef = listingsRef.doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) throw new Error("Listing not found");
  if (doc.data()?.sellerId !== sellerId) throw new Error("Unauthorized to update this listing");

  const updateData = {
    ...payload,
    updatedAt: new Date().toISOString()
  };

  await docRef.update(updateData);
  return { id, ...doc.data(), ...updateData };
}

export async function deleteListing(id: string, sellerId: string): Promise<void> {
  const docRef = listingsRef.doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) throw new Error("Listing not found");
  if (doc.data()?.sellerId !== sellerId) throw new Error("Unauthorized to delete this listing");

  await docRef.delete();
}

