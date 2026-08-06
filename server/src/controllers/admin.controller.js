const adminService = require("../services/admin.service");

const getDashboardStatistics = async (req, res) => {

    try {

        const result =
            await adminService.getDashboardStatistics();

        res.status(200).json(result);

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};
const getEmployees = async (req, res) => {

    try {

        const result =
            await adminService.getEmployees();

        res.status(200).json(result);

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};
const getEmployeeByEmployeeId = async (req, res) => {

    try {

        const result =
            await adminService.getEmployeeByEmployeeId(

                req.params.employeeId

            );

        res.status(200).json(result);

    } catch (error) {

        res.status(404).json({

            success: false,

            message: error.message

        });

    }

};
const updateEmployee = async (req, res) => {

    try {

        const result = await adminService.updateEmployee(

            req.params.employeeId,

            req.body

        );

        res.status(200).json(result);

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};
const toggleEmployeeStatus = async (req, res) => {

    try {

        const result =
            await adminService.toggleEmployeeStatus(

                req.params.employeeId

            );

        res.status(200).json(result);

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};
const createEmployee = async (req, res) => {

    try {

        const result = await adminService.createEmployee(
            req.body
        );

        res.status(201).json(result);

    } catch (error) {

        // Expected business errors (duplicate ID / email) are 400s; anything
        // else is an unexpected 500.
        const isExpected =
            error.message.includes("already exists") ||
            error.message.includes("Invalid");

        res.status(isExpected ? 400 : 500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    getDashboardStatistics,

    getEmployees,

    getEmployeeByEmployeeId,

    updateEmployee,

    toggleEmployeeStatus,

    createEmployee

};