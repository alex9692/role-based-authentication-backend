const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authorize = require("../middlewares/authorize");
const passport = require("../config/passport").passport;
const authCtrl = require("../controllers/auth.js");
const key = require("../config/settings");

router.post("/signUp", authCtrl.signUp);

router.post("/signIn", authCtrl.signIn);

router.get("/verifyUsingEmail/:token", authCtrl.verifyUsingEmail);

router.post("/verifyUsingOTP", authCtrl.verifyUsingOTP);

router.post("/checkOtp/:sessionId", authCtrl.confirmOTP);

router.get(
	"/google",
	passport.authenticate("google", {
		scope: ["profile", "email"]
	})
);

router.get(
	"/google/redirect",
	passport.authenticate("google", { session: false }),
	(req, res) => {
		if (req.user) {
			const token = jwt.sign(
				{
					googleId: req.user.googleID,
					email: req.user.email
				},
				key.jwt.secretKey,
				{ expiresIn: 60 * 60 }
			);
			return res.send({ message: "success", token: token });
		}
		return res.send({ message: "login with different email!" });
	}
);

router.get(
	"/facebook",
	passport.authenticate("facebook", { scope: ["public_profile", "email"] })
);

router.get(
	"/facebook/redirect",
	passport.authenticate("facebook", { session: false }),
	(req, res) => {
		console.log(req.user);
		if (!req.user.err) {
			console.log(req.user);
			const token = jwt.sign(
				{
					facebookId: req.user.facebookID,
					email: req.user.email
				},
				key.jwt.secretKey,
				{ expiresIn: 60 * 60 }
			);
			return res.send({ message: "Success", token: token });
		}
		return res.send({ message: "login with different email!" });
	}
);

router.get(
	"/secret",
	passport.authenticate("jwt", { session: false }),
	// authorize.requireAdminOnly,
	function(req, res) {
		console.log("last " + req.user);
		res.json({
			message: "Welcome " + req.user.email + " !You are now logged in "
		});
	}
);

module.exports = router;
