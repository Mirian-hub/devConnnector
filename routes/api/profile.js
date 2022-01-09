const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { compare } = require("bcryptjs");
const { route } = require("./users");

// @route Get api/profile profile
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    return res.json(profiles);
  } catch (error) {
    console.log(error.message);
  }
});

// @route Get api/profile/user/:user_id profile
router.get("/user/:user_id", async (req, res) => {
  try {
    const profiles = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profiles) {
      return res.status(400).json("No Profile for this user");
    }
    return res.json(profiles);
  } catch (error) {
    console.log(error.message);
  }
});

// @route Get api/profile
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    return res.json(profiles);
  } catch (error) {
    console.log(error.message);
  }
});

// @route Delete api/profile
router.delete("/", auth, async (req, res) => {
  try {
    //remove profile
    await Profile.findOneAndDelete({ user: req.user.id });
    //remove user
    await User.findOneAndDelete({ _id: req.user.id });

    return res.json({ msg: "User and Profile deleted" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json("Server Error");
  }
});

// @route Get api/profile/me
// Get Current User Profile

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({ msg: "No Profile for this user" });
    }
  } catch (err) {
    // console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// @route POST api/profile
router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required").not().isEmpty(),
      check("skills", "skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      skills,
      githubUserName,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    company && (profileFields.company = company);
    website && (profileFields.website = website);
    bio && (profileFields.bio = bio);
    status && (profileFields.status = status);
    location && (profileFields.location = location);
    githubUserName && (profileFields.githubUserName = githubUserName);
    skills && (profileFields.skills = skills.split(",").map((s) => s.trim()));

    profileFields.social = {};
    youtube && (profileFields.social.youtube = youtube);
    twitter && (profileFields.social.twitter = twitter);
    facebook && (profileFields.social.facebook = facebook);
    linkedin && (profileFields.social.linkedin = linkedin);
    instagram && (profileFields.social.instagram = instagram);
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      // console.log(profile)
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }
      //Create
      profile = new Profile(profileFields);
      await profile.save();
      return res.json(JSON.stringify(profile));

      return res.json(profile);
    } catch (err) {
      // console.log(err);
      return res.status(500).json("server error");
    }
  }
);

// @route Get api/profile/experiance
// Update user experiances

router.put(
  "/experiance",
  [
    auth,
    [
      check("company", "company is required").not().isEmpty(),
      check("title", "title is required").not().isEmpty(),
      check("from", "Date from is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()})
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current, 
      description
    }= req.body

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current, 
      description
    }

    try {
      let profile  = await Profile.findOne({user: req.user.id })
      profile.experience.unshift(newExp)
      await profile.save()
      return res.json(profile)
    } catch (error) {
      console.log(error)
      return res.status(500).json('server erro')
    }
  }
);

// @route Delete api/profile/experiance
// Delete profile experiances

router.delete('/expreriance', auth, async (req, res) => {
   try {
     let profile = await Profile.findOne({user: req.user.id})
     profile.experience = []
     await profile.save()
     return res.json(profile)
   } catch (error) {
     console.log(error)
     return res.status(500).json('server error')
   }
})

// @route Delete api/profile/experiance/:exp_id
// Delete profile experiance
router.delete('/expreriance/:exp_id', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({user: req.user.id})
    const deleteindex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)
    deleteindex === -1 && res.status(400).json({err: 'No such experiance'})
    profile.experience.splice(deleteindex, 1)
    await profile.save()
    return res.json(profile)
  } catch (error) {
    console.log(error)
    return res.status(500).json('server error')
  }
})



router.delete('/education/:exp_id', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({user: req.user.id})
    const deleteindex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)
    deleteindex === -1 && res.status(400).json({err: 'No such experiance'})
    profile.experience.splice(deleteindex, 1)
    await profile.save()
    return res.json(profile)
  } catch (error) {
    console.log(error)
    return res.status(500).json('server error')
  }
})


// @route put, /education 
// add education to profile

router.put(
  "/education",
  [
    auth,
    [
      check("school", "company is required").not().isEmpty(),
      check("title", "title is required").not().isEmpty(),
      check("from", "Date from is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()})
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current, 
      description
    }= req.body

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current, 
      description
    }

    try {
      let profile  = await Profile.findOne({user: req.user.id })
      profile.experience.unshift(newExp)
      await profile.save()
      return res.json(profile)
    } catch (error) {
      console.log(error)
      return res.status(500).json('server erro')
    }
  }
);

module.exports = router;
