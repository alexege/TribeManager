import Category from "../models/Category.js";

/* ================================
   Create Category
================================ */
export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================================
   Get All Categories
================================ */
export const getAllCategories = async (_req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   Get Category by ID
================================ */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    res.status(400).json({ message: "Invalid ID" });
  }
};

/* ================================
   Update Category by ID
================================ */
export const updateCategoryById = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================================
   Delete Category by ID
================================ */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================================
   Delete All Categories
================================ */
export const deleteAllCategories = async (_req, res) => {
  try {
    await Category.deleteMany();
    res.json({ message: "All categories deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
