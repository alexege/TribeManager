import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import tribeRoutes from "./routes/tribe.routes.js";
import playerRoutes from "./routes/player.routes.js";
import mapRoutes from "./routes/map.routes.js";
import pointRoutes from "./routes/point.routes.js";
import todoRoutes from "./routes/todo.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import userRoutes from "./routes/profile.routes.js";
import path from "path";

// Seed functions
import { seedCategories } from "./scripts/seedCategories.js";
import { seedAdmin } from "./scripts/seedAdminRev.js";

dotenv.config();
const app = express();

console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/tribes", tribeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/maps", mapRoutes);
app.use("/api/points", pointRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/profile", userRoutes);
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API is running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    await seedAdmin();
    await seedCategories();

    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error(err));
