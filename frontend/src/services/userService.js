import axios from "../api/api";

// Get logged-in user's profile
export const getUserProfile = async () => {
  const response = await axios.get("/users/profile");
  return response.data;
};

// Update profile (name, email, password)
export const updateUserProfile = async (payload) => {
  const response = await axios.put("/users/profile", payload);
  return response.data;
};

// Upload profile image (expects FormData with 'image' key)
export const uploadProfileImage = async (formData) => {
  const response = await axios.put("/users/profile/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Delete profile image
export const deleteProfileImage = async () => {
  const response = await axios.delete("/users/profile/image");
  return response.data;
};

// Logout all devices (revoke sessions)
export const logoutAllDevices = async () => {
  const response = await axios.post("/users/logout-all");
  return response.data;
};
