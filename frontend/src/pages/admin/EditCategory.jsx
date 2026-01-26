import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllCategories, updateCategory } from "../../services/categoryService";
import toast from "react-hot-toast";

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 🔹 load current category from backend
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const categories = await getAllCategories();
        const category = categories.find((cat) => cat._id === id);

        if (!category) {
          toast.error("Category not found");
          navigate("/admin/categories");
          return;
        }

        setName(category.name || "");
        setPreview(category.image || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load category");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCategory();
  }, [id, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Name is required");
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    if (imageFile) {
      // 👇 backend expects field name "image" (upload.single('image'))
      formData.append("image", imageFile);
    }

    try {
      setLoading(true);
      await updateCategory(id, formData);
      toast.success("Category updated successfully!");
      navigate("/admin/categories");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff3e8_0,_#fff9f3_45%,_#faf3e9_100%)]">
      <div className="max-w-4xl mx-auto px-4 lg:px-0 py-10">
        {/* HEADER – matches AddProduct look */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-red-500 font-semibold">
              ADMIN · EDIT CATEGORY
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-1">
              Update this <span className="text-[#0f6b6f]">category</span>
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-xl">
              Change the category name or refresh its display image across your
              store.
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
          {/* accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-[#0f6b6f] via-[#5fb7b5] to-[#f2a654]" />

          <div className="p-6 sm:p-8">
            {initialLoading ? (
              <p className="text-sm text-gray-500">Loading category…</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* NAME */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f6b6f] bg-white"
                    required
                  />
                </div>

                {/* IMAGE INPUT */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-800">
                    Category Image
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
                    If you don&apos;t upload a new image, the existing one will
                    be kept.
                  </p>
                </div>

                {/* BUTTON */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center px-8 py-2.5 rounded-full text-sm font-semibold bg-[#0f6b6f] text-white hover:bg-[#0b5559] disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {loading ? "Updating…" : "Update Category"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCategory;

