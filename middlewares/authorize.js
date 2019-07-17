const User = require("../models/auth");

exports.requireAdminOnly = function(req, res, next) {
	User.findOne({ _id: req.user._id }).then(user => {
		if (!user) {
			return res.status(401).send({ error: "Not Authorized" });
		}
		if (user.role !== "admin") {
			return res.status(401).send({ error: "Not Authorized" });
		}
		next();
	});
};
