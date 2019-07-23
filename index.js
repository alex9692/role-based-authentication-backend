const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const app = express();

const passportSetup = require("./config/passport");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const adminRoutes = require("./routes/test");
const config = require("./config/settings");
const admin = require("./createAdmin");
const acl = require("./config/acl");

const PORT = process.env.PORT || 3000;

app.use(passport.initialize());
app.use(bodyParser.json());
app.use("/auth", authRoutes);
app.use("/", postRoutes);
app.use("/", adminRoutes);
admin();

mongoose
	.connect(config.databaseURI, {
		useNewUrlParser: true
	})
	.then(() => {
		acl.initAllow();
	})
	.then(() => {
		app.listen(PORT, () => {
			console.log("running in PORT: ", PORT);
		});
	})
	.catch(err => {
		console.log(err);
	});
