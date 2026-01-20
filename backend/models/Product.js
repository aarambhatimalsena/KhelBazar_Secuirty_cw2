import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Each variant = one size/colour option
const variantSchema = new mongoose.Schema({
  size: { type: String, required: true }, // e.g. "US 9", "M", "L"
  color: { type: String, default: "" },   // e.g. "Red/Black"
  stock: { type: Number, default: 0 },
  image: { type: String, default: "" },   // per-variant image (you can keep using this)
});

// 👇 Image schema for multiple angles of the same product
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "" },      // "Nike LeBron 20 front view"
    view: { type: String, default: "front" } // "front", "back", "left", "right", "detail"
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // BASIC INFO
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },

    // SINGLE MAIN IMAGE (for cards / backwards compatibility)
    image: {
      type: String,
      default: "no-image.jpg",
    },

    // MULTIPLE IMAGES (gallery on product page)
    images: {
      type: [imageSchema],
      default: [],
    },

    // CATEGORY (Shoes, Jerseys, Balls, etc.)
    category: {
      type: String,
      required: true,
    },

    // 👇 NEW: GENDER (doesn't touch your 8 categories)
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Kids"],
      default: "Unisex",
    },

    // BRAND (Nike, Adidas, Li-Ning, etc.)
    brand: {
      type: String,
      required: true,
      trim: true,
    },

    // PRICING
    price: {
      type: Number, // actual selling price
      required: true,
    },
    originalPrice: {
      type: Number, // before discount
    },
    discountPercent: {
      type: Number,
      default: 0, // e.g. 20 for 20% off
    },

    // STOCK MANAGEMENT
    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    // VARIANTS (for shoes/jerseys)
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variants: [variantSchema],

    // TAG FLAGS
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],

    // CREATED BY ADMIN
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // REVIEWS
    reviews: [reviewSchema],
    numReviews: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Virtual price calculator
productSchema.virtual("finalPrice").get(function () {
  if (this.discountPercent > 0 && this.originalPrice) {
    return Math.round(this.originalPrice * (1 - this.discountPercent / 100));
  }
  return this.price;
});

// Optional: virtual to get one primary image easily
productSchema.virtual("primaryImage").get(function () {
  if (this.images && this.images.length > 0) {
    return this.images[0].url;
  }
  return this.image; // fallback to old single image
});

const Product = mongoose.model("Product", productSchema);
export default Product;
