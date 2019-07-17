const Post = require("../models/post");
const User = require("../models/auth");

exports.getAllPosts = function(req, res) {
	Post.find({})
		.select("-__v")
		.exec()
		.then(result => {
			return res.status(200).json(result);
		})
		.catch(error => {
			return res.status(404).send({ error });
		});
};

exports.getPostsByUser = function(req, res) {
	const id = req.params.id;
	User.findById(id)
		.populate("posts")
		.exec()
		.then(result => {
			return res.status(200).json(result.posts);
		})
		.catch(error => {
			return res.status(422).send({ error });
		});
};

exports.getSinglePostByUser = function(req, res) {
	const id = req.params.postId;
	Post.findById(id)
		.then(post => {
			if (post) {
				return res.status(200).json(post);
			}
			return res.status(422).send({ error: "Not found" });
		})
		.catch(error => {
			return res.status(422).send({ error });
		});
};

exports.createPost = function(req, res) {
	const { title, content } = req.body;
	const user = req.user;
	const post = new Post({
		title,
		content,
		user
	});
	post
		.save()
		.then(newBlog => {
			return newBlog;
		})
		.then(newBlog => {
			User.findByIdAndUpdate(
				user._id,
				{ $push: { posts: newBlog } },
				{ new: true }
			)
				.then(result => {
					return res.status(200).json(result);
				})
				.catch(error => {
					return res.status(500).send({ error });
				});
		})
		.catch(error => {
			return res.status(422).send(error);
		});
};

exports.deletePost = function(req, res) {
	const id = req.params.id;
	const user = req.user;
	Post.deleteOne({ _id: id })
		.then(() => {
			User.findByIdAndUpdate(
				user._id,
				{ $pull: { posts: id } },
				{ safe: true, upsert: true }
			)
				.then(() => {
					return res.status(200).send({ messages: "deleted successfully" });
				})
				.catch(error => {
					return res.status(404).send({ error });
				});
		})
		.catch(error => {
			return res.status(422).send({ error });
		});
};

exports.updatePost = function(req, res) {
	const id = req.params.id;
	Post.findByIdAndUpdate(id, { $set: { ...req.body } })
		.then(() => {
			return res.status(200).json({ message: "successfully update" });
		})
		.catch(error => {
			return res.status(404).send({ error });
		});
};
