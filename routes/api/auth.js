const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const config = require("config")

const User = require("../../models/User");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json("server error");
  }
});

router.post(
  "/login",
  [
    check("email", "Please enter valid email").not().isEmpty(),
    check("password", "Please enter password").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      !user &&
        res.status(400).json({ errors: [{ msg: "Incorrect cerdentians" }] });

      const isMatch = await bcrypt.compare(password, user.password);

      !isMatch &&
        res.status(400).json({ errors: [{ msg: "Incorrect cerdentians" }] });

      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err)
      return res.status(500).json({ error: err });
    }
  }
);

module.exports = router;
