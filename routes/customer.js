const express = require("express");
const router = express.Router();
const customerController = require("./../controllers/customer.controller.js");
const bodyValidator = require("../util/body_validator");

const auth = require("../auth/auth");
router.use("/customer", auth);
router.post(
  "/customer/new",
  customerController.validate("body"),
  bodyValidator,
  customerController.create
);
router.get("/customer", customerController.getAll);
router.put(
  "/customer/update/:customerId",
  customerController.validate("body"),
  bodyValidator,
  customerController.updateById
);
router.delete("/customer/delete/:customerId", customerController.deleteById);
router.get("/customer/:customerId", customerController.getById);

module.exports = router;
