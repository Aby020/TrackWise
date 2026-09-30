const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin.controller");
const authenticate = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");
const validate = require("../middleware/validation.middleware");
const {
    createEmployeeValidation,
    updateEmployeeValidation,
} = require("../validations/admin.validation");

router.get(
    "/dashboard",
    authenticate,
    adminOnly,
    adminController.getDashboardStatistics,
);

router.get(
    "/employees",
    authenticate,
    adminOnly,
    adminController.getEmployees,
);

router.get(
    "/employees/:employeeId",
    authenticate,
    adminOnly,
    adminController.getEmployeeByEmployeeId,
);

router.patch(
    "/employees/:employeeId/status",
    authenticate,
    adminOnly,
    adminController.toggleEmployeeStatus,
);

router.put(
    "/employees/:employeeId",
    authenticate,
    adminOnly,
    updateEmployeeValidation,
    validate,
    adminController.updateEmployee,
);

router.post(
    "/employees",
    authenticate,
    adminOnly,
    createEmployeeValidation,
    validate,
    adminController.createEmployee,
);

module.exports = router;
