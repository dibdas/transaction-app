const Users = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const { error, success } = require("../utils/responseWrapper");

const registerController = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password) {
      return res.send(error(400, { text: `All fields are required` }));
    }

    const oldUser = await Users.findOne({ email }).select("-password");
    if (oldUser) {
      return res.send(error(409, { text: `Email already registered` }));
    }

    const hashedPassword = await bcrypt.hash(password, 9);
    const creatingUser = new Users({
      email,
      username,
      password: hashedPassword,
    });
    const user = await creatingUser.save();
    // return res.status(201).json({ user });
    return res.send(success(201, { user }));
  } catch (err) {
    console.log(err);
    return res.send(error(500, { msg: err }));
  }
};
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      //   return res.status(400).json({ text: `all fields required` });
      return res.send(error(400, { text: `All fields are required` }));
    }
    const user = await Users.findOne({ email }).select("+password");
    console.log(user);
    if (!user) {
      //   return res.status(404).json({ text: `email does not exist` });
      return res.send(error(400, { text: `user does not exist` }));
    }
    // cont userPassword
    const matchedPassword = await bcrypt.compare(password, user.password);

    if (!matchedPassword) {
      //   return res.status(404).json({ text: `incorrect password` });
      return res.send(error(404, { text: `incorrect password` }));
    }

    const accessToken = generateAccessToken({
      email: user.email,
      _id: user._id,
    });

    const refreshToken = generateRefreshToken({
      email: user.email,
      _id: user._id,
    });

    res.cookie("cookieName", refreshToken, {
      httpOnly: true, // cannot be accessed by frontend, cant be accessed by any javascript
      secure: true, // for https it is secured while attaching SSL certificates
    });
    // return res.status(200).json({
    //   user: `${user}`,
    //   accessToken: `${accessToken}`,
    // sending  the refresh token in cookie
    // refreshToken: `${refreshToken}`,
    // });
    return res.send(
      success(200, { user: `${user}`, accessToken: `${accessToken}` })
    );
    res.send("signup");
  } catch (err) {
    console.log(err);
    return res.send(error(500, { err }));
  }
};

const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "30m",
    });
    // console.log(token);
    return token;
  } catch (error) {
    console.log(error);
  }
  // return token;
};
const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: "1yr",
    });
    // console.log(token);
    return token;
  } catch (error) {
    console.log(error);
  }
  // return token;
};

const logoutController = async (req, res) => {
  try {
    res.clearCookie("	cookieName", {
      httpOnly: true, // cannot be accessed by frontend, cant be accessed by any javascript
      secure: true, // for https it is secured while attaching SSL certificates, it should work inside https
    });
    return res.send(success(200, `user logout successfully `));
  } catch (err) {
    res.send(error(500, err));
  }
};

module.exports = {
  loginController,
  registerController,
  logoutController,
};
