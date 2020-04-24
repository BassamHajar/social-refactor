const User = require("../../models/User");
const Post = require("../../models/Post");
const {
  serverError,
  validationError,
  notAuthorizedError,
  badRequestReturn,
  notFoundError,
} = require("../../errors");

// 1- Add a post
const addPost = async (req, res) => {
  validationError();

  try {
    const user = await (await User.findById(req.user.id)).isSelected(
      "-password"
    );

    const newPost = new Post({
      text: req.body.text,
      user: req.user.id,
      name: user.name,
      avatar: user.avatar,
    });

    const post = await newPost.save();
    return res.json(post);
  } catch (err) {
    serverError(res, err);
  }
};

// 2- Get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    serverError(res, err);
  }
};

// 3- Get post by id
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) notFoundError(err, "post");
    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind == "ObjectId") notFoundError(err, "post");
    serverError(res, err);
  }
};

// 4- Delete post by id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) notFoundError(err, "post");

    if (post.user.toString() !== req.user.id) notAuthorizedError(res);

    await post.remove();

    res.json({ msg: "post deleted!" });
  } catch (err) {
    if (err.kind == "ObjectId") notFoundError(err, "post");
    serverError(res, err);
  }
};

// 5- Like a post by id
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) notFoundError(err, "post");

    // check if post has been liked already
    const likeCount = post.likes.filter(
      (like) => like.user.toString() === req.user.id
    ).length;

    if (likeCount > 0) badRequestReturn(res, "Post already liked!");

    post.likes.unshift({ user: req.user.id });
    await post.save();

    res.json(post.likes);
  } catch (err) {
    serverError(res, err);
  }
};

// 6- Unlike a post by id
const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) notFoundError(err, "post");

    // check if post has been liked already
    const likeCount = post.likes.filter(
      (like) => like.user.toString() === req.user.id
    ).length;

    if (likeCount === 0) badRequestReturn(res, "Post not yet liked!");

    post.likes = post.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );

    await post.save();

    res.json(post.likes);
  } catch (err) {
    serverError(res, err);
  }
};

// 7- Add a comment to a specific post
const addComment = async (req, res) => {
  validationError();

  try {
    const user = await User.findById(req.user.id);
    const post = await Post.findById(req.params.postId);

    if (!user) notFoundError(res, "User not found!");

    if (!post) notFoundError(res, "Post not found!");

    const newComment = {
      text: req.body.text,
      user: req.user.id,
      avatar: user.avatar,
      name: user.name,
    };

    post.comments.unshift(newComment);
    await post.save();

    res.json(post.comments);
  } catch (err) {
    serverError(res, err);
  }
};

// 8- Delete a comment by postId & commentId
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) notFoundError(res, "Post not found!");

    post.comments = post.comments.filter(
      (comment) => comment.id !== req.params.commentId
    );

    if (comment.user.toString() !== req.user.id)
      notAuthorizedError(res, "User not authorized!");

    await post.save();
    res.json(post.comments);
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = {
  addPost,
  getAllPosts,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
};
