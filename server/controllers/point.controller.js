import Point from "../models/Point.js";
import Map from "../models/Map.js";

/* =========================
   GET POINTS BY MAP
========================= */
export const getPointsByMap = async (req, res) => {
  try {
    const map = await Map.findOne({
      _id: req.params.mapId,
      ownerId: req.userId,
    });

    if (!map) {
      return res.status(404).send("Map not found");
    }

    const points = await Point.find({ mapId: map._id }).sort({
      createdAt: -1,
    });

    res.json(points);
  } catch (err) {
    console.error("getPointsByMap error:", err);
    res.status(500).send("Failed to fetch points");
  }
};

/* =========================
   CREATE POINT
========================= */
export const createPoint = async (req, res) => {
  try {
    console.log("📍 Create point request:");
    console.log("Body:", req.body);
    console.log("Map ID:", req.params.mapId);
    console.log("User ID:", req.userId);

    const { category, x, y, label, notes } = req.body;

    if (x === undefined || y === undefined || !category) {
      return res.status(400).send("Missing required fields");
    }

    const map = await Map.findOne({
      _id: req.params.mapId,
      ownerId: req.userId,
    });

    console.log("map is: ", map);

    if (!map) {
      return res.status(404).send("Map not found");
    }

    const point = await Point.create({
      mapId: map._id,
      category,
      x,
      y,
      label,
      notes,
      createdBy: req.userId,
    });

    res.status(201).json(point);
  } catch (err) {
    console.error("createPoint error:", err);
    res.status(500).send("Failed to create point");
  }
};

/* =========================
   UPDATE POINT
========================= */
export const updatePoint = async (req, res) => {
  try {
    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).send("Point not found");
    }

    const map = await Map.findOne({
      _id: point.mapId,
      ownerId: req.userId,
    });

    if (!map) {
      return res.status(403).send("Unauthorized");
    }

    Object.assign(point, req.body);
    await point.save();

    res.json(point);
  } catch (err) {
    console.error("updatePoint error:", err);
    res.status(500).send("Failed to update point");
  }
};

/* =========================
   DELETE POINT
========================= */
export const deletePoint = async (req, res) => {
  try {
    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).send("Point not found");
    }

    const map = await Map.findOne({
      _id: point.mapId,
      ownerId: req.userId,
    });

    if (!map) {
      return res.status(403).send("Unauthorized");
    }

    await point.deleteOne();
    res.sendStatus(204);
  } catch (err) {
    console.error("deletePoint error:", err);
    res.status(500).send("Failed to delete point");
  }
};
