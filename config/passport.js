const User = require("../models/auth");
const passport = require("passport");
const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "secretKey";

var strategy = new JwtStrategy(opts, function(jwt_payload, done) {
	User.findOne({ _id: jwt_payload.userId }, function(err, user) {
		if (err) {
			return done(err, false);
		}
		if (user) {
			return done(null, user);
		} else {
			return done(null, false);
			// or you could create a new account
		}
	});
});

passport.use(strategy);

module.exports.passport = passport;
