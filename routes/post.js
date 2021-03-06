const express = require("express");
const router = express.Router();

const passport = require("../config/passport").passport;
const postCtrl = require("../controllers/post");
const authorize = require("../config/acl");

router.get("/blog/all-posts", postCtrl.getAllPosts);

router.get("/blog/all-posts/:postId", postCtrl.getSinglePostByUser);

router.get(
	"/blog/user-posts/:userId",
	passport.authenticate("jwt", { session: false }),
	authorize.auth,
	postCtrl.getPostsByUser
);

router.get(
	"/blog/user-posts/post/:postId",
	passport.authenticate("jwt", { session: false }),
	authorize.auth,
	postCtrl.getSinglePostByUser
);

router.post(
	"/blog/create",
	passport.authenticate("jwt", { session: false }),
	authorize.auth,
	postCtrl.createPost
);

router.delete(
	"/blog/delete/:postId",
	passport.authenticate("jwt", { session: false }),
	authorize.auth,
	postCtrl.deletePost
);

router.patch(
	"/blog/update/:postId",
	passport.authenticate("jwt", { session: false }),
	authorize.auth,
	postCtrl.updatePost
);

module.exports = router;
