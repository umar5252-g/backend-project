import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    throw new ApiError(400, "Tweet content is required");
  }
  const tweet = new Tweet({
    content: content.trim(),
    owner: req.user._id,
  });
  await tweet.save();
  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }
  if (req.user._id.toString() !== userId) {
    throw new ApiError(403, "Forbidden: cannot access another user's tweets");
  }
  const tweets = await Tweet.find({ owner: userId }).populate("owner");
  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { content, tweetId } = req.body;
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden: cannot update another user's tweet");
  }
  tweet.content = content.trim();
  await tweet.save();
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
