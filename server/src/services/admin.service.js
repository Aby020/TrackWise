const adminModel = require("../models/admin.model");
const userModel = require("../models/user.model");

const getDashboardStatistics = async () => {
    const stats = await adminModel.getDashboardStatistics();

    const totalEmployees = Number(stats.total_employees);

    const workingToday = Number(stats.working_today);

    const completedToday = Number(stats.completed_today);

    const notStartedToday = totalEmployees - workingToday - completedToday;

    return {
        success: true,

        data: {
            totalEmployees,

            workingToday,

            completedToday,

            notStartedToday,
        },
    };
};
const getEmployees = async () => {
    const employees = await adminModel.getEmployees();

    return {
        success: true,

        data: employees,
    };
};
const getEmployeeByEmployeeId = async (employeeId) => {

    const employee = await adminModel.getEmployeeByEmployeeId(

        employeeId

    );

    if (!employee) {

        throw new Error("Employee not found.");

    }

    return {

        success: true,

        data: employee

    };

};
const updateEmployee = async (employeeId, employeeData) => {

    const employee = await adminModel.updateEmployee(

        employeeId,

        employeeData

    );

    if (!employee) {

        throw new Error("Employee not found.");

    }

    return {

        success: true,

        message: "Employee updated successfully.",

        data: employee

    };

};
const toggleEmployeeStatus = async (employeeId) => {

    const current = await adminModel.getEmployeeByEmployeeId(employeeId);

    if (!current) {

        throw new Error("Employee not found.");

    }

    // Pending accounts activate themselves by setting a password; admin
    // must not flip them active without one (that would lock them out).
    if (current.account_status === "pending") {

        throw new Error(
            "Pending employees must activate their own account.",
        );

    }

    const employee = await adminModel.toggleEmployeeStatus(

        employeeId

    );

    if (!employee) {

        throw new Error("Employee not found.");

    }

    return {

        success: true,

        message:
            employee.account_status === "active"
                ? "Employee activated successfully."
                : "Employee deactivated successfully.",

        data: employee

    };

};
const createEmployee = async (employeeData) => {
    // Check Employee ID
    const existingEmployee = await userModel.findByEmployeeId(
        employeeData.employeeId,
    );

    if (existingEmployee) {
        throw new Error("Employee ID already exists.");
    }

    // Check Email
    const existingEmail = await userModel.findByEmail(employeeData.email);

    if (existingEmail) {
        throw new Error("Email already exists.");
    }

    // Create Employee
    const employee = await userModel.createEmployee(employeeData);

    return {
        success: true,

        message: "Employee Created Successfully",

        data: employee,
    };
};

module.exports = {
    getDashboardStatistics,

    getEmployees,

    getEmployeeByEmployeeId,


    updateEmployee,

    toggleEmployeeStatus,

    createEmployee
};
