const node_acl = require("acl");
const User = require("../models/auth");
const Post = require("../models/post");

let acl = null;
acl = new node_acl(new node_acl.memoryBackend());
exports.initAllow = function() {
	acl.allow([
		{
			roles: ["admin"],
			allows: [
				{
					resources: ["/users", "/secret", "/userPosts/:id"],
					permissions: ["get", "delete"]
				}
			]
		},
		{
			roles: ["user"],
			allows: [
				{
					resources: [
						"/blog/user-posts/:id",
						"/blog/user-posts/post/:postId",
						"/blog/create",
						"/blog/delete/:postId",
						"/blog/update/:postId",
						"/userPosts/:id"
					],
					permissions: ["get"]
				}
			]
		},
		{
			roles: ["guest"],
			allows: [
				{
					resources: ["/blog/all-posts", "/blog/all-posts/:id"],
					permissions: ["get"]
				}
			]
		}
	]);
};

exports.auth = async function(req, res, next) {
	const role = req.user.role ? req.user.role : "guest";

	if (req.params.postId) {
		const id = req.params.postId;
		console.log("postid" + id);
		await User.findById(req.user._id)
			.exec()
			.then(user => {
				const found = user.posts.indexOf(id);
				console.log(found);
				if (found !== -1) {
					console.log(user);
					req.found = true;
				} else {
					req.found = false;
				}
			});
	}

	if (req.found) {
		return next();
	}

	acl.areAnyRolesAllowed(
		role,
		req.route.path,
		req.method.toLowerCase(),
		(error, allowed) => {
			if (allowed) {
				console.log(req.user.role + " is allowed");
				return next();
			} else {
				console.log(req.user.role + " is not allowed");
				return res.send({
					message: "Insufficient permissions to access resource"
				});
			}
		}
	);
};
