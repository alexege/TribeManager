import express from "express";
import {
  getPointsByMap,
  createPoint,
  updatePoint,
  deletePoint,
} from "../controllers/point.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/map/:mapId", getPointsByMap);
router.post("/map/:mapId", createPoint);
router.put("/:id", updatePoint);
router.delete("/:id", deletePoint);

export default router;