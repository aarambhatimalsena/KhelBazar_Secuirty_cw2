// src/pages/admin/EditProduct.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductById,
  updateProduct,
} from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";
import toast from "react-hot-toast";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    brand: "",
    price: "",
    originalPrice: "",
    discountPercent: "",
    stock: "",
    category: "", // will hold CATEGORY NAME for edit
    gender: "Unisex",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    tags: "",
  });

  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImagePreview, setOriginalImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load categories + product
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, product] = await Promise.all([
          getAllCategories(),
          getProductById(id),
        ]);

        setCategories(cats || []);

        setForm({
          name: product.name || "",
          description: product.description || "",
          brand: product.brand || "",
          price: product.price ?? "",
          originalPrice: product.originalPrice ?? "",
          discountPercent: product.discountPercent ?? "",
          stock: product.stock ?? "",
          // product.category in DB is NAME, so we keep name for update
          category: product.category || "",
          gender: product.gender || "Unisex",
          isFeatured: product.isFeatured || false,
          isNewArrival: product.isNewArrival || false,
          isBestSeller: product.isBestSeller || false,
          tags: Array.isArray(product.tags)
            ? product.tags.join(", ")
            : product.tags || "",
        });

        const preview = product.primaryImage || product.image || null;
        setImagePreview(preview);
        setOriginalImagePreview(preview);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product or categories");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

    if (!form.name || !form.description || !form.brand || !form.price) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("brand", form.brand);
      data.append("price", form.price);
      data.append("stock", form.stock);
      data.append("category", form.category); // keep as NAME for update

      if (form.originalPrice !== "") {
        data.append("originalPrice", form.originalPrice);
      }
      if (form.discountPercent !== "") {
        data.append("discountPercent", form.discountPercent);
      }

      if (form.gender) {
        data.append("gender", form.gender);
      }

      // flags (send both states so you can uncheck)
      data.append("isFeatured", form.isFeatured ? "true" : "false");
      data.append("isNewArrival", form.isNewArrival ? "true" : "false");
      data.append("isBestSeller", form.isBestSeller ? "true" : "false");

      if (form.tags.trim()) {
        data.append("tags", form.tags.trim());
      } else {
        data.append("tags", "");
      }

      if (imageFile) {
        data.append("image", imageFile);
      }
      // if no new image, backend keeps old image (we don't send "image" field)

      await updateProduct(id, data);
      toast.success("✅ Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message;
      if (msg && /invalid image/i.test(msg)) {
        setImageFile(null);
        setImagePreview(originalImagePreview);
        toast.error(msg);
      } else {
        toast.error("❌ Failed to update product");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff3e8_0,_#fff9f3_45%,_#faf3e9_100%)] flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading product…</p>
      </div>
    );
  }

  // ============ RENDER ============
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff3e8_0,_#fff9f3_45%,_#faf3e9_100%)]">
      <div className="max-w-4xl mx-auto px-4 lg:px-0 py-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-red-500 font-semibold">
              ADMIN · EDIT PRODUCT
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-1">
              Edit <span className="text-[#0f6b6f]">product</span> details
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-xl">
              Update pricing, stock, tags or media without losing existing data.
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
          {/* top accent line */}
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
                placeholder="Update description for the product page..."
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
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400">
                  Uses category name so existing filters keep working.
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
                Main Product Image
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
                If you don&apos;t upload a new image, the existing one will stay.
              </p>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center px-8 py-2.5 rounded-full text-sm font-semibold bg-[#0f6b6f] text-white hover:bg-[#0b5559] disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving ? "Updating..." : "Update Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;

