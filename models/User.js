const { Schema, model } = require("mongoose");

const userSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		validate: {
			validator: function (v) {
				return /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,63}$/.test(
					v
				);
			},
			message: 'Invalid Email'
		},
	},
	password: String,
});

const User = model("User", userSchema);
module.exports = User;
