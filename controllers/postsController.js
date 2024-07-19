const asyncHandler = require('express-async-handler');
const Post = require('../models/post');
const Like = require('../models/like');
const Comment = require('../models/comment');
const Follow = require('../models/follow');
const like = require('../models/like');
const Media = require('../models/media');
const cloudinary = require('cloudinary').v2;

const getPersonalizedPosts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user.id;

  const follows = await Follow.find({ follower: userId }, 'followed');
  const followedIds = follows.map((follow) => follow.followed);
  const allRelevantUserIds = [userId, ...followedIds];

  const totalPosts = await Post.countDocuments({});
  const totalPages = Math.ceil(totalPosts / limit);
  const hasNextPage = page < totalPosts;

  let posts = await Post.find({})
    .populate('author', 'profilePicture firstName')
    .populate('media', 'url')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // TODO add personalized posts!!!

  // let posts = await Post.find({
  //   author: { $in: allRelevantUserIds },
  // })
  //   .populate('author', 'profilePicture firstName')
  //   .sort({ createdAt: -1 })
  //   .skip((page - 1) * limit)
  //   .limit(limit);

  // if (posts.length < limit) {
  //   const extraPostsNeeded = limit - posts.length;
  //   const randomPosts = await Post.find({
  //     author: { $nin: allRelevantUserIds },
  //   })
  //     .populate('author', 'profilePicture firstName')
  //     .sort({ createdAt: -1 })
  //     .limit(extraPostsNeeded);
  //   posts = [...posts, ...randomPosts];
  // }

  const likedPostsIds = await Like.find({ user: userId }).select('post');
  const likedPostsSet = new Set(likedPostsIds.map((lp) => lp.post.toString()));

  const postsWithLikes = posts.map((post) => ({
    ...post.toObject(),
    likedByUser: likedPostsSet.has(post._id.toString()),
  }));

  return res.status(200).json({
    posts: postsWithLikes,
    currentPage: page,
    hasNextPage: hasNextPage,
    totalPages: totalPages,
  });
});

const getPost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findById(postId).populate(
    'author',
    'firstName profilePicture'
  );
  if (!post) {
    return res.status(404).json({ message: 'Post not found!' });
  }

  const comments = await Comment.find({ post: postId }).populate(
    'author',
    'firstName'
  );
  if (!comments) {
    return res.status(404).json({ message: 'Comments not found!' });
  }
  return res.status(200).json({ post, comments });
});

const getPostLikes = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const likes = await Like.find({ post: postId });

  if (!likes) {
    return res.status(404).json({ message: 'No likes found for this post!' });
  }

  return res.status(200).json({ likesCount: likes.length, likes: likes });
});

const getPostComments = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const comments = await Comment.find({ post: postId }).populate(
    'author',
    'firstName'
  );

  if (!comments) {
    return res
      .status(404)
      .json({ message: 'No comments found for this post!' });
  }

  return res
    .status(200)
    .json({ commentsCount: comments.length, comments: comments });
});

const createPost = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const author = req.user.id;

  const newPost = new Post({
    content,
    author,
  });

  if (req.file) {
    try {
      const result = await cloudinaryUpload(
        req.file.buffer,
        'odin-book-medias'
      );
      console.log('Profile picture upload successful:', result);
      const newMedia = new Media({
        url: result.url,
        type: 'image',
        post: newPost._id,
        publicId: result.public_id,
      });

      await newMedia.save();
      newPost.media = newMedia._id;
    } catch (error) {
      console.error('Upload failed', error);
      if (error.message === 'An unknown file format not allowed')
        return res.status(500).json({
          error: `Image must be in: 'jpg', 'png', 'gif' or 'webp' format.`,
        });
      return res
        .status(500)
        .json({ error: `Failed to upload image: ${error.message}` });
    }
  }

  const savedPost = await newPost.save();
  return res.status(201).json({ post: savedPost });
});

const updatePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { content } = req.body;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ message: `Post not found!` });
  }

  if (post.author.toString() !== req.user.id.toString()) {
    return res
      .status(403)
      .json({ message: 'User not authorized to update this post!' });
  }

  post.content = content || post.content;
  const updatedPost = await post.save();

  return res.status(200).json({ post: updatedPost });
});

const deletePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ message: 'Post not found!' });
  }

  if (
    post.author.toString() !== req.user.id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res
      .status(403)
      .json({ message: 'User not authorized to delete this post!' });
  }

  const media = await Media.findOne({ post: postId });

  // Remove media from cloudinary
  if (media) {
    cloudinary.uploader
      .destroy(media.publicId, { type: 'upload', resource_type: 'image' })
      .then((result) => {
        console.log(`Media successfully removed from cloudinary: `, result);
      })
      .catch((error) => {
        console.log('Error removing media: ', error);
      });
  }

  const deletedComments = await Comment.deleteMany({ post: postId });
  const deletedLikes = await like.deleteMany({ post: postId });
  const deletedMedia = await Media.deleteMany({ post: postId });
  const deletedPost = await Post.findByIdAndDelete(postId);

  console.log(`MEDIA: `, deletedMedia.deletedCount);

  return res.status(200).json({
    message: 'Post deleted',
    deletedPost: deletedPost,
    deletedComments: deletedComments.deletedCount,
    deletedLikes: deletedLikes.deletedCount,
    deletedMedia: deletedMedia.deletedCount,
  });
});

module.exports = {
  getPersonalizedPosts,
  getPost,
  getPostLikes,
  getPostComments,
  createPost,
  updatePost,
  deletePost,
};
