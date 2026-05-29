import { z } from "zod";
import mongoose from "mongoose";
import ListingModel from "../models/listing.model";

const listingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.string().min(2),
  price: z.number().nonnegative(),
  condition: z.string().optional(),
  imageUrl: z.string().optional(),
  image: z.string().optional(),
  id: z.string().optional()
});

export async function listMarketplace(): Promise<Record<string, unknown>[]> {
  const listings = await ListingModel.find({}).sort({ createdAt: -1 }).limit(50);
  return listings.map((doc) => doc.toJSON()) as any;
}

export async function createListing(payload: unknown, sellerId: string): Promise<Record<string, unknown>> {
  const parsed = listingSchema.parse(payload);
  
  const listingId = parsed.id || new mongoose.Types.ObjectId().toString();

  const listing = {
    _id: listingId,
    ...parsed,
    sellerId,
    status: "active"
  };

  const created = await ListingModel.create(listing);
  return created.toJSON() as any;
}

export async function markListingSold(id: string): Promise<Record<string, unknown>> {
  const updated = await ListingModel.findByIdAndUpdate(
    id,
    { $set: { status: "sold" } },
    { new: true }
  );
  
  if (!updated) throw new Error("Listing not found");
  return { id, status: "sold" };
}

export async function updateListing(id: string, payload: Partial<z.infer<typeof listingSchema>>, sellerId: string): Promise<Record<string, unknown>> {
  const listing = await ListingModel.findById(id);
  
  if (!listing) throw new Error("Listing not found");
  if (listing.sellerId !== sellerId) throw new Error("Unauthorized to update this listing");

  const updated = await ListingModel.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true }
  );

  if (!updated) throw new Error("Listing not found");
  return updated.toJSON() as any;
}

export async function deleteListing(id: string, sellerId: string): Promise<void> {
  const listing = await ListingModel.findById(id);
  
  if (!listing) throw new Error("Listing not found");
  if (listing.sellerId !== sellerId) throw new Error("Unauthorized to delete this listing");

  await ListingModel.findByIdAndDelete(id);
}
