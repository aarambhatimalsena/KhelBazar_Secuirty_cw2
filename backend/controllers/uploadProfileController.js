// backend/controllers/uploadProfileController.js
import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

/**
 * @desc    Upload a profile image to Cloudinary and update user
 * @route   PUT /api/users/profile/upload
 * @access  Private
 */
export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image file uploaded");
  }

  // Upload image to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "profile_images",
    use_filename: true,
    unique_filename: false,
  });

  // ✅ Use req.user.id (from authMiddleware)
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.profileImage = result.secure_url;
  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    profileImage: updatedUser.profileImage,
  });
});

/**
 * @desc    Delete profile image (reset to blank)
 * @route   DELETE /api/users/profile/image
 * @access  Private
 */
export const deleteProfileImage = asyncHandler(async (req, res) => {
  // ✅ Same here: use req.user.id
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.profileImage = "";
  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    profileImage: "",
  });
});
