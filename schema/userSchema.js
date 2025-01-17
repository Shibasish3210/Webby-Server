import { Schema, model } from "../db.js";

const userSchema = new Schema({
	name: {
		type: "string",
		required: true,
	},
	email: {
		type: "string",
		required: true,
		unique: true,
	},
	userName: {
		type: "string",
		required: true,
		unique: true,
	},
	password: {
		type: "string",
		required: true,
	},
	emailVerified: {
		type: "boolean",
		required: true,
		default: false,
	},
	avatar: {
		type: "string",
		required: true,
		default: "abc",
	},
});

const userModel = model("user", userSchema);

export default userModel;
