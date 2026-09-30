const { body } = require("express-validator");

const loginValidation = [
    body("employeeId")
        .trim()
        .notEmpty()
        .withMessage("Employee ID is required"),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),
];

const activateValidation = [
    body("employeeId")
        .trim()
        .notEmpty()
        .withMessage("Employee ID is required"),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),

    body("confirmPassword")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Passwords do not match"),
];

module.exports = {
    loginValidation,
    activateValidation,
};
