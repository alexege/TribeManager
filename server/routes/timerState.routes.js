import express from "express";
import { getTimerState, upsertTimerState } from "../controllers/timerState.controller.js";

const router = express.Router();

router.get("/", getTimerState);
router.post("/", upsertTimerState);

export default router;
