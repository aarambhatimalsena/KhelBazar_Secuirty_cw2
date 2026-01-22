import { body, validationResult } from "express-validator";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateOrder = [
  body("deliveryAddress")
    .trim()
    .notEmpty()
    .withMessage("Delivery address is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters long")
    .escape(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage("Invalid phone number"),

  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["eSewa", "Khalti", "COD"])
    .withMessage("Invalid payment method"),

  // (coupon optional)
  body("couponCode")
    .optional()
    .trim()
    .isLength({ max: 32 })
    .withMessage("Coupon code too long")
    .escape(),

  handleValidationErrors,
];
