// controllers/productController.js
import fs from "fs";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";

// ===== helper: upload local file to Cloudinary then delete temp file =====
const uploadImageToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "kalamkart-products", // 👈 folder name Cloudinary ma
  });

  // temp file delete
  fs.unlink(filePath, (err) => {
    if (err) console.error("Failed to delete temp file:", err);
  });

  return result.secure_url; // this goes into product.image
};

// ================== CREATE PRODUCT (ADMIN) ==================
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category, // CATEGORY ID from frontend/Postman
      brand,
      price,
      originalPrice,
      discountPercent,
      stock,
      hasVariants,
      variants,
      isFeatured,
      isNewArrival,
      isBestSeller,
      tags,
      gender,
    } = req.body;

    if (!name || !description || !category || !brand || !price) {
      return res.status(400).json({
        message:
          "Name, description, category, brand and price are required",
      });
    }

    // category is sent as ID, but we store NAME in product
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: "Invalid category selected" });
    }

    // ---------- IMAGE HANDLING ----------
    let image = "no-image.jpg";

    // if a file is uploaded, send to Cloudinary
    if (req.file) {
      try {
        image = await uploadImageToCloudinary(req.file.path);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return res
          .status(500)
          .json({ message: "Image upload failed", error: err.message });
      }
    } else if (req.body.image) {
      // optional: allow direct URL from body
      image = req.body.image;
    }

    // ---------- FLAGS + TAGS + GENDER NORMALIZATION ----------
    const normalizedIsFeatured =
      isFeatured === "true" || isFeatured === true ? true : false;
    const normalizedIsNewArrival =
      isNewArrival === "true" || isNewArrival === true ? true : false;
    const normalizedIsBestSeller =
      isBestSeller === "true" || isBestSeller === true ? true : false;

    let normalizedTags = [];
    if (typeof tags === "string" && tags.trim().length > 0) {
      normalizedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (Array.isArray(tags)) {
      normalizedTags = tags;
    }

    const newProduct = new Product({
      name,
      image,
      description,
      category: categoryDoc.name, // store category name
      brand,
      price,
      originalPrice,
      discountPercent,
      stock,
      hasVariants,
      variants,
      isFeatured: normalizedIsFeatured,
      isNewArrival: normalizedIsNewArrival,
      isBestSeller: normalizedIsBestSeller,
      tags: normalizedTags,
      gender: gender || "Unisex",
      createdBy: req.user._id,
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

// ================== GET ALL PRODUCTS (filters) ==================
const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      onSale,
      featured,
    } = req.query;

    const keywordFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const categoryFilter = category
      ? { category: { $regex: new RegExp(category, "i") } }
      : {};

    const brandFilter = brand
      ? { brand: { $regex: new RegExp(brand, "i") } }
      : {};

    const priceFilter = {};
    if (minPrice) {
      priceFilter.price = {
        ...(priceFilter.price || {}),
        $gte: Number(minPrice),
      };
    }
    if (maxPrice) {
      priceFilter.price = {
        ...(priceFilter.price || {}),
        $lte: Number(maxPrice),
      };
    }

    const onSaleFilter =
      onSale === "true"
        ? { discountPercent: { $gt: 0 } }
        : {};

    const featuredFilter =
      featured === "true"
        ? { isFeatured: true }
        : {};

    const products = await Product.find({
      ...keywordFilter,
      ...categoryFilter,
      ...brandFilter,
      ...priceFilter,
      ...onSaleFilter,
      ...featuredFilter,
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// ================== GET BY CATEGORY NAME ==================
const getProductsByCategory = async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.categoryName);
    const products = await Product.find({
      category: { $regex: new RegExp(`^${categoryName}$`, "i") },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Failed to fetch category products:", error);
    res.status(500).json({
      message: "Failed to fetch category products",
      error: error.message,
    });
  }
};

// ================== GET SINGLE PRODUCT ==================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

// ================== UPDATE PRODUCT ==================
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    // if frontend sends category ID, convert to name (like create)
    if (updates.category) {
      try {
        const catDoc = await Category.findById(updates.category);
        if (catDoc) {
          updates.category = catDoc.name;
        }
      } catch {
        // if invalid ObjectId, maybe it's already a name; ignore
      }
    }

    // If old code still sends countInStock
    if (updates.countInStock !== undefined) {
      updates.stock = updates.countInStock;
      delete updates.countInStock;
    }

    // normalize flags if present
    if (updates.isFeatured !== undefined) {
      updates.isFeatured =
        updates.isFeatured === "true" || updates.isFeatured === true;
    }
    if (updates.isNewArrival !== undefined) {
      updates.isNewArrival =
        updates.isNewArrival === "true" || updates.isNewArrival === true;
    }
    if (updates.isBestSeller !== undefined) {
      updates.isBestSeller =
        updates.isBestSeller === "true" || updates.isBestSeller === true;
    }

    if (updates.tags && typeof updates.tags === "string") {
      updates.tags = updates.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    // NEW image uploaded?
    if (req.file) {
      try {
        const secureUrl = await uploadImageToCloudinary(req.file.path);
        updates.image = secureUrl;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return res
          .status(500)
          .json({ message: "Image upload failed", error: err.message });
      }
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

// ================== DELETE PRODUCT ==================
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "✅ Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

// ================== RECOMMENDED PRODUCTS ==================
const getRecommendedProducts = async (req, res) => {
  try {
    const baseProduct = await Product.findById(req.params.id);
    if (!baseProduct) {
      return res
        .status(404)
        .json({ message: "Base product not found" });
    }

    const query = {
      _id: { $ne: baseProduct._id },
      category: baseProduct.category,
    };

    if (baseProduct.brand) {
      query.brand = baseProduct.brand;
    }

    const recommended = await Product.find(query)
      .sort({ rating: -1, numReviews: -1 })
      .limit(8);

    res.status(200).json(recommended);
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    res.status(500).json({
      message: "Failed to fetch recommended products",
      error: error.message,
    });
  }
};

export {
  createProduct,
  getAllProducts,
  getProductsByCategory,
  getProductById,
  updateProduct,
  deleteProduct,
  getRecommendedProducts,
};
