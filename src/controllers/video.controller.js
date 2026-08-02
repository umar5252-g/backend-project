import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const videos = await Video.find({})
    .skip((page - 1) * limit)
    .limit(limit);

  if (!videos) {
    throw new ApiError(404, "No videos found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const videoLocalPath = req.files?.video?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  const uploadedVideo = await uploadOnCloudinary(videoLocalPath);
  if (!uploadedVideo?.url) {
    throw new ApiError(400, "Error while uploading video");
  }

  const newVideo = await Video.create({
    title,
    description,
    videoFile: uploadedVideo.url,
    thumbnail: "",
    owner: req.user._id,
    duration: 0,
    isPublished: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video created successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "username fullName email avatar",
  );
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const updateFields = {};
  if (req.body.title !== undefined) updateFields.title = req.body.title;
  if (req.body.description !== undefined)
    updateFields.description = req.body.description;
  if (req.body.thumbnail !== undefined)
    updateFields.thumbnail = req.body.thumbnail;

  const video = await Video.findOneAndUpdate(
    { _id: videoId, owner: req.user._id },
    {
      $set: updateFields,
    },
    { new: true },
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id,
  });
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findOne({ _id: videoId, owner: req.user._id });
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  video.isPublished = !video.isPublished;
  await video.save();
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status toggled successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
