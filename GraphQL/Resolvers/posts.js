const { AuthenticationError, UserInputError } = require("apollo-server");
const Post = require("../../Models/postModel");
const User = require("../../Models/userModel");
const checkAuth = require("../../utils/auth-verify");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          console.log(post);
          return post;
        } else {
          throw new Error("post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getNews(_, __, context) {
      const { id } = checkAuth(context);
      const user = await User.findById(id);
      const posts = await Post.find().sort({ createdAt: -1 });
      const postOfFollowings = posts.filter((post) => {
        const findFollowing = user.followings.find(
          (follwing) => String(follwing) === String(post.user)
          );
        return String(post.user) === String(findFollowing);
      });
      return postOfFollowings;
    },
  },

  Mutation: {
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);
      console.log(user);
      try {
        const post = await Post.findById(postId);
        console.log(post);
        if (post) {
          if (user.userName === post.userName) {
            await post.delete();
            return "Post Deleted Successfully";
          } else {
            throw new AuthenticationError("action not allowed");
          }
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async createPost(_, { caption }, context) {
      const user = checkAuth(context);
      if (caption.trim() === "") {
        throw new UserInputError("caption needed");
      }
      if (user) {
        const newPost = new Post({
          caption,
          createdAt: new Date().toISOString(),
          user: user.id,
          userName: user.userName,
        });
        try {
          const post = await newPost.save();
          context.pubSub.publish("NEW_POST", {
            newPost: post,
          });

          return post;
        } catch (err) {
          throw new Error(err);
        }
      }
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubSub }) => pubSub.asyncIterator("NEW_POST"),
    },
  },
};
