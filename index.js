require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./connectDb");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const Transaction = require("./models/Transaction");

const app = express();
const port = process.env.PORT || 5000;

app.use([
	cors({
		origin: [
			"http://localhost:5173",
			// "https://track-user-transactions.vercel.app",
		],
		credentials: true,
	}),
	express.json(),
]);

// registration route
app.post("/register", async (req, res, next) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		return res.status(400).json({ message: "Invalid Data" });
	}
	try {
		let user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({ message: "User already exists" });
		}

		user = new User({ name, email, password });

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);
		user.password = hash;

		await user.save();

		return res.status(201).json({ message: "User Created Successfully", user });
	} catch (error) {
		next(error);
	}
});

// login route
app.post("/login", async (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ message: "Invalid Data" });
	}
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ message: "Invalid Credential" });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid Credential" });
		}

		return res.status(200).json({ message: "Login Successful", user });
	} catch (e) {
		next(e);
	}
});

// USER ACCESS
app.get("/transactions", async (req, res) => {
	let query = {};

	try {
		if (req?.query?.email) {
			query = { email: req.query.email };
		}
		const userTransactions = await Transaction.find(query).sort({
			createdAt: -1,
		});
		res.status(200).json(userTransactions);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch Transactions" });
	}
});

// submit transaction
app.post("/transactions", async (req, res) => {
	try {
		const newTransaction = req.body;
		const transactions = await Transaction.create(newTransaction);
		res.status(200).json(transactions);
	} catch (err) {
		res.status(500).json({ message: "Failed to add Transaction" });
	}
});

// ADMIN ACCESS
// transactions route
app.get("/transactions", async (req, res) => {
	try {
		const transactions = await Transaction.find().sort({ createdAt: -1 });
		res.status(200).json(transactions);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch Transactions" });
	}
});

// approve transaction route
app.put("/update-transaction/:id", async (req, res) => {
	const id = req.params.id;
	const transaction = req.body;
	try {
		const updatedTransaction = await Transaction.findByIdAndUpdate(
			id,
			transaction
		);

		if (!updatedTransaction) {
			res.status(404).json({ message: "Transaction not found" });
		}

		res.status(200).send({
			message: "Transaction updated successfully",
			transaction: updatedTransaction,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update Transaction" });
	}
});

app.get("/", (_req, res) => {
	res.send({ message: "OK" });
});

app.use((err, req, res, next) => {
	console.log(err);
	res.status(500).json({ message: "Server Error" });
});

// mongodb connection
connectDB(
	`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mw3xt.mongodb.net/trackTransactionsDB?retryWrites=true&w=majority&appName=Cluster0`
)
	.then(() => {
		console.log("Database Connected");
		app.listen(port, () => {
			console.log(`app is listening on PORT: ${port}`);
		});
	})
	.catch((e) => console.log(e));
