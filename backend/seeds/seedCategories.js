import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";

dotenv.config();
await connectDB();

const categories = [
  {
    name: "Shoes",
    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1762335262/shoes_wjblaf.webp",
  },
  {
    name: "Jerseys",
    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1762335351/jersey_ztsfrw.jpg",
  },
  {
    name: "Basketballs",
    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1762335152/BasketBall_oqihyq.jpg",
  },
  {
    name: "Accessories",
    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1762335703/OIP_ypsyxi.jpg",
  },
  {
    name: "Bags",
    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1762335800/OIP_1_n5bb49.jpg",
  },
  {
    name: "Coaching & Training",
    image:
      "https://res.cloudinary.com/dprenqgxs/image/upload/v1762335905/basketball-practice-coach_vnsehh.jpg",
  },
];

const seedCategories = async () => {
  const names = categories.map((cat) => cat.name);
  const existing = await Category.find({ name: { $in: names } }).select("name");
  const existingNames = new Set(existing.map((cat) => cat.name));

  let inserted = 0;
  let skipped = 0;

  for (const cat of categories) {
    if (existingNames.has(cat.name)) {
      console.log(`[skip] ${cat.name}`);
      skipped += 1;
      continue;
    }

    const created = await Category.create(cat);
    console.log(`[insert] ${created.name}`);
    inserted += 1;
  }

  console.log(`Done. Inserted ${inserted}, skipped ${skipped}.`);
};

try {
  await seedCategories();
} catch (error) {
  console.error("Seed categories failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
  process.exit(process.exitCode || 0);
}
