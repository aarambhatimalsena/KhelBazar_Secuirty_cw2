import fs from "fs";
import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";

// ---- helper: upload local file to Cloudinary then delete temp ----
const uploadCategoryImage = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "kalamkart-categories", // alik separate folder rakheko
  });

  // temp local file delete
  fs.unlink(filePath, (err) => {
    if (err) console.error("Failed to delete temp category file:", err);
  });

  return result.secure_url;
};

// GET all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// CREATE a new category
export const createCategory = async (req, res) => {
  try {
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILE:", req.file);

    const { name } = req.body;

    if (!name || !req.file) {
      return res
        .status(400)
        .json({ message: "Name and image are required" });
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Category already exists" });
    }

    // ⬇️ Cloudinary ma upload gara
    let imageUrl;
    try {
      imageUrl = await uploadCategoryImage(req.file.path);
    } catch (err) {
      console.error("Cloudinary upload for category failed:", err);
      return res
        .status(500)
        .json({ message: "Image upload failed", error: err.message });
    }

    const category = new Category({ name, image: imageUrl });
    await category.save();

    res.status(201).json({ message: "Category created", category });
  } catch (error) {
    console.error("Category creation failed:", error);
    res.status(500).json({
      message: "Failed to create category",
      error: error.message,
    });
  }
};

// UPDATE category (name + image)
export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) category.name = name;

    // new image aayo bhane Cloudinary ma pathaunu
    if (req.file) {
      try {
        const imageUrl = await uploadCategoryImage(req.file.path);
        category.image = imageUrl;
      } catch (err) {
        console.error("Cloudinary upload for category (update) failed:", err);
        return res
          .status(500)
          .json({ message: "Image upload failed", error: err.message });
      }
    }

    await category.save();
    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// DELETE category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

// BULK insert categories (no upload, JSON only)
export const bulkCreateCategories = async (req, res) => {
  const categories = req.body.categories;

  if (!Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({ message: "No categories provided" });
  }

  try {
    const results = await Category.insertMany(categories, { ordered: false });
    res.status(201).json({
      message: `${results.length} categories added successfully.`,
      categories: results,
    });
  } catch (error) {
    console.error("Bulk category insert failed:", error);
    res.status(500).json({
      message: "Bulk category creation failed for some entries",
      error: error.message,
    });
  }
};
