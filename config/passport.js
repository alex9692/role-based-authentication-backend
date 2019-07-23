const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const FacebookStrategy = require("passport-facebook");

const keys = require("./settings");
const User = require("../models/auth");

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.jwt.secretKey;

passport.use(
	new JwtStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: keys.jwt.secretKey
		},
		function(jwt_payload, done) {
			console.log(jwt_payload);
			User.findOne({ userId: jwt_payload.userId })
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
			User.findOne({ userId: profile.id })
				.exec()
				.then(user => {
					if (user) {
						console.log("exists");
						done(null, user);
					} else {
						console.log("doesn't exists");
						const user = new User({
							email: profile.emails[0].value,
							userId: profile.id
						});

						user
							.save()
							.then(newUser => {
								console.log("new user created:" + newUser);
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
			console.log(profile._json.id);
			User.findOne({ userId: profile._json.id })
				.exec()
				.then(fbUser => {
					if (fbUser) {
						console.log("exists");
						done(null, fbUser);
					} else {
						console.log("doesn't exists");
						const user = new User({
							userId: profile._json.id,
							email: profile._json.email
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
