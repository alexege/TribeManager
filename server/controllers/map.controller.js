import Map from "../models/Map.js";

/* =========================
   GET ALL MAPS (USER)
========================= */
export const getMaps = async (req, res) => {
  try {
    const maps = await Map.find({
      ownerId: req.userId,
    }).sort({ createdAt: -1 });

    res.json(maps);
  } catch (err) {
    console.error("getMaps error:", err);
    res.status(500).send("Failed to fetch maps");
  }
};

/* =========================
   CREATE MAP
========================= */
export const createMap = async (req, res) => {
  try {
    const { baseMapName, title, img } = req.body;

    if (!baseMapName || !title || !img) {
      return res.status(400).send("Missing required fields");
    }

    const map = await Map.create({
      baseMapName,
      title,
      img,
      ownerId: req.userId,
    });

    res.status(201).json(map);
  } catch (err) {
    console.error("createMap error:", err);
    res.status(500).send("Failed to create map");
  }
};

/* =========================
   UPDATE MAP
========================= */
export const updateMap = async (req, res) => {
  try {
    const map = await Map.findOneAndUpdate(
      {
        _id: req.params.id,
        ownerId: req.userId,
      },
      req.body,
      { new: true }
    );

    if (!map) {
      return res.status(404).send("Map not found");
    }

    res.json(map);
  } catch (err) {
    console.error("updateMap error:", err);
    res.status(500).send("Failed to update map");
  }
};

/* =========================
   DELETE MAP
========================= */
export const deleteMap = async (req, res) => {
  try {
    const map = await Map.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.userId,
    });

    if (!map) {
      return res.status(404).send("Map not found");
    }

    // NOTE: Points cleanup happens here (important)
    await import("../models/Point.js").then(({ default: Point }) =>
      Point.deleteMany({ mapId: map._id })
    );

    res.sendStatus(204);
  } catch (err) {
    console.error("deleteMap error:", err);
    res.status(500).send("Failed to delete map");
  }
};
