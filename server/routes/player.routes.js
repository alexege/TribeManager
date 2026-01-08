import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  deletePlayersByTribe,
} from "../controllers/player.controller.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getPlayers);
router.post("/", createPlayer);
router.put("/:id", updatePlayer);
router.delete("/:id", deletePlayer);
router.delete("/tribe/:tribeId", deletePlayersByTribe);

export default router;
