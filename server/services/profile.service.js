import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ----------------------------------
   GET PROFILE
---------------------------------- */
export const getProfileByUserId = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  return user;
};

/* ----------------------------------
   UPLOAD PROFILE PICTURE
---------------------------------- */
export const uploadProfilePictureForUser = async (userId, file) => {
  if (!file) {
    throw new Error("NO_FILE_UPLOADED");
  }

  const user = await User.findById(userId);
  if (!user) {
    fs.unlinkSync(file.path);
    throw new Error("USER_NOT_FOUND");
  }

  // Remove old profile picture
  if (user.profilePicture) {
    const oldFilePath = path.join(__dirname, "..", user.profilePicture);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  const profilePicturePath = `/uploads/profile-pictures/${file.filename}`;
  user.profilePicture = profilePicturePath;
  await user.save();

  return profilePicturePath;
};

/* ----------------------------------
   REMOVE PROFILE PICTURE
---------------------------------- */
export const removeProfilePictureForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.profilePicture) {
    const filePath = path.join(__dirname, "..", user.profilePicture);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  user.profilePicture = null;
  await user.save();
};
