import express from "express";
import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  deletePlayersByTribe,
} from "../controllers/player.controller.js";

const router = express.Router();

// Add auth middleware later if you want
router.get("/", getPlayers);
router.post("/", createPlayer);
router.put("/:id", updatePlayer);
router.delete("/:id", deletePlayer);
router.delete("/tribe/:tribeId", deletePlayersByTribe);

export default router;
