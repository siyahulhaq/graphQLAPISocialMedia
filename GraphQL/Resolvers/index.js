const postsResolvers = require("./posts");
const usersResolvers = require("./users");
const commentResolvers = require("./comment");
const likeResolvers = require("./like");
module.exports = {
  Post: {
    likesCount: (parent) => parent.likes.length,
    commentsCount: (parent) => parent.comments.length,
  },
  Query: {
    ...postsResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...postsResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...likeResolvers.Mutation,
  },
  Subscription: {
    ...postsResolvers.Subscription,
  },
};
