const express = require("express");
const router = express.Router();

const passport = require("../config/passport").passport;
const User = require("../models/auth");
const postCtrl = require("../controllers/post");
const authorize = require("../config/acl");

router.get(
	"/userPosts/:id",
	passport.authenticate("jwt", { session: false }),
	authorize.auth,
	postCtrl.getPostsByUser
);

router.get(
	"/secret",
	passport.authenticate("jwt", { session: false }),
	authorize.auth,
	(req, res) => {
		res.json({
			message: "success",
			user: req.user
		});
	}
);

router.get(
	"/users",
	passport.authenticate("jwt", { session: false }),
	authorize.auth,
	(req, res) => {
		User.find({ role: "user" })
			.exec()
			.then(users => {
				return res.status(200).json(users);
			})
			.catch(error => res.status(400).send({ error }));
	}
);

module.exports = router;
