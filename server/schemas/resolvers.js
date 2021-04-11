const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { User, bookSchema } = require('../models');

const resolvers = {
    Query: {
        // get all users
        users: async () => {
        return User.find()
            .select('-__v -password')
            .populate('books');
        },
        // get a user by username
        user: async (parent, { username }) => {
        return User.findOne({ username })
            .select('-__v -password')
            .populate('books');
        },
        book: async (parent, { _id }) => {
            return bookSchema.findOne({ _id });
        },
        books: async (parent, { username }) => {
            const params = username ? { username } : {};
            return bookSchema.find(params).sort({ createdAt: -1 });
        },
        me: async (parent, args, context) => {
            if (context.user) {
              const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                .populate('tbooks')

          
              return userData;
            }
          
            throw new AuthenticationError('Not logged in');
        },
    },
    Mutation: {
      addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);
      
        return { token, user };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
      
        if (!user) {
          throw new AuthenticationError('Incorrect credentials');
        }
      
        const correctPw = await user.isCorrectPassword(password);
      
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }
      
        const token = signToken(user);
        return { token, user };
      },
      saveBook: async (parent, { input }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: input } },
            { new: true }
          ).populate('friends');
      
          return updatedUser;
        }
      
        throw new AuthenticationError('You need to be logged in!');
      },      
      removeBook: async (parent, { delBookId }, context) => {
        if (context.user) {
          const updatedUser = await User.findByIdAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId: delBookId } } },
            { new: true }
          );
      
          return updatedUser;
        }
      
        throw new AuthenticationError('You need to be logged in!');
      }

    }
  };
  
  module.exports = resolvers;