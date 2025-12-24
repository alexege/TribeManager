import express from "express";
import Tribe from "../models/Tribe.js";

const router = express.Router();

/* -------------------------
   GET ALL TRIBES
------------------------- */
router.get("/", async (req, res) => {
  try {
    const tribes = await Tribe.find().sort({ createdAt: 1 });
    res.json(tribes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tribes" });
  }
});

/* -------------------------
   CREATE TRIBE
------------------------- */
router.post("/", async (req, res) => {
  try {
    const tribe = await Tribe.create({
      name: req.body.name,
    });

    res.status(201).json(tribe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* -------------------------
   UPDATE TRIBE
------------------------- */
router.put("/:id", async (req, res) => {
  try {
    const tribe = await Tribe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tribe) {
      return res.status(404).json({ message: "Tribe not found" });
    }

    res.json(tribe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* -------------------------
   DELETE TRIBE
------------------------- */
router.delete("/:id", async (req, res) => {
  try {
    const tribe = await Tribe.findByIdAndDelete(req.params.id);

    if (!tribe) {
      return res.status(404).json({ message: "Tribe not found" });
    }

    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
