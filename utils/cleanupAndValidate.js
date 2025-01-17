import validator from "validator";
import { Id } from "../db.js";
import { decrypt } from "./password.js";

class ApiError extends Error {
	constructor(message, status = 400) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

export const validateRegistration = ({ name, email, password, userName }) => {
	return new Promise((resolve, reject) => {
		if (!name || !email || !password || !userName) {
			reject(new ApiError("Missing Credentials"));
		}

		if (typeof name !== "string")
			reject(new ApiError("Invalid datatype for name"));
		if (typeof email !== "string")
			reject(new ApiError("Invalid datatype for email"));
		if (typeof password !== "string")
			reject(new ApiError("Invalid datatype for password"));
		if (typeof userName !== "string")
			reject(new ApiError("Invalid datatype for userName"));

		if (name.length <= 3 || name.length > 50)
			reject(new ApiError("Name must be between 4-50 characters"));
		if (password.length <= 5 || password.length >= 20)
			reject(new ApiError("Password must be between 6-20 characters"));
		if (userName.length <= 3 || userName.length > 20)
			reject(new ApiError("userName must be between 4-20 characters"));

		if (!validator.isEmail(email)) reject(new ApiError("Invalid email"));

		resolve();
	});
};
export const validateUserUpdation = async ({
	name,
	userName,
	password,
	newPassword,
	actualPass,
}) => {
	if (!password) {
		return Promise.reject(
			new ApiError("Password is needed to update user"),
		);
	}
	if (typeof password !== "string") {
		return Promise.reject(new ApiError("Invalid datatype for password"));
	}
	console.log(password, actualPass)
	const isPasswordMatching = await decrypt(password, actualPass);
	if (!isPasswordMatching) {
		return Promise.reject(new ApiError("Wrong Password"));
	}
	return new Promise((resolve, reject) => {
		if (name && typeof name !== "string")
			reject(new ApiError("Invalid datatype for name"));

		if (newPassword && typeof newPassword !== "string") {
			reject(new ApiError("Invalid datatype for password"));
		} else if (
			newPassword &&
			(newPassword.length <= 5 || newPassword.length >= 20)
		) {
			reject(new ApiError("Password must be between 6-20 characters"));
		}

		if (name.length <= 3 || name.length > 50)
			reject(new ApiError("Name must be between 4-50 characters"));
		if (userName.length <= 3 || userName.length > 20)
			reject(new ApiError("userName must be between 4-20 characters"));

		resolve();
	});
};

export const validateProjectCreation = (name, details, visibility, userId) => {
	return new Promise((resolve, reject) => {
		if (!name || !details || !userId)
			reject(new ApiError("Missing Credentials"));

		if (typeof name !== "string")
			reject(new ApiError("Invalid data type for Project name"));
		if (typeof details !== "string")
			reject(new ApiError("Invalid data type for Project description"));
		if (typeof visibility !== "boolean")
			reject(new ApiError("Invalid data type for Project visibility"));
		if (typeof userId !== "string")
			reject(new ApiError("Invalid data type for User Id"));

		if (name.length <= 3 || name.length >= 31)
			reject(new ApiError("Project name must be within 4-30 characters"));
		if (details.length <= 7 || details.length >= 201)
			reject(
				new ApiError("Project details must be within 7-200 characters"),
			);

		resolve(Id.createFromTime(userId));
	});
};

export const validateProjectUpdation = ({ html, css, js }) => {
	if (
		typeof html !== "string" ||
		typeof css !== "string" ||
		typeof js !== "string"
	) {
		return Promise.reject(new ApiError("Invalid data type for content"));
	}

	return Promise.resolve();
};
