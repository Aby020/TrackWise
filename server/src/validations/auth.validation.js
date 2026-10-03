const { body } = require("express-validator");

/**
 * The login form posts a single identifier that may be the
 * employee id or the corporate email. Accept any of the
 * keys the client or an API consumer may send, then let
 * the service resolve whichever is present.
 */
const loginValidation = [
    body("employeeId")
        .optional()
        .trim(),
    body("identifier")
        .optional()
        .trim(),
    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Corporate email must be a valid email"),
    body("password")
        .notEmpty()
        .withMessage("Password is required"),
];

/** Require at least one identifier field to be present. */
const loginIdentifierPresent = (req, res, next) => {
    const hasIdentifier = Boolean(
        req.body?.identifier ||
            req.body?.employeeId ||
            req.body?.email,
    );

    if (!hasIdentifier) {
        return res.status(400).json({
            success: false,
            errors: [
                {
                    type: "field",
                    msg: "Employee ID is required",
                    path: "employeeId",
                    location: "body",
                },
            ],
        });
    }

    return next();
};

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
    loginIdentifierPresent,
    loginValidation,
    activateValidation,
};
