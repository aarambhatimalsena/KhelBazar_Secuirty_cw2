import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:5000'; 

//  Log in the user and get JWT token
const userLogin = async () => {
  try {
    const response = await axios.post(`${API_BASE}/api/users/login`, {
      email: 'admin3@example.com',
      password: '123456'
    });
    console.log('✅ Login successful');
    return response.data.token;
  } catch (err) {
    console.error('❌ Login failed:', err.response?.data || err.message);
    process.exit(1);
  }
};

// Fetch all products from /api/products
const fetchAllProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/products`);
    console.log(`✅ Fetched ${response.data.length} products`);
    return response.data;
  } catch (err) {
    console.error('❌ Failed to fetch products:', err.message);
    process.exit(1);
  }
};

// Add one product to cart
const addToCart = async (token, productId) => {
  try {
    await axios.post(
      `${API_BASE}/api/cart`,
      { productId, quantity: 1 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`🛒 Added product ${productId} to cart`);
  } catch (err) {
    console.error(`❌ Failed to add product ${productId}:`, err.response?.data || err.message);
  }
};

// Run it all
const run = async () => {
  const token = await userLogin();
  const products = await fetchAllProducts();

  for (let product of products) {
    await addToCart(token, product._id);
  }

  console.log('🎉✅ All products added to cart!');
};

run();
