import express from "express";
import User from "../models/User.js";

const router = express.Router();

/* -------------------------
   GET ALL USERS
------------------------- */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* -------------------------
   CREATE USER
------------------------- */
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* -------------------------
   UPDATE USER
------------------------- */
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* -------------------------
   DELETE USER
------------------------- */
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
