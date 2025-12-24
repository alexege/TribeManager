import Player from "../models/Player.js";

export const getPlayers = async (req, res) => {
  const players = await Player.find();
  res.json(players);
};

export const createPlayer = async (req, res) => {
  try {
    const player = await Player.create(req.body);
    res.status(201).json(player);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePlayer = async (req, res) => {
  const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(player);
};

export const deletePlayer = async (req, res) => {
  await Player.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

export const deletePlayersByTribe = async (req, res) => {
  await Player.deleteMany({ tribeId: req.params.tribeId });
  res.json({ success: true });
};
