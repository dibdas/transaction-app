const userRequire = require("../middlewares/userRequire");
const { userInfoController } = require("../controllers/userController");

const router = require("express").Router();
router.get("/user", userRequire, userInfoController);

module.exports = router;
