import Brand from '../models/Brand.js';

// GET all brands
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch brands', error: error.message });
  }
};

// GET single brand
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch brand', error: error.message });
  }
};

// CREATE brand (admin)
export const createBrand = async (req, res) => {
  try {
    const { name, logo, country, foundedYear, description, isPremium, website } = req.body;

    if (!name) return res.status(400).json({ message: 'Brand name is required' });

    const exists = await Brand.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Brand already exists' });

    const brand = new Brand({
      name,
      logo: logo || req.file?.path || '',
      country,
      foundedYear,
      description,
      isPremium,
      website,
    });

    const saved = await brand.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create brand', error: error.message });
  }
};

// UPDATE brand
export const updateBrand = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.logo = req.file.path;
    }

    const brand = await Brand.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update brand', error: error.message });
  }
};

// DELETE brand
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    res.status(200).json({ message: 'Brand deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete brand', error: error.message });
  }
};
