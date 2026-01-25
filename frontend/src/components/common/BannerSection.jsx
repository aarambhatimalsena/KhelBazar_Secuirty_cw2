import React from "react";

const BannerSection = () => (
  <div className="w-full overflow-hidden bg-gray-100">

    {/* 🔹 Banner Image */}
    <img
      src="https://res.cloudinary.com/djv58awy8/image/upload/v1749808706/writing_isntrument_2_kdefeq.png"
      alt="Writing Instruments"
      className="w-full h-[150px] sm:h-[400px] object-cover"
    />

    {/* 🔹 Caption Below */}
    <div className="text-center py-6 bg-white">
      <h2 className="mt-6 text-xl font-semibold text-gray-900">
        Writing Instruments
      </h2>
      <p className="mt-2 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto text-center">
        Find your new favourite pen, discover a new type of pencil or try something new.
      </p>
    </div>

  </div>
);

export default BannerSection;