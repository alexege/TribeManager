import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env explicitly (important for seed scripts)
dotenv.config({ path: path.resolve(__dirname, "../../server/.env") });

async function seedAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    const name = "Alex";
    const email = "alexege@gmail.com".toLowerCase(); // match schema behavior
    const password = "asdfasdf";

    // Password is select:false, but we don't need it here
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      roles: ["admin", "moderator", "user"],
      level: 105, // optional but nice for admins
      isActive: true, // explicit for clarity
    });

    console.log("✅ Admin user created successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
