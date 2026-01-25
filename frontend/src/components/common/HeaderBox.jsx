import React from "react";

const HeaderBox = ({ icon, title, subtitle, action }) => {
  return (
    <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 px-6 py-4 rounded-xl mb-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
          {icon}
          {title}
        </h2>
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  );
};

export default HeaderBox;
