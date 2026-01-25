// src/components/layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaPhoneAlt, FaClock, FaEnvelope } from "react-icons/fa";

const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const Footer = () => {
  return (
    <footer className="bg-[#050b18] text-white py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* LOGO + TAGLINE */}
        <div>
          <h2 className="text-2xl font-bold mb-3 tracking-wide">
            <span className="text-[#ff4b5c]">K</span>heldokan
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Nepal&apos;s home for premium basketball shoes, balls and training
            gear built for hoopers who live on the court.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="font-semibold mb-4 text-sm tracking-[0.18em] uppercase">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link to="/" onClick={scrollTop} className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                onClick={scrollTop}
                className="hover:underline"
              >
                Products
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={scrollTop} className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                onClick={scrollTop}
                className="hover:underline"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h3 className="font-semibold mb-4 text-sm tracking-[0.18em] uppercase">
            Need Help?
          </h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <FaPhoneAlt className="text-[#ff4b5c]" />
              <span className="font-semibold text-[#ffb3bd]">
                (+977) 98459-86352
              </span>
            </li>

            <li className="flex items-center gap-2">
              <FaEnvelope />
              <span>support@KhelBazar.com</span>
            </li>

            <li className="flex items-center gap-2">
              <FaClock />
              <span>Sun – Fri: 9:00 – 20:00</span>
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM STRIP */}
      <div className="mt-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 py-4 text-[11px] text-gray-400">
          <p>© {new Date().getFullYear()} KhelBazar. All rights reserved.</p>
          <p className="text-xs">
            Built with ❤️ for Nepal&apos;s basketball community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

