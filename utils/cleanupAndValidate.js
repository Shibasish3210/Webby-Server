import validator from "validator";
import { Id } from "../db.js";

export const validateRegistration = ({ name, email, password, userName }) => {
	return new Promise((resolve, reject) => {
		if (!name || !email || !password || !userName) {
			reject("Missing Credentials");
		}

		if (typeof name !== "string") reject("Invalid datatype for name");
		if (typeof email !== "string") reject("Invalid datatype for email");
		if (typeof password !== "string")
			reject("Invalid datatype for password");
		if (typeof userName !== "string")
			reject("Invalid datatype for userName");
		// if(typeof avatar !== 'string')reject('Invalid datatype for avatar');

		if (name.length <= 3 || name.length > 50)
			reject("Name must be between 4-50 characters");
		if (password.length <= 5 || password.length >= 20)
			reject("Password must be between 6-20 characters");
		if (userName.length <= 3 || userName.length > 20)
			reject("userName must be between 4-20 characters");

		if (!validator.isEmail(email)) reject("Invalid email");
		// if(!validator.isAlphanumeric(password)) reject('password must be alphanumeric');
		// if(!validateImage(avatar)) reject('Invalid image');

		resolve();
	});
};

const validateImage = async (avatar) => {
	const res = await fetch(avatar);
	const buff = await res.blob();

	return buff.type.startsWith("image/");
};

export const validateProjectCreation = (name, details, visibility, userId) => {
	return new Promise((resolve, reject) => {
		if (!name || !details || !userId) reject("Missing Credentials");

		if (typeof name !== "string")
			reject("Invalid data type for Project name");
		if (typeof details !== "string")
			reject("Invalid data type for Project dscription");
		if (typeof visibility !== "boolean")
			reject("Invalid data type for Project visibility");
		if (typeof userId !== "string") reject("Invalid data type for User Id");

		if (name.length <= 3 || name.length >= 31)
			reject("Project name must be within 4-30 characters");
		if (details.length <= 7 || details.length >= 201)
			reject("Project details must be within 7-200 characters");

		resolve(new Id(userId));
	});
};
export const validateProjectUpdation = ({ html, css, js }) => {
	return new Promise((resolve, reject) => {
		if (
			typeof html !== "string" ||
			typeof css !== "string" ||
			typeof js !== "string"
		) {
			reject("Invalid data type for content");
		}

		resolve();
	});
};
