import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const parsedPage = Number.isNaN(parseInt(page, 10))
    ? 1
    : Math.max(parseInt(page, 10), 1);
  const parsedLimit = Number.isNaN(parseInt(limit, 10))
    ? 10
    : Math.max(parseInt(limit, 10), 1);

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 })
    .skip((parsedPage - 1) * parsedLimit)
    .limit(parsedLimit);

  const totalComments = await Comment.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        totalComments,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalComments / parsedLimit),
      },
      "Comments fetched successfully",
    ),
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  if (!content) {
    throw new ApiError(400, "content is required");
  }

  const comment = new Comment({
    video: videoId,
    owner: req.user._id,
    content,
  });
  await comment.save();

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "comment added successfully"));
});
const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(400, "commentId is required");
  }

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  if (!content) {
    throw new ApiError(400, "content is required");
  }

  const comment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      owner: req.user._id,
    },
    { content },
    { new: true },
  );

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
