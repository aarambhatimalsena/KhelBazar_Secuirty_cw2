import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,    // Cloudinary URL for logo
      default: '',
    },
    country: {
      type: String,    // e.g. "USA"
      default: '',
    },
    foundedYear: {
      type: Number,    // e.g. 1964
    },
    description: {
      type: String,
      default: '',
    },
    isPremium: {
      type: Boolean,   // mark Nike/Jordan etc.
      default: false,
    },
    website: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
