const userRequire = require("../middlewares/userRequire");
const {
  createTransactionController,
  updateTransactionController,
  deleteTransaction,
  getRecurringTransactions,
  getAllTransactions,
  getTransaction,
} = require("../controllers/transactionController");

const router = require("express").Router();
router.post("/add", userRequire, createTransactionController);
router.get("/all", userRequire, getAllTransactions);
router.post("/update", userRequire, updateTransactionController);
router.post("/delete", userRequire, deleteTransaction);
router.get("/recur", userRequire, getRecurringTransactions);
router.get("/one", userRequire, getTransaction);
module.exports = router;
