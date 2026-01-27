import api from "../api/api";

// ✅ Get all categories
export const getAllCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

// ✅ Create a new category (fixes route and headers)
export const createCategory = async (categoryData) => {
  const res = await api.post("/categories", categoryData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// ✅ Update category
export const updateCategory = async (id, categoryData) => {
  const res = await api.put(`/categories/${id}`, categoryData);
  return res.data;
};

// ✅ Delete category
export const deleteCategory = async (id) => {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
};
