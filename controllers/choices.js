const { validationResult } = require("express-validator/check");
const Choice = require("../models/choice");
const User = require("../models/user");

exports.getChoices = async (req, res, next) => {
  // const currentPage = req.query.page || 1;
  // const perPage = 2;
  //   let totalItems;
  try {
    const totalItems = await Choice.find().countDocuments();
    const choices = await Choice.find({ creator: req.userId }).populate(
      "creator"
    );
    // .skip((currentPage - 1) * perPage)
    // .limit(perPage);
    res.status(200).json({
      message: "Fetched choice successfully.",
      choices: choices,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createChoice = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const category = req.body.category;
  let creator;
  const choice = new Choice({
    title: title,
    category: category,
    creator: req.userId,
  });
  choice
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.choices.push(choice);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Choice created successfully!",
        choice: choice,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getChoice = (req, res, next) => {
  const choiceId = req.params.choiceId;
  Choice.findById(choiceId)
    .then((choice) => {
      if (!choice) {
        const error = new Error("Could not find choice.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Choice fetched.", choice: choice });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateChoice = (req, res, next) => {
  const choiceId = req.params.choiceId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const category = req.body.category;
  Choice.findById(choiceId)
    .then((choice) => {
      if (!choice) {
        const error = new Error("Could not find choice.");
        error.statusCode = 404;
        throw error;
      }
      if (choice.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      choice.title = title;
      choice.category = category;
      return choice.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Choice updated!", choice: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteChoice = (req, res, next) => {
  const choiceId = req.params.choiceId;
  Choice.findById(choiceId)
    .then((choice) => {
      // Check logged in user
      if (!choice) {
        const error = new Error("Could not find choice.");
        error.statusCode = 404;
        throw error;
      }
      if (choice.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      // Check logged in user
      return Choice.findByIdAndRemove(choiceId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.choices.pull(choiceId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted choice." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.randomChoice = async (req, res, next) => {
  try {
    const choices = await Choice.find();
    const randomId = Math.floor(Math.random() * choices.length - 1) + 1;
    res.status(200).json({
      message: "Fetched random choice successfully.",
      choice: choices[randomId],
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
