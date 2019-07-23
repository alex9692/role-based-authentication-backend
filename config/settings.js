module.exports = {
	databaseURI: "mongodb://localhost:27017/blog-app",
	google: {
		clientID:
			"976712279996-fbofo359phe32orslh1nktonr3virlij.apps.googleusercontent.com",
		clientSecret: "UVnKBGu1kht62iog2jdCFS6n"
	},
	facebook: {
		appID: "2575063692513553",
		appSecret: "485ace65e45f5179f78f99b4b2f5d1d4"
	},
	mongodb: {
		dbURI:
			"mongodb+srv://alex:password12345@oauth-6e2th.mongodb.net/test?retryWrites=true&w=majority"
	},
	jwt: {
		secretKey: "secretKey"
	}
	// session:{
	//     cookieKey: 'oauthtestkey'
	// }
};
