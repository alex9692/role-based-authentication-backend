const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto-js");
const nodemailer = require("nodemailer");

const User = require("../models/auth");
const jwtKey = require("../config/settings").jwt.secretKey;
const twoFactorApiKey = require("../config/settings").twoFactor.apiKey;
const TwoFactor = new (require("2factor"))(twoFactorApiKey);

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "battle253@gmail.com",
		pass: "crysis9692"
	}
});

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
						if (user.phoneNumber) {
							if (!user.verified) {
								console.log("please verify your account using otp");
							} else {
								console.log("account is already verified using otp");
							}
						} else {
							if (!user.verified) {
								console.log(
									"a mail has been sent to your google mail account.Please verify as soon as possible"
								);
								var urltoken = crypto.AES.encrypt(email, jwtKey).toString();
								const url = `http://localhost:3000/auth/verifyUsingEmail/${urltoken}`;
								var mailOptions = {
									to: "battle253@gmail.com",
									subject: "Sending Email using Node.js",
									html: `
										<h5>Link to verfiy account</h5>
										<a href="${url}">Click here to verify your account</a>
									`
								};

								transporter.sendMail(mailOptions, function(error, info) {
									if (error) {
										return res.send({ error });
									} else {
										return res.send({
											message: "email sent to your gmail account"
										});
									}
								});
							} else {
								console.log("account is already verified using email");
							}
						}
						const token = jwt.sign(
							{
								userId: user._id,
								email: user.email,
								role: user.role
							},
							jwtKey,
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

exports.verifyUsingOTP = function(req, res) {
	const { phoneNumber } = req.body;

	User.findOne({ phoneNumber })
		.exec()
		.then(user => {
			if (user) {
				TwoFactor.sendOTP(phoneNumber.toString())
					.then(sessionId => {
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

exports.confirmOTP = function(req, res) {
	const { otpInput } = req.body;
	const sessionId = req.params.sessionId;

	User.findOne({ sessionId: sessionId })
		.exec()
		.then(user => {
			if (user) {
				TwoFactor.verifyOTP(sessionId, otpInput)
					.then(async response => {
						user.verified = true;
						await user.save();
						return res.status(200).json({
							message: "Account has been successfully verified",
							response
						});
					})
					.catch(error => {
						return res.send({ error });
					});
			}
		});
};

exports.verifyUsingEmail = function(req, res) {
	const mailToken = req.params.token;

	const bytes = crypto.AES.decrypt(mailToken, jwtKey);
	const email = bytes.toString(crypto.enc.Utf8);
	User.findOne({ email: email })
		.exec()
		.then(async user => {
			if (user) {
				user.verified = true;
				await user.save();
				const token = jwt.sign(
					{
						userId: user._id,
						email: user.email,
						role: user.role
					},
					jwtKey,
					{ expiresIn: 60 * 60 }
				);

				return res
					.status(200)
					.json({ token, message: "Account has been successfully verified" });
			} else {
				return res.status(422).send({ error: "Unknown error" });
			}
		})
		.catch(error => {
			return res.status(422).send({ error });
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
