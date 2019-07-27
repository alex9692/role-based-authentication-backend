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
							if (!user.verifyMobile) {
								console.log("please verify your account using otp");
							} else {
								console.log("account is already verified using otp");
							}
						} else {
							if (!user.verifyEmail) {
								console.log(
									"a mail has been sent to your google mail account.Please verify as soon as possible"
								);

								var urltoken = crypto.AES.encrypt(email, jwtKey).key.toString();
								const url = `http://localhost:3000/auth/verifyUsingEmail/${urltoken}`;
								var mailOptions = {
									to: "battle253@gmail.com",
									subject: "Email Verification",
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
						let message = "";
						if (!user.verifyEmail || !user.verifyMobile) {
							message = "Please verfiy your account";
						} else {
							message = "Your account is verified";
						}
						return res.status(200).json({ token, message });
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
						user.verifyMobile = true;
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
				user.sessionId = "";
				user.verifyEmail = true;
				await user.save();

				return res
					.status(200)
					.json({ message: "Account has been successfully verified" });
			} else {
				return res.status(422).send({ error: "Unknown error" });
			}
		})
		.catch(error => {
			return res.status(422).send({ error });
		});
};

exports.forgot = function(req, res) {
	const { email } = req.body;
	User.findOne({ email })
		.exec()
		.then(async user => {
			console.log(user);
			if (!user) {
				return res.status(400).send({
					error: "No account with that email or phone number has been found"
				});
			}

			const resetToken = crypto.SHA256(Date.now().toString()).toString();
			user.resetPasswordToken = resetToken;
			user.resetPasswordTokenExpiry = Date.now() + 3600000;
			await user.save();

			const url = `http://localhost:3000/auth/initResetPassword/${resetToken}`;
			var mailOptions = {
				to: "battle253@gmail.com",
				subject: "Password Reset",
				html: `
					<h5>Link to reset password</h5>
					<a href="${url}">Click here to reset your password</a>
				`
			};
			transporter.sendMail(mailOptions, function(error) {
				if (error) {
					return res.status(400).send({ error });
				} else {
					return res.send({
						message: "A Mail has been sent to your gmail account"
					});
				}
			});
		})
		.catch(err => {
			return res.status(400).send({ err });
		});
};

exports.initReset = function(req, res) {
	User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordTokenExpiry: {
			$gt: Date.now()
		}
	})
		.then(user => {
			if (user) {
				return res.send(user);
				// return res.redirect(''); //resetPage
			}
		})
		.catch(error => {
			return res.send(error);
		});
};

exports.reset = function(req, res) {
	const { newPassword, verifyPassword } = req.body;
	const token = req.params.token;

	User.findOne({
		resetPasswordToken: token,
		resetPasswordTokenExpiry: {
			$gt: Date.now()
		}
	})
		.exec()
		.then(async user => {
			if (user) {
				console.log(user);
				if (newPassword === verifyPassword) {
					const password = await bcrypt.hash(newPassword, 12);
					user.password = password;
					user.resetPasswordToken = undefined;
					user.resetPasswordTokenExpiry = undefined;

					await user.save();
					return res.send({
						user,
						message: "successfully reset your password"
					});
				} else {
					return res.send({ message: "Password do not match" });
				}
			} else {
				return res.send({ message: "cannot find the user" });
			}
		})
		.catch(error => {
			return res.send({ error });
		});
};

exports.changePassword = function(req, res) {
	const { currentPassword, newPassword, verifyPassword } = req.body;
	if (req.user) {
		if (newPassword) {
			User.findById(req.user._id)
				.exec()
				.then(async user => {
					if (user) {
						const result = await bcrypt.compare(currentPassword, user.password);
						if (!result) {
							return res.send({
								message: "your current password is incorrect"
							});
						}
						if (newPassword == verifyPassword) {
							const password = await bcrypt.hash(newPassword, 12);
							user.password = password;

							await user.save(err => {
								if (err) {
									return res.send({ err });
								} else {
									return res.send({ message: "password changed successfully" });
								}
							});
						} else {
							return res.send({ message: "password dont match" });
						}
					} else {
						return res.send({ error: "user not found" });
					}
				})
				.catch(err => {
					return res.send({ err });
				});
		} else {
			return res.send({ message: "please provide a new password" });
		}
	} else {
		return res.send({ message: "please login" });
	}
};
