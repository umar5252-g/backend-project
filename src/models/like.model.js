import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likesSchema = new Schema(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: Comment,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: Video,
    },
  },
  { timestamps: true },
);

export const Like = mongoose.model("Like", likesSchema);
