const {
  loginController,
  registerController,
  logoutController,
} = require("../controllers/authController");

const router = require("express").Router();
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);
module.exports = router;
