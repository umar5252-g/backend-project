import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "User is not authenticated");
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const [videoStats] = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalVideoViews: { $sum: "$views" },
        videoIds: { $push: "$_id" },
      },
    },
  ]);

  const videoIds = videoStats?.videoIds ?? [];
  const [totalSubscribers, totalLikes] = await Promise.all([
    Subscription.countDocuments({ channel: userId }),
    Like.countDocuments({ video: { $in: videoIds } }),
  ]);

  const stats = {
    totalVideoViews: videoStats?.totalVideoViews ?? 0,
    totalSubscribers,
    totalVideos: videoStats?.totalVideos ?? 0,
    totalLikes,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
});

export { getChannelStats, getChannelVideos };
