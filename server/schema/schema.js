const graphql = require("graphql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); //For creating Token
require("dotenv").config(); //Loading environmental variables

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLSchema,
} = graphql;
const Post = require("../models/post");
const User = require("../models/user");
const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
  }),
});
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    username: { type: GraphQLString },
    password: { type: GraphQLString },
  }),
});
//Authentication
const LogInType = new GraphQLObjectType({
  name: 'LogIn',
  fields: () => ({
    token: { type: GraphQLString },
    user: { type: UserType },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    post: {
      type: PostType,
      args: {
        id: { type: GraphQLString },
      },
      resolve(parent, args) {
        return Post.findById(args.id);
      },
    },
    posts: {
      type: GraphQLList(PostType),
      resolve(parent, args) {
        return Post.find({});
      },
    },
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLString },
      },
      resolve(parent, args) {
        return User.findById(args.id);
      },
    },
    users: {
      type: GraphQLList(UserType),
      resolve(parent, args) {
        return User.find({});
      },
    },
  },
});
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addPost: {
      type: PostType,
      args: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
      },
      resolve(parent, args) {
        const post = new Post({
          title: args.title,
          description: args.description,
        });
        return post.save();
      },
    },
    addUser: {
      type: UserType,
      args: {
        username: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(parent, args) {
        try {
          const { username, password } = args;

          // Hash the password
          //It taking password as well as timees to apply algo
          const hashedPassword = await bcrypt.hash(password, 10);
          const user = new User({
            //Now It will go to the UserSchema and Will perform remaining operations
            username,
            password: hashedPassword, // Store the hashed password
          });
          const savedUser = await user.save();

          return savedUser;
        } catch (error) {
          throw new Error(`Error creating user: ${error.message}`);
        }
      },
    },
    logIn: {
      type: LogInType,
      args: {
        username: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        // Mutation logic goes here
        // Retrieve the username and password from the arguments
        const { username, password } = args;
        // Fetch the user from the database based on the provided username:
        const user = await User.findOne({ username });
        console.log("user", user);
        if (!user) {
          throw new Error("User Not Found");
        }
        console.log("Entered Usernam",username);
        console.log("Db Password",user.password)
        // Compare the provided password with the stored hashed password:
        const isPasswordValid = bcrypt.compare(password, user.password);
        console.log("Entered password",password)
        console.log("Db Password",user.password)
        console.log(isPasswordValid);
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }
        // Generate a JWT token
        const token = jwt.sign({ username }, process.env.JWT_SECRET, {
          expiresIn: "1h", // Set the expiration time as desired
        });
        
        // Return the token and user information in the response
        return {
          token,
          user,
        };
      },
    },
    
  },
});
const Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
module.exports = Schema;
