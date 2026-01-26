import React from "react";
import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";

const ContactPage = () => {
  return (
    <div className="bg-white">
      {/* ✅ Breadcrumb Section */}
      <div className="bg-[#f5f1eb] py-6 text-sm text-gray-700">
        <div className="max-w-7xl mx-auto flex justify-center items-center gap-2">
          <FiHome className="inline-block w-4 h-4 text-gray-700" />
          <Link
            to="/"
            className="hover:text-gray-900 hover:underline underline"
          >
            Home
          </Link>
          <span className="text-gray-400">›</span>
          <span className="font-medium text-gray-900">Contact</span>
        </div>
      </div>

      {/* ✅ Heading Section */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-4">
        <p className="text-center text-sm text-teal-600 tracking-widest font-semibold uppercase mb-2">
          Get in Touch
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 text-left">
          Contact Us
        </h2>
      </div>

      {/* ✅ Google Map Section */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="w-full overflow-hidden rounded-lg shadow-md border">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.9300877914534!2d85.35242077575397!3d27.719444776175642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1b007b1eccc9%3A0x4d34829505a66bb2!2sBoudha%2C%20tusal!5e0!3m2!1sen!2snp!4v1750500466047!5m2!1sen!2snp"
            width="100%"
            height="500"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

