import Category from "../models/Category.js";

const defaultCategories = [
  { name: "Farming" },
  { name: "Todo" },
  { name: "Planning" },
  { name: "Misc" },
  { name: "Resources" },
];

export const seedCategories = async () => {
  try {

    const existingCategories = await Category.findOne({ name: 'All' });
    if (existingCategories) {
        console.log("ℹ️ Categories already exist, skipping seed.")
        return;
    }

    for (const cat of defaultCategories) {
      await Category.updateOne(
        { name: cat.name },     // match condition
        { $setOnInsert: cat },  // only insert if missing
        { upsert: true }
      );
    }

    console.log("✅ Categories seeded successfully");
  } catch (err) {
    console.error("❌ Category seeding failed:", err.message);
  }
};