
import React from "react";

const PromoSection = () => {
  return (
    // Reduced top padding to bring it closer to the HeroSlider
    <section className="pt-8 pb-20 bg-white">
      <h2 className="text-center text-3xl  tracking-wide font-regular mb-10 text-gray-900 uppercase">
        Shop Online Stationery, Notebooks & Diaries
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4 md:px-16">
        {/* Custom Notebooks */}
        <div className="flex flex-col items-center">
          <img
            src="https://res.cloudinary.com/djv58awy8/image/upload/v1749804746/customnotebooks_zrqlmj.png"
            alt="Custom Notebooks"
            className="rounded-lg shadow-lg object-cover w-full h-[400px]"
          />
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Custom Notebooks.
          </h3>
          <p className="mt-2 text-gray-500 text-center max-w-md">
            Famous worldwide for its customizable notebooks and its stunning
            BRASS Collection.
          </p>
        </div>

        {/* Pencils For Coloring */}
        <div className="flex flex-col items-center">
          <img
            src="https://res.cloudinary.com/djv58awy8/image/upload/v1749804861/pencutsome_ttgpnn.png"
            alt="Pencils for Coloring"
            className="rounded-lg shadow-lg object-cover w-full h-[400px]"
          />
          <h3 className="mt-6 text-xl font-semibold text-gray-900">
            Pencils For Coloring
          </h3>
          <p className="mt-2 text-gray-500 text-center max-w-md">
            Coloring is the hottest trend right now and is a great way to relax
            and easily express yourself.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;