const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validation.middleware");
const {
    activateValidation,
    loginIdentifierPresent,
    loginValidation,
} = require("../validations/auth.validation");

router.post(
    "/activate",
    activateValidation,
    validate,
    authController.activateAccount,
);

router.post(
    "/login",
    loginIdentifierPresent,
    loginValidation,
    validate,
    authController.login,
);

module.exports = router;
