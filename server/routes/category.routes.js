import express from "express";
import * as controller from "../controllers/category.controller.js";

const router = express.Router();

router.post("/", controller.createCategory);
router.get("/", controller.getAllCategories);
router.get("/:id", controller.getCategoryById);
router.put("/:id", controller.updateCategoryById);
router.delete("/:id", controller.deleteCategory);
router.delete("/", controller.deleteAllCategories);

export default router;