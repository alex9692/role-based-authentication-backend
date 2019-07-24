const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const FacebookStrategy = require("passport-facebook");

const keys = require("./settings");
const User = require("../models/auth");

passport.use(
	new JwtStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: keys.jwt.secretKey
		},
		function(jwt_payload, done) {
			console.log(jwt_payload);
			User.findOne({
				$or: [{ googleID: jwt_payload.googleId }, { _id: jwt_payload.userId }]
			})
				.exec()
				.then(user => {
					if (user) {
						return done(null, user);
					} else {
						return done(null, false);
					}
				})
				.catch(err => {
					return done(err, false);
				});
		}
	)
);

passport.use(
	new GoogleStrategy(
		{
			callbackURL: "/auth/google/redirect",
			clientID: keys.google.clientID,
			clientSecret: keys.google.clientSecret
		},
		(accessToken, refreshToken, profile, done) => {
			User.findOne({ email: profile.emails[0].value })
				.exec()
				.then(user => {
					if (user) {
						if (!user.googleID) {
							console.log("email is already in use with another account");

							done(null, { err: true });
						} else {
							console.log("email is already linked with google");
							done(null, user);
						}
					} else {
						console.log("email is not in use you can login with google");
						const user = new User({
							email: profile.emails[0].value,
							googleID: profile.id
						});
						user
							.save()
							.then(newUser => {
								console.log("new user created " + newUser);
								done(null, newUser);
							})
							.catch(error => {
								console.log(error);
							});
					}
				});
		}
	)
);

passport.use(
	new FacebookStrategy(
		{
			clientID: keys.facebook.appID,
			clientSecret: keys.facebook.appSecret,
			callbackURL: "http://localhost:3000/auth/facebook/redirect",
			profileFields: ["id", "displayName", "photos", "email", "gender", "name"]
		},
		(accessToken, refreshToken, profile, done) => {
			User.findOne({ email: profile._json.email })
				.exec()
				.then(user => {
					if (user) {
						if (!user.facebookID) {
							console.log("email is already in use with another account");
							done(null, { err: true });
						} else {
							console.log("email is already linked with facebook");
							done(null, user);
						}
					} else {
						console.log("email is not in use you can login with facebook");
						const user = new User({
							email: profile._json.email,
							facebookID: profile._json.id
						});
						user
							.save()
							.then(newUser => {
								console.log("new user created " + newUser);
								done(null, newUser);
							})
							.catch(error => {
								console.log(error);
							});
					}
				});
		}
	)
);

module.exports.passport = passport;
