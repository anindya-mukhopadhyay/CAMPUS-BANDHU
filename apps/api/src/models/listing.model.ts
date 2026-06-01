import { Schema, model, Types } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IListing {
  _id?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  sellerId: string;
  sellerName?: string;
  condition?: string; // e.g. 'New', 'Like New', 'Good', 'Fair'
  status: string; // 'active', 'sold', 'available'
  imageUrl?: string;
  image?: string; // Compatibility
  createdAt?: Date;
  updatedAt?: Date;
}

const listingSchema = new Schema<IListing>(
  {
    _id: { type: String, default: () => new Types.ObjectId().toString() },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    sellerId: { type: String, required: true },
    sellerName: { type: String },
    condition: { type: String, default: "Good" },
    status: { type: String, default: "active" }, // 'active', 'sold', 'available'
    imageUrl: { type: String },
    image: { type: String } // Compatibility field
  },
  schemaOptions
);

listingSchema.pre("save", function (this: any) {
  // Sync image / imageUrl
  if (this.imageUrl && !this.image) {
    this.image = this.imageUrl;
  }
  if (!this.imageUrl && this.image) {
    this.imageUrl = this.image;
  }
  // Normalize status
  if (this.status === "available") {
    this.status = "active";
  }
});

export const ListingModel = model<IListing>("Listing", listingSchema);
export default ListingModel;
