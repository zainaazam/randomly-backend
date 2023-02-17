const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");

const choicesRoutes = require("./routes/choices");
const authRoutes = require("./routes/auth");

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/choices", choicesRoutes);
app.use("/auth", authRoutes);

app.use(helmet());

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(
    "mongodb+srv://zaina:QYrOBII5ufCQctFu@cluster0.rafi1ia.mongodb.net/randomly?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to database");
    app.listen(8080);
  })
  .catch((err) => console.log(err));
