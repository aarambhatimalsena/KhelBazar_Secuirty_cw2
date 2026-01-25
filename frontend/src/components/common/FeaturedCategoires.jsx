import React, { useEffect, useRef, useState } from "react";
import { getAllCategories } from "../../services/categoryService";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const FeaturedCategories = () => {
  const [categories, setCategories] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllCategories();
        console.log("📦 Categories fetched:", data);
        setCategories(data);
      } catch (err) {
        console.error("❌ Failed to load categories", err);
      }
    };
    fetchData();
  }, []);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 350, behavior: "smooth" });
  };

  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* 🔹 Heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-gray-800">Shop By Categories</h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            Essential Office Supplies In Our Online Stationery Shop That Keep Your Office Operations Smooth And Efficient
          </p>
          <Link
            to="/categories"
            className="inline-block mt-6 px-6 py-2 border border-gray-800 rounded-full text-gray-800 font-medium hover:bg-gray-200 transition"
          >
            All Collections →
          </Link>
        </div>

        {/* 🔹 Arrows + Scrollable Cards */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white shadow rounded-full hover:bg-gray-200"
          >
            <FaArrowLeft />
          </button>

          {/* Scrollable Category Cards */}
          <div
            ref={scrollRef}
            className="flex overflow-x-scroll gap-6 px-10 scroll-smooth no-scrollbar"
            style={{
              scrollSnapType: "x mandatory",
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${encodeURIComponent(cat.name)}`} // ✅ FIXED HERE
                className="scroll-snap-start flex-shrink-0 w-[250px] h-[250px] bg-white shadow-md rounded-xl overflow-hidden hover:shadow-xl transition-all relative group"
              >
                <img
                  src={cat?.image || "https://via.placeholder.com/250x250?text=No+Image"}
                  alt={cat?.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/250x250?text=No+Image";
                  }}
                />
                <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white py-2 text-center text-lg font-semibold">
                  {cat?.name}
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white shadow rounded-full hover:bg-gray-200"
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;