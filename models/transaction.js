const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
	amount: { type: String, required: true },
	interest: { type: String, default: "Not set" },
	total_amount: { type: String, required: true },
	description: { type: String, default: "Not set" },
	type: { type: String, required: true },
	store_ref_id: { type: String },
	customer_ref_id: { type: String }
});

module.exports = mongoose.model("transaction", transactionSchema);