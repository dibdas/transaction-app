const jwt = require("jsonwebtoken");
const Users = require("../models/User");
const { error, success } = require("../utils/responseWrapper");
const userRequire = async (req, res, next) => {
  console.log(`I am inside middleware `);
  console.log("req.headers", req.headers.authorization);

  if (
    !req.headers ||
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res.send(
      error(401, {
        message: `authorization header is required, you are not authorized to access this`,
      })
    );
  }

  const accesstoken = req.headers.authorization.split(" ")[1];
  console.log(`access token inside middleware userRequire`, accesstoken);

  try {
    const decodedVerifiedToken = jwt.verify(
      accesstoken,
      process.env.ACCESS_TOKEN_PRIVATE_KEY
    );

    req._id = decodedVerifiedToken._id; // gettig id from the decoded token and sending it as request to the next function
    req.email = decodedVerifiedToken.email; // geting the email from the decode token and it as request to the next function
    console.log("req.email", req.email);
    console.log("req id", req._id);
    const user = await Users.findById(req._id);
    if (!user) {
      return res.send(error(404, "user not found"));
    }

    next();
  } catch (err) {
    console.log("err user require", err);
    return res.send(
      error(401, { message: `Access token got expired so Invalid access Key` })
    );
  }
};
module.exports = userRequire;
