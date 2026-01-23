import Category from "../models/Category.js";

const defaultCategories = [
  { name: "Bugs" },
  { name: "Feature Request" },
  { name: "Planning" },
  { name: "Issue" },
  { name: "Misc" },
];

export const seedCategories = async () => {
  try {
    const existingCategories = await Category.findOne();
    if (existingCategories) {
      console.log("ℹ️ Categories already exist, skipping seed.");
      return;
    }

    for (const cat of defaultCategories) {
      await Category.updateOne(
        { name: cat.name }, // match condition
        { $setOnInsert: cat }, // only insert if missing
        { upsert: true },
      );
    }

    console.log("✅ Categories seeded successfully");
  } catch (err) {
    console.error("❌ Category seeding failed:", err.message);
  }
};
