const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const https = require("https");

const User = require("../models/auth");
const jwtKey = require("../config/settings").jwt.secretKey;
const twoFactorApiKey = require("../config/settings").twoFactor.apiKey;
const TwoFactor = new (require("2factor"))(twoFactorApiKey);

exports.signUp = function(req, res, next) {
	const { email, password, phoneNumber } = req.body;
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
						password: hashedPassword,
						phoneNumber
					});

					user
						.save()
						.then(() => {
							return res
								.status(201)
								.json({ message: "user created successfully" });
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
							jwtKey,
							{ expiresIn: 60 * 60 }
						);

						return res.status(200).json({ token, response });
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

exports.signInUsingOTP = function(req, res) {
	const { phoneNumber } = req.body;

	User.findOne({ phoneNumber })
		.exec()
		.then(user => {
			if (user) {
				TwoFactor.sendOTP(phoneNumber.toString())
					.then(sessionId => {
						console.log(sessionId);
						user.sessionId = sessionId;
						user.save().then(() => {
							return res.send({ sessionId }); // render otp insert page
						});
					})
					.catch(error => {
						return res.send({ error });
					});
			} else {
				return res.status(404).send({ error: "User doesn't exist" });
			}
		})
		.catch(error => {
			return res.send({ error });
		});
};

exports.confirmSignIn = function(req, res) {
	const { otpInput } = req.body;
	const sessionId = req.params.sessionId;

	User.findOne({ sessionId: sessionId })
		.exec()
		.then(user => {
			if (user) {
				TwoFactor.verifyOTP(sessionId, otpInput)
					.then(response => {
						const token = jwt.sign(
							{
								userId: user._id,
								email: user.email,
								role: user.role
							},
							jwtKey,
							{ expiresIn: 60 * 60 }
						);

						return res.status(200).json({ token, response });
					})
					.catch(error => {
						return res.send({ error });
					});
			}
		});
};

/*

----------------------------------------------------------------------------------------
https
							.get(
								`https://2factor.in/API/V1/${twoFactorApiKey}/SMS/${phoneNumber}/AUTOGEN`,
								resp => {
									let data = "";

									// A chunk of data has been recieved.
									resp.on("data", chunk => {
										data += chunk;
									});

									// The whole response has been received. Print out the result.
									resp.on("end", () => {
										var session = JSON.parse(data);
										
									});
								}
							)
							.on("error", err => {
								console.log("Error: " + err.message);
							});
*/
