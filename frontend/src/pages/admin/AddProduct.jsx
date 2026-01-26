// src/pages/admin/AddProduct.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";
import toast from "react-hot-toast";

const AddProduct = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    brand: "",
    price: "",
    originalPrice: "",
    discountPercent: "",
    stock: "",
    category: "", // CATEGORY _id
    gender: "Unisex",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    tags: "",
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ============ LOAD CATEGORIES ============
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // ============ HANDLERS ============
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category) {
      toast.error("Please select a category");
      return;
    }

    if (!imageFile) {
      toast.error("Please upload a main product image");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("brand", form.brand);
      formData.append("price", form.price);
      formData.append("category", form.category); // CATEGORY ID
      formData.append("stock", form.stock);

      if (form.originalPrice) {
        formData.append("originalPrice", form.originalPrice);
      }
      if (form.discountPercent) {
        formData.append("discountPercent", form.discountPercent);
      }

      if (form.gender) {
        formData.append("gender", form.gender);
      }

      if (form.isFeatured) formData.append("isFeatured", "true");
      if (form.isNewArrival) formData.append("isNewArrival", "true");
      if (form.isBestSeller) formData.append("isBestSeller", "true");

      if (form.tags.trim()) {
        formData.append("tags", form.tags.trim());
      }

      formData.append("image", imageFile);

      await createProduct(formData);
      toast.success("✅ Product added successfully");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message;
      if (msg && /invalid image/i.test(msg)) {
        setImageFile(null);
        setImagePreview(null);
        toast.error(msg);
      } else {
        toast.error("❌ Failed to add product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ============ RENDER ============
  return (
    // 🔸 softer background so card pops
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff3e8_0,_#fff9f3_45%,_#faf3e9_100%)]">
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-red-500 font-semibold">
              ADMIN · ADD PRODUCT
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-1">
              Create a new <span className="text-[#0f6b6f]">product</span>
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-xl">
              Add full details so it appears correctly across cards, filters and
              recommendations.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/products")}
            className="text-xs sm:text-sm border border-gray-300 px-4 py-2 rounded-full bg-white/70 hover:border-[#0f6b6f] hover:text-[#0f6b6f] transition shadow-sm"
          >
            Back to Products
          </button>
        </div>

        {/* FORM CARD */}
        <div className="bg-white/95 rounded-[26px] border border-[#f3e0d8] shadow-[0_18px_45px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* subtle top accent line like your other admin cards */}
          <div className="h-1 w-full bg-gradient-to-r from-[#0f6b6f] via-[#5fb7b5] to-[#f2a654]" />

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Nike Zoom Freak 5"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f6b6f] bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="e.g. Nike, Adidas"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f6b6f] bg-white"
                  required
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-800">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Enter a clear, detailed description for the product page..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f6b6f] bg-white"
                required
              />
            </div>

            {/* PRICING + STOCK */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-800">
                  Price (NPR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f6b6f] bg-white"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-800">
                  Original Price (NPR)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={form.originalPrice}
                  onChange={handleChange}
                  min="0"
                  placeholder="Before discount"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f6b6f] bg-white"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-800">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discountPercent"
                  value={form.discountPercent}
                  onChange={handleChange}
                  min="0"
                  max="90"
                  placeholder="e.g. 20"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f6b6f] bg-white"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-800">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f6b6f] bg-white"
                  required
                />
              </div>
            </div>

            {/* CATEGORY + GENDER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#0f6b6f]"
                  required
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "-- Select Category --"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400">
                  We send the category ID, backend stores the category name in
                  product.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Gender
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#0f6b6f]"
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>
            </div>

            {/* FLAGS + TAGS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-800">
                  Product Flags
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-800">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={form.isFeatured}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-[#0f6b6f] focus:ring-[#0f6b6f]"
                    />
                    <span>Featured</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isNewArrival"
                      checked={form.isNewArrival}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-[#0f6b6f] focus:ring-[#0f6b6f]"
                    />
                    <span>New Arrival</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isBestSeller"
                      checked={form.isBestSeller}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-[#0f6b6f] focus:ring-[#0f6b6f]"
                    />
                    <span>Best Seller</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="e.g. high-top,indoor,lightweight"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f6b6f] bg-white"
                />
                <p className="text-[11px] text-gray-400">
                  Used later for search filters and recommendations.
                </p>
              </div>
            </div>

            {/* IMAGE UPLOAD */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-800">
                Main Product Image <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full sm:w-1/2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#0f6b6f]"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-28 w-28 rounded-lg border border-gray-200 object-cover"
                  />
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                This will be stored as the main <code>image</code> field. You
                can extend gallery (<code>images[]</code>) later.
              </p>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center px-8 py-2.5 rounded-full text-sm font-semibold bg-[#0f6b6f] text-white hover:bg-[#0b5559] disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {submitting ? "Saving..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;

