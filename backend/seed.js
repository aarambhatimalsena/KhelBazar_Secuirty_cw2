// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import User from "./models/User.js";
import connectDB from "./config/db.js";

// 🛎️ FIX: Import correct notification function
import { createNotification } from "./controllers/notificationController.js";

import { shoesProducts } from "./seed/shoes.js";
import { basketballProducts } from "./seed/basketballs.js";
import { basketballBags } from "./seed/basketballBags.js";
import { coachingTrainingProducts } from "./seed/coachingTraining.js";
import { jerseyProducts } from "./seed/jerseys.js";

dotenv.config();
await connectDB();

const admin = {
  name: "Aarambha Timalsena",
  email: "timalsenaaarambha75@gmail.com",
  password: "123456",
  role: "admin",
};

try {
  // 🧹 Clear old products
  await Product.deleteMany();

  // 👤 Create / fetch admin
  let adminUser = await User.findOne({ email: admin.email });

  if (!adminUser) {
    adminUser = await User.create(admin);
    console.log(`✅ Admin user created: ${adminUser.email}`);
  } else {
    console.log(`ℹ️ Admin already exists: ${adminUser.email}`);
  }

  // 📦 Merge all products
  const allProducts = [
    ...shoesProducts,
    ...basketballProducts,
    ...basketballBags,
    ...coachingTrainingProducts,
    ...jerseyProducts
  ];

  // 🛒 Insert products
  const createdProducts = await Product.insertMany(allProducts);
  console.log(`✅ Seeded ${createdProducts.length} products!`);

  // 🔔 Notifications (no more GLOBAL!)
  for (const p of createdProducts) {
    const discount = Number(p.discountPercent || 0);

    // New Arrival Notification
    if (p.isNewArrival) {
      await createNotification({
        userId: adminUser._id, // FIX
        type: "new_arrival",
        message: `New arrival: ${p.name} is now available in KhelBazar 🏀`,
        link: `/product/${p._id}`,
      });
      console.log(`   🔔 New arrival notif created for: ${p.name}`);
    }

    // Discount Notification
    if (discount > 0) {
      await createNotification({
        userId: adminUser._id, // FIX
        type: "discount",
        message: `${p.name} now has ${discount}% OFF. Don't miss out! 🎁`,
        link: `/product/${p._id}`,
      });
      console.log(`   🔔 Discount notif created for: ${p.name}`);
    }
  }

  console.log("🎉 Done seeding products + notifications");
  process.exit();
} catch (error) {
  console.error("❌ Seeding error:", error);
  process.exit(1);
}
