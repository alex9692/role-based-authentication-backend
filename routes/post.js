const express = require("express");
const router = express.Router();

const passport = require("../config/passport").passport;
const postCtrl = require("../controllers/post");
const authorize = require("../config/acl");

router.get("/blog/all-posts", postCtrl.getAllPosts);

router.get("/blog/all-posts/:postId", postCtrl.getSinglePostByUser);

router.get(
	"/blog/my-posts/:id",
	passport.authenticate("jwt", { session: false }),
	authorize.auth,
	postCtrl.getPostsByUser
);

router.get(
	"/blog/my-posts/post/:postId",
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
	"/blog/delete/:id",
	passport.authenticate("jwt", { session: false }),
	authorize.auth,
	postCtrl.deletePost
);

router.patch(
	"/blog/update/:id",
	passport.authenticate("jwt", { session: false }),
	authorize.auth,
	postCtrl.updatePost
);

module.exports = router;
