import React from "react";
import Header from "./Header";
import Footer from "../components/common/Footer";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-white focus:text-gray-900 focus:border focus:border-gray-300 focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to Content
      </a>
      <Header />

      {/* Main content takes remaining height */}
      <main id="main-content" className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
