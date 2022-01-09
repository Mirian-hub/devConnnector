const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // get token
  const token = req.header("x-auth-token");
  // check if token exists
  !token &&
    res.status(401).json({ msg: "No token provided, authorization denieds" });
  // verify token
  try {
      const decoded = jwt.verify(token, config.get('jwtSecret'))
      console.log(req)
      req.user = decoded.user
      next();
  } catch (err) {
      res.status(401).json({msg: "Unauthorised user"})
  }
};
