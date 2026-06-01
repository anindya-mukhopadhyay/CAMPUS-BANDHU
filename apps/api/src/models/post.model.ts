import { Schema, model, Types } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IComment {
  _id?: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt?: Date;
}

export interface IPost {
  _id?: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  image?: string;
  likes: number;
  likesCount?: number;
  likedBy: string[];
  comments: number;
  commentsCount?: number;
  commentsList: IComment[];
  createdAt?: Date;
  updatedAt?: Date;
}

const commentSchema = new Schema<IComment>(
  {
    _id: { type: String, default: () => new Types.ObjectId().toString() },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const postSchema = new Schema<IPost>(
  {
    _id: { type: String, default: () => new Types.ObjectId().toString() },
    content: { type: String, required: true, maxlength: 2000 },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String },
    authorRole: { type: String, default: "student" },
    image: { type: String },
    likes: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    comments: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    commentsList: [commentSchema],
  },
  schemaOptions
);

postSchema.pre("save", function (this: any) {
  // Sync like counts
  const likeCount = this.likedBy?.length || 0;
  this.likes = likeCount;
  this.likesCount = likeCount;

  // Sync comment counts
  const commentCount = this.commentsList?.length || 0;
  this.comments = commentCount;
  this.commentsCount = commentCount;
});

export const PostModel = model<IPost>("Post", postSchema);
export default PostModel;
