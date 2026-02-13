import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    gmail: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: t[(true, "password is required")],
    },
    coverImage: {
      type: String,
    },
    refreshTokens: {
      type: string,
    },
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },

  { timestamps: true },
);

export const User = mongoose.model("User", UserSchema);
