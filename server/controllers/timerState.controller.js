import TimerState from "../models/TimerState.js";

const DEFAULT_KEY = "default";

export const getTimerState = async (_req, res) => {
  try {
    const state =
      (await TimerState.findOne({ stateKey: DEFAULT_KEY }).lean()) || null;

    if (!state) {
      return res.json({ categories: [], widgets: [] });
    }

    const { categories = [], widgets = [] } = state;
    return res.json({ categories, widgets });
  } catch (error) {
    console.error("Failed to fetch timer state", error);
    return res.status(500).json({ message: "Failed to fetch timer state" });
  }
};

export const upsertTimerState = async (req, res) => {
  try {
    const { categories = [], widgets = [] } = req.body || {};

    const state = await TimerState.findOneAndUpdate(
      { stateKey: DEFAULT_KEY },
      { categories, widgets, stateKey: DEFAULT_KEY },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    // Broadcast latest state to connected clients
    const io = req.app.get("io");
    if (io) {
      io.emit("timer:state", { categories: state.categories, widgets: state.widgets });
    }

    return res.json({
      categories: state.categories || [],
      widgets: state.widgets || [],
    });
  } catch (error) {
    console.error("Failed to save timer state", error);
    return res.status(500).json({ message: "Failed to save timer state" });
  }
};
