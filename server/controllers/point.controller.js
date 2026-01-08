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
    console.log("================Body================:", req.body);
    console.log("Map ID:", req.params.mapId);
    console.log("User ID:", req.userId);

    const { category, x, y, pX, pY, name, description, color, icon, size } = req.body;

    // Validate required fields
    if (x === undefined || y === undefined || pX === undefined || pY === undefined || !category) {
      return res.status(400).send("Missing required fields");
    }

    console.log("mapId:", req.params.mapId);
    console.log("ownerId:", req.userId);

    // Verify map ownership
    const map = await Map.findOne({
      _id: req.params.mapId,
      ownerId: req.userId,
    });

    console.log("map is: ", map);

    if (!map) {
      return res.status(404).send("Map not found");
    }

    // Create point with all fields
    const point = await Point.create({
      mapId: map._id,
      category,
      x,
      y,
      pX,
      pY,
      name: name || "",
      description: description || "",
      color: color || "#ff0000",
      icon: icon || category,
      size: size || 10,
      createdBy: req.userId,
    });

    res.status(201).json(point);
  } catch (err) {
    console.error("createPoint error:", err);
    res.status(500).send("Failed to create point -- controller");
  }
};

/* =========================
   UPDATE POINT
========================= */
export const updatePoint = async (req, res) => {
  try {
    console.log("📝 Update point request:");
    console.log("Point ID:", req.params.id);
    console.log("Body:", req.body);
    console.log("User ID:", req.userId);

    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).send("Point not found");
    }

    // Verify map ownership
    const map = await Map.findOne({
      _id: point.mapId,
      ownerId: req.userId,
    });

    if (!map) {
      return res.status(403).send("Unauthorized");
    }

    // Update allowed fields
    const allowedFields = [
      'category', 'x', 'y', 'pX', 'pY',
      'name', 'description', 'color', 'icon', 'size'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        point[field] = req.body[field];
      }
    });

    await point.save();

    console.log("✅ Point updated:", point);

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
    console.log("🗑️ Delete point request:");
    console.log("Point ID:", req.params.id);
    console.log("User ID:", req.userId);

    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).send("Point not found");
    }

    // Verify map ownership
    const map = await Map.findOne({
      _id: point.mapId,
      ownerId: req.userId,
    });

    if (!map) {
      return res.status(403).send("Unauthorized");
    }

    await point.deleteOne();

    console.log("✅ Point deleted");

    res.sendStatus(204);
  } catch (err) {
    console.error("deletePoint error:", err);
    res.status(500).send("Failed to delete point");
  }
};