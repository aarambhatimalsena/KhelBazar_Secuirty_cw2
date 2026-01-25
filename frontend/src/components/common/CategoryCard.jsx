
const CategoryCard = ({ name, image }) => {
  const fallback =
    "https://cdn-icons-png.flaticon.com/512/1046/1046857.png";

  const safeImage = image?.trim() ? image : fallback;

  return (
    <div className="flex flex-col items-center gap-3 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <div className="w-32 h-32 rounded-full overflow-hidden shadow-md border border-gray-200 bg-white">
        <img
          src={safeImage}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-center font-semibold text-base text-gray-800">
        {name}
      </p>
    </div>
  );
};

export default CategoryCard;
