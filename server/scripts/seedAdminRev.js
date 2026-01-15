import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env explicitly
dotenv.config({ path: path.resolve(__dirname, "../../server/.env") });

export const seedAdmin = async () => {
  try {
    const email = "alexege@gmail.com".toLowerCase();

    // 1. Check if the admin already exists
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("ℹ️ Admin already exists, skipping seed.");
      return;
    }

    // 2. Prepare the new admin data
    const password = "asdfasdf";
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminData = {
      name: "Alex",
      email,
      password: hashedPassword,
      roles: ["admin", "moderator", "user"],
      level: 105,
      isActive: true,
    };

    // 3. Create the user
    await User.create(adminData);

    console.log("✅ Admin user seeded successfully");
  } catch (err) {
    console.error("❌ Admin seeding failed:", err.message);
    // Depending on how you call this, you might not want to exit the process here
    // but rather throw the error or just log it.
  }
};

// Logic to run standalone if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");
      await mongoose.connect(process.env.MONGO_URI);
      await seedAdmin();
      await mongoose.disconnect();
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })();
}