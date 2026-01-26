// src/pages/AboutPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import aboutImage from "../assets/aboutus.png";

const AboutPage = () => {
  return (
    <div className="bg-white font-inter">
      {/* Breadcrumb */}
      <div className="bg-[#f5f1eb] py-6 px-4 text-sm text-gray-700">
        <div className="max-w-7xl mx-auto flex justify-center items-center gap-2">
          <FiHome className="inline-block w-4 h-4 text-gray-700" />
          <Link to="/" className="text-gray-900 underline font-light">
            Home
          </Link>
          <span className="text-gray-400">›</span>
          <span className="font-medium text-gray-900">About Us</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
          {/* Left Image */}
          <div className="rounded-2xl border border-gray-300 shadow-xl overflow-hidden">
            <img
              src={aboutImage}
              alt="About KhelBazar"
              className="w-full h-[420px] object-cover"
            />
          </div>

          {/* Right Text */}
          <div className="flex flex-col justify-start text-gray-800">
            <div className="mb-6">
              <h2 className="text-5xl font-extrabold text-[#0a1931] leading-tight">
                Our Story
              </h2>
              <p className="mt-3 text-base text-gray-600">
                Passion • Authenticity • Performance
              </p>
            </div>

            <p className="text-base leading-relaxed mb-4">
              <span className="font-semibold text-[#0a1931]">KhelBazar</span> is Nepal’s
              premium basketball eCommerce destination created for hoopers,
              athletes, students, adults, and every basketball fan looking for
              authentic gear and a modern online shopping experience.
            </p>

            <p className="text-base leading-relaxed mb-4">
              From training essentials and pro-quality shoes to indoor/outdoor balls,
              bags, accessories, and performance wear we focus on originality,
              trust, and delivering a clean, seamless UI the Nepali sports
              community deserves.
            </p>

            <blockquote className="border-l-4 border-[#0a1931] pl-4 text-gray-700 text-base mt-3">
              “Built for players. Powered by passion. Dedicated to Nepal’s basketball community.”
            </blockquote>

            <div className="mt-5 font-semibold text-gray-800 text-sm">
              — KhelBazar Team (Aarambha Timalsena)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

