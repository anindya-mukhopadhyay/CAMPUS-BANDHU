import { Schema, model, Types } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IPost {
  _id?: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole?: string;
  likes: number;
  likesCount?: number; // Compatibility
  comments: number;
  commentsCount?: number; // Compatibility
  createdAt?: Date;
  updatedAt?: Date;
}

const postSchema = new Schema<IPost>(
  {
    _id: { type: String, default: () => new Types.ObjectId().toString() },
    content: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, default: "student" },
    likes: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 }, // Compatibility
    comments: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 } // Compatibility
  },
  schemaOptions
);

postSchema.pre("save", function (this: any, next: any) {
  if (this.likes !== undefined && this.likesCount === 0) {
    this.likesCount = this.likes;
  }
  if (this.likesCount !== undefined && this.likes === 0) {
    this.likes = this.likesCount;
  }
  if (this.comments !== undefined && this.commentsCount === 0) {
    this.commentsCount = this.comments;
  }
  if (this.commentsCount !== undefined && this.comments === 0) {
    this.comments = this.commentsCount;
  }
  next();
});

export const PostModel = model<IPost>("Post", postSchema);
export default PostModel;
