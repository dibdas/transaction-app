const userRequire = require("../middlewares/userRequire");
const {
  addBudgetController,
  checkBudgetController,
  getBudgets,
} = require("../controllers/budgetController");

const router = require("express").Router();
router.get("/check", userRequire, checkBudgetController);
router.post("/add", userRequire, addBudgetController);
router.get("/all", userRequire, getBudgets);
module.exports = router;
