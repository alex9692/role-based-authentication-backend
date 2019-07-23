const mongoose = require("mongoose");
// const chalk = require("chalk");
// const generatePassword = require("generate-password");
// const owasp = require("owasp-password-strength-test");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		required: true
	},
	password: {
		type: String
	},
	userId: {
		type: String
	},
	phoneNumber: {
		type: Number
	},
	sessionId: {
		type: String,
		default: ""
	},
	role: {
		type: String,
		default: "user"
	},
	posts: [
		{
			type: Schema.Types.ObjectId,
			ref: "Post"
		}
	]
});

module.exports = mongoose.model("User", userSchema);

// UserSchema.statics.generateRandomPassphrase = function() {
// 	return new Promise(function(resolve, reject) {
// 		var password = "";
// 		var repeatingCharacters = new RegExp("(.)\\1{2,}", "g");

// 		// iterate until the we have a valid passphrase
// 		// NOTE: Should rarely iterate more than once, but we need this to ensure no repeating characters are present
// 		while (password.length < 20 || repeatingCharacters.test(password)) {
// 			// build the random password
// 			password = generatePassword.generate({
// 				length: Math.floor(Math.random() * 20) + 20, // randomize length between 20 and 40 characters
// 				numbers: true,
// 				symbols: false,
// 				uppercase: true,
// 				excludeSimilarCharacters: true
// 			});

// 			// check if we need to remove any repeating characters
// 			password = password.replace(repeatingCharacters, "");
// 		}

// 		// Send the rejection back if the passphrase fails to pass the strength test
// 		if (owasp.test(password).errors.length) {
// 			reject(
// 				new Error(
// 					"An unexpected problem occurred while generating the random passphrase"
// 				)
// 			);
// 		} else {
// 			// resolve with the validated passphrase
// 			resolve(password);
// 		}
// 	});
// };

// userSchema.statics.seed = seed;

// mongoose.model("User", userSchema);

// /**
//  * Seeds the User collection with document (User)
//  * and provided options.
//  */
// function seed(doc, options) {
// 	var User = mongoose.model("User");

// 	return new Promise(function(resolve, reject) {
// 		skipDocument()
// 			.then(add)
// 			.then(function(response) {
// 				console.log(response);
// 				return resolve(response);
// 			})
// 			.catch(function(err) {
// 				return reject(err);
// 			});

// 		function skipDocument() {
// 			return new Promise(function(resolve, reject) {
// 				User.findOne({
// 					email: doc.email
// 				}).exec(function(err, existing) {
// 					if (err) {
// 						return reject(err);
// 					}

// 					if (!existing) {
// 						return resolve(false);
// 					}

// 					if (existing && !options.overwrite) {
// 						return resolve(true);
// 					}

// 					// Remove User (overwrite)

// 					existing.remove(function(err) {
// 						if (err) {
// 							return reject(err);
// 						}

// 						return resolve(false);
// 					});
// 				});
// 			});
// 		}

// 		function add(skip) {
// 			return new Promise(function(resolve, reject) {
// 				if (skip) {
// 					return resolve({
// 						message: chalk.yellow(
// 							"Database Seeding: User\t\t" + doc.username + " skipped"
// 						)
// 					});
// 				}

// 				User.generateRandomPassphrase()
// 					.then(function(passphrase) {
// 						var user = new User(doc);

// 						user.provider = "local";
// 						user.displayName = user.firstName + " " + user.lastName;
// 						user.password = passphrase;

// 						user.save(function(err) {
// 							if (err) {
// 								return reject(err);
// 							}

// 							return resolve({
// 								message:
// 									"Database Seeding: User\t\t" +
// 									user.username +
// 									" added with password set to " +
// 									passphrase
// 							});
// 						});
// 					})
// 					.catch(function(err) {
// 						return reject(err);
// 					});
// 			});
// 		}
// 	});
// }
