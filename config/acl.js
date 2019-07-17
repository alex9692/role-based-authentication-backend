const node_acl = require("acl");
const User = require("../models/auth");

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
						"/blog/my-posts/:id",
						"/blog/my-posts/post/:postId",
						"/blog/create",
						"/blog/delete/:id",
						"/blog/update/:id",
						"/userPosts/:id"
					],
					permissions: ["get", "post", "delete", "patch"]
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

exports.auth = function(req, res, next) {
	const role = req.user.role ? req.user.role : "guest";
	acl.areAnyRolesAllowed(
		role,
		req.route.path,
		req.method.toLowerCase(),
		(error, allowed) => {
			if (allowed) {
				console.log(req.user.role + " is allowed");
				next();
			} else {
				console.log(req.user.role + " is not allowed");
				res.send({
					message: "Insufficient permissions to access resource"
				});
			}
		}
	);
};
