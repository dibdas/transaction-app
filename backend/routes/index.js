const budgetRouter = require("./budgetRouter");
const authRouter = require("./authRouter");
const transactionRouter = require("./transactionRouter");
const userRouter = require("./userRouter");
const router = require("express").Router();
router.use("/budget", budgetRouter);
router.use("/transaction", transactionRouter);
router.use("/user", authRouter);
router.use("/info", userRouter);
module.exports = router;
