import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCategory } from "../../services/categoryService";
import toast from "react-hot-toast";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !imageFile) {
      return toast.error("Name and image are required");
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    // 👇 backend expects field name "image" (upload.single('image'))
    formData.append("image", imageFile);

    try {
      setLoading(true);
      await createCategory(formData);
      toast.success("Category created successfully!");
      navigate("/admin/categories");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff3e8_0,_#fff9f3_45%,_#faf3e9_100%)]">
      <div className="max-w-4xl mx-auto px-4 lg:px-0 py-10">
        {/* HEADER – same family as AddProduct / EditCategory */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-red-500 font-semibold">
              ADMIN · ADD CATEGORY
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-1">
              Create a new <span className="text-[#0f6b6f]">category</span>
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-xl">
              Add a category name and image so products are grouped cleanly
              across your store.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/categories")}
            className="text-xs sm:text-sm border border-gray-300 px-4 py-2 rounded-full bg-white/70 hover:border-[#0f6b6f] hover:text-[#0f6b6f] transition shadow-sm"
          >
            Back to Categories
          </button>
        </div>

        {/* CARD */}
        <div className="bg-white/95 rounded-[26px] border border-[#f3e0d8] shadow-[0_18px_45px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* accent line on top */}
          <div className="h-1 w-full bg-gradient-to-r from-[#0f6b6f] via-[#5fb7b5] to-[#f2a654]" />

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* NAME FIELD */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-800">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Shoes, Bags, Stationery"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f6b6f] bg-white"
                required
              />
            </div>

            {/* IMAGE FIELD */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-800">
                Category Image <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full sm:w-1/2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#0f6b6f]"
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                  />
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                Use a square image (e.g. 400×400) for best display in the admin
                table and filters.
              </p>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-8 py-2.5 rounded-full text-sm font-semibold bg-[#0f6b6f] text-white hover:bg-[#0b5559] disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Adding…" : "Add Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;

