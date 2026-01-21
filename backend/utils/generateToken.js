import jwt from "jsonwebtoken";

const generateToken = (userOrId) => {
  const isObject = typeof userOrId === "object" && userOrId !== null;
  const id = isObject ? userOrId._id || userOrId.id : userOrId;
  const tokenVersion = isObject ? userOrId.tokenVersion || 0 : 0;

  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
