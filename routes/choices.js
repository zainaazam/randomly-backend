const express = require("express");

const choiceController = require("../controllers/choices");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", isAuth, choiceController.getChoices);

router.post("/", isAuth, choiceController.createChoice);

router.get("/:choiceId", isAuth, choiceController.getChoice);

router.put("/:choiceId", isAuth, choiceController.updateChoice);

router.delete("/:choiceId", isAuth, choiceController.deleteChoice);

router.get("/random", isAuth, choiceController.randomChoice);

module.exports = router;
