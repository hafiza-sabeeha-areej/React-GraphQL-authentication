const express = require("express");
const app = express();
const cors=require('cors')
app.use(express.json());

const graphqlHTTP = require("express-graphql").graphqlHTTP;
//For connecting GraphQL playGround
const port = 4000;
const schema = require("./schema/schema");
const mongoose = require("mongoose");
//Here it is a connection string
app.use(cors())
mongoose.connect(
  "mongodb+srv://sabeeha:abal8EHAchhHXZ60@cluster0.n89ymm4.mongodb.net/myposts"
);
//abal8EHAchhHXZ60
mongoose.connection.once("open", () => {
  console.log("Connected to Database");
});
//This is basically a middleware for "graphql" and adding schemas here
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
