const authService = require("../services/auth.service");

const activateAccount = async (req, res) => {
  try {
    const result = await authService.activateAccount(req.body);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};
const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,

      message: error.message,
    });
  }
};

module.exports = {
  activateAccount,

  login,
};
