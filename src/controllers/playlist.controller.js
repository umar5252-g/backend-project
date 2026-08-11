import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new ApiError(400, "Playlist name is required");
  }

  const normalizedName = name.trim();
  const findPlaylist = await Playlist.findOne({
    name: normalizedName,
    owner: req.user._id,
  });
  if (findPlaylist) {
    throw new ApiError(400, "Playlist with this name already exists");
  }

  const playList = new Playlist({
    name: normalizedName,
    description: description?.trim() || "",
    videos: [],
    owner: req.user._id,
  });
  await playList.save();

  return res
    .status(201)
    .json(new ApiResponse(201, playList, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (req.user._id.toString() !== userId) {
    throw new ApiError(
      403,
      "Forbidden: cannot access another user's playlists",
    );
  }

  const playlists = await Playlist.find({ owner: userId }).populate("videos");

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const playlist = await Playlist.findById(playlistId).populate("videos");
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden: you do not own this playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden: you do not own this playlist");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const videoAlreadyAdded = playlist.videos.some(
    (id) => id.toString() === videoId,
  );
  if (videoAlreadyAdded) {
    throw new ApiError(400, "Video already exists in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully"),
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden: you do not own this playlist");
  }

  const videoExists = playlist.videos.some((id) => id.toString() === videoId);
  if (!videoExists) {
    throw new ApiError(404, "Video not found in playlist");
  }

  playlist.videos.pull(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Video removed from playlist successfully",
      ),
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden: you do not own this playlist");
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!deletedPlaylist) {
    throw new ApiError(500, "Error deleting playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully"),
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  if (playlist.owner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden: you do not own this playlist");
  }

  if (!name && description === undefined) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const updates = {};
  if (name) {
    const normalizedName = name.trim();
    const existingPlaylist = await Playlist.findOne({
      name: normalizedName,
      owner: req.user._id,
      _id: { $ne: playlistId },
    });
    if (existingPlaylist) {
      throw new ApiError(400, "Playlist with this name already exists");
    }
    updates.name = normalizedName;
  }
  if (description !== undefined) {
    updates.description = description?.trim() || "";
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    updates,
    { new: true, runValidators: true },
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"),
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
