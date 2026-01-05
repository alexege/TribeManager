import express from "express";
import {
  getMaps,
  createMap,
  updateMap,
  deleteMap,
} from "../controllers/map.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
console.log("requireAuth imported:", typeof requireAuth); // Should be 'function'

const router = express.Router();

/* All map routes require auth */
router.use(requireAuth);

router.get("/", getMaps);
router.post("/", createMap);
router.put("/:id", updateMap);
router.delete("/:id", deleteMap);

export default router;
