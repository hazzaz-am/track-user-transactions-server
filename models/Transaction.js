const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
	{
		amount: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		status: {
			type: String,
			enum: ["PENDING", "APPROVED", "REJECTED"],
			default: "PENDING",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Transaction = model("Transaction", transactionSchema);
module.exports = Transaction;
