const express = require("express");
const router = express.Router();

const authorize = require('../middlewares/authorize');
const passport = require("../config/passport").passport;
const authCtrl = require("../controllers/auth.js");

router.get(
    "/secret",
	passport.authenticate("jwt", { session: false }),
    // authorize.requireAdminOnly,
	function(req, res) {
        console.log(req.user)
		res.json({ message: "Success! Only access to admins" });
	}
);

router.post("/signUp", authCtrl.signUp);

router.post("/signIn", authCtrl.signIn);

module.exports = router;
