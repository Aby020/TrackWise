const authService = require("../services/auth.service");

const activateAccount = async (req, res) => {
  try {
    const result = await authService.activateAccount(req.body);
    res.status(200).json(result);
  } catch (error) {
    // Surface the service's specific reason (not found, deactivated,
    // already active, …) instead of masking it behind a generic message.
    res.status(400).json({
      success: false,
      message:
        error.message || "An error occurred during account activation.",
    });
  }
};
const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    // Surface the activation case distinctly so the client
    // can link straight to /activate instead of a generic
    // invalid-credentials message.
    if (error.name === "AccountNotActivatedError") {
      return res.status(400).json({
        success: false,
        message: error.message,
        needsActivation: true,
        employeeId: error.employeeId,
      });
    }

    // A wrong password (or unknown identifier) is an
    // authentication failure, not a malformed request.
    if (error.name === "InvalidCredentialsError") {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    res.status(400).json({
      success: false,
      message: "Invalid credentials.",
    });
  }
};

module.exports = {
  activateAccount,

  login,
};
