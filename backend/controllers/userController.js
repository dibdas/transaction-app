const { error, success } = require("../utils/responseWrapper");
const Users = require("../models/User");

const userInfoController = async (req, res) => {
  try {
    const currentUserId = req._id;
    const { email } = req.body;

    const Info = await Users.findOne({ email })
      .populate("budgets")
      .populate("transactions");

    res.status(200).json(Info);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { userInfoController };
