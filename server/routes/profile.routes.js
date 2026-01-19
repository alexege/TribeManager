import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js"; // multer config

import {
  getProfile,
  uploadProfilePicture,
  removeProfilePicture,
} from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/me", requireAuth, getProfile);
router.post(
  "/me/profile-picture",
  requireAuth,
  upload.single("profilePicture"),
  uploadProfilePicture
);
router.delete("/me/profile-picture", requireAuth, removeProfilePicture);

export default router;
