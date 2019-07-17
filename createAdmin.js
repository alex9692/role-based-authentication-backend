const bcrypt = require("bcryptjs");
const User = require("./models/auth");

module.exports = (req, res, next) => {
	User.findOne({ role: "admin" })
		.then(user => {
			if (!user) {
				bcrypt.hash("admin", 12).then(hashPassword => {
					const admin = new User({
						email: "admin@test.com",
						password: hashPassword,
						role: "admin"
					});
					admin
						.save()
						.then(() => {
                            console.log("Admin created successfully");
						})
						.catch(error => {
							console.log(error);
						});
				});
			} else {
				console.log("Admin already exist");
			}
		})
		.catch(error => {
			console.log(error);
		});
	
};
