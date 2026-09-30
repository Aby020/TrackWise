const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");

const activateAccount = async (employeeData) => {
    // Check whether employee exists
    const employee = await userModel.findByEmployeeId(employeeData.employeeId);

    if (!employee) {
        throw new Error("Employee ID not found.");
    }

    if (employee.account_status === "inactive") {
        throw new Error(
            "Your account has been deactivated. Please contact the administrator.",
        );
    }

    // Check if account is already activated
    if (employee.account_status === "active") {
        throw new Error("Account is already activated.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);

    // Activate account
    const activatedEmployee = await userModel.activateEmployee(
        employeeData.employeeId,
        hashedPassword,
    );

    return {
        success: true,

        message: "Account activated successfully.",

        data: {
            employeeId: activatedEmployee.employee_id,
            accountStatus: activatedEmployee.account_status,
        },
    };
};
const jwt = require("jsonwebtoken");

const login = async (loginData) => {
    // Find employee
    const employee = await userModel.findByEmployeeId(loginData.employeeId);

    if (!employee) {
        throw new Error("Invalid Employee ID or Password.");
    }

    // Check account status
    if (employee.account_status === "pending") {
        throw new Error("Please activate your account first.");
    }

    if (employee.account_status === "inactive") {
        throw new Error(
            "Your account has been deactivated. Please contact the administrator."
        );
    }

    // An "active" account must always have a password; without one the user
    // has never completed activation (e.g. toggled early by an admin).
    if (!employee.password) {
        throw new Error("Please activate your account first.");
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
        loginData.password,
        employee.password,
    );

    if (!passwordMatch) {
        throw new Error("Invalid Employee ID or Password.");
    }

    // Generate JWT
    const token = jwt.sign(
        {
            id: employee.id,
            employeeId: employee.employee_id,
            role: employee.role,
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "8h",
        },
    );

    return {
        success: true,

        message: "Login Successful",

        token,

        user: {
            employeeId: employee.employee_id,

            firstName: employee.first_name,

            lastName: employee.last_name,

            role: employee.role,
        },
    };
};

module.exports = {
    activateAccount,

    login,
};
