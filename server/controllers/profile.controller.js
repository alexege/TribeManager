import {
  getProfileByUserId,
  uploadProfilePictureForUser,
  removeProfilePictureForUser,
} from "../services/profile.service.js";

/* ----------------------------------
   GET CURRENT USER PROFILE
---------------------------------- */
export const getProfile = async (req, res) => {
  try {
    const user = await getProfileByUserId(req.user.userId);
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------
   UPLOAD PROFILE PICTURE
---------------------------------- */
export const uploadProfilePicture = async (req, res) => {
  try {
    const profilePictureUrl = await uploadProfilePictureForUser(
      req.user.userId,
      req.file
    );

    res.json({
      message: "Profile picture uploaded successfully",
      profilePictureUrl,
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);

    if (req.file) {
      // Cleanup on failure
      import("fs").then((fs) => fs.unlinkSync(req.file.path));
    }

    if (error.message === "NO_FILE_UPLOADED") {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------
   REMOVE PROFILE PICTURE
---------------------------------- */
export const removeProfilePicture = async (req, res) => {
  try {
    await removeProfilePictureForUser(req.user.userId);
    res.json({ message: "Profile picture removed successfully" });
  } catch (error) {
    console.error("Remove profile picture error:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(500).json({ message: "Server error" });
  }
};
