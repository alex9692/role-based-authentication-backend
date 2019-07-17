const User = require("../models/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signUp = function(req, res, next) {
	const { email, password } = req.body;
	User.findOne({ email })
		.then(user => {
			if (user) {
				return res.status(422).send({ error: "User already exist" });
			}

			bcrypt
				.hash(password, 12)
				.then(hashedPassword => {
					const user = new User({
						email,
						password: hashedPassword
					});

					user
						.save()
						.then(() => {
							res.status(201).json({ message: "user created successfully" });
						})
						.catch(error => {
							return res.status(422).send({ error });
						});
				})
				.catch(error => {
					return res.status(500).send({ error: "Hashing failed" });
				});
		})
		.catch(error => {
			return res.status(400).send({ error });
		});
};

exports.signIn = function(req, res, next) {
	const { email, password } = req.body;

	User.findOne({ email })
		.then(user => {
			if (!user) {
				return res.status(404).send({ error: "User doesn't exist" });
			}

			bcrypt
				.compare(password, user.password)
				.then(result => {
					if (result) {
						const token = jwt.sign(
							{
								userId: user._id,
								email: user.email,
								role: user.role
							},
							"secret",
							{ expiresIn: 60 * 60 }
						);

						return res.status(200).json({ token });
					} else {
						return res.status(422).send({ error: "Wrong email or password" });
					}
				})
				.catch(error => {
					return res.status(422).send({ error });
				});
		})
		.catch(error => {
			return res.status(400).send({ error });
		});
};
