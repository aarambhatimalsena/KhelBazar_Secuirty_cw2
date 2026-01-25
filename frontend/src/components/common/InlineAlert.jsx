import React from "react";

const InlineAlert = ({ type = "success", message }) => {
  const colors = {
    success: "bg-green-100 text-green-800 border border-green-300",
    error: "bg-red-100 text-red-800 border border-red-300",
  };

  return (
    <div className={`p-3 rounded text-sm shadow-md ${colors[type]}`}>
      {message}
    </div>
  );
};

export default InlineAlert;
