import validator from "validator";
import { router } from "../app.js";
import {
	createUserAndSave,
	deleteUser,
	emailExist,
	updateEmailVerified,
	uploadImageOnCloudinary,
	usernameExist,
} from "../model/userModel.js";
import {
	validateRegistration,
	validateUserUpdation,
} from "../utils/cleanupAndValidate.js";
import {
	createToken,
	createUserToken,
	validateToken,
} from "../utils/jwtToken.js";
import { sendEmail } from "../utils/nodeMailer.js";
import { decrypt, encrypt } from "../utils/password.js";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/fileHandler.js";

const authRoute = router();

authRoute.get("/authenticate", isAuth, (req, res) => {
	res.send({
		status: 200,
		message: "Authentication successful",
		user: req.user,
	});
});

authRoute.post("/register", upload.single("avatar"), async (req, res) => {
	const { name, email, password, userName, avatar } = req.body;

	try {
		await validateRegistration({ name, email, password, userName });
	} catch (error) {
		return res.send({
			status: 400,
			message: error,
		});
	}

	if (await usernameExist(userName)) {
		return res.send({
			status: 400,
			message: "Username already exists",
		});
	}
	if (await emailExist(email)) {
		return res.send({
			status: 400,
			message: "Email already exists",
		});
	}

	const hashedPassword = await encrypt(password);
	if (!hashedPassword) {
		return res.send({
			status: 500,
			message: "Server ERROR",
		});
	}

	const jwtToken = createToken(email);
	const savedUser = await createUserAndSave({
		name,
		email,
		password: hashedPassword,
		userName,
	});
	if (!savedUser) {
		return res.send({
			status: 500,
			message: "Server ERROR",
		});
	}

	const emailSent = sendEmail(email, jwtToken);

	if (!emailSent) {
		await deleteUser(savedUser._id);
		return res.send({
			status: 500,
			message: "Something went wrong while sending mail",
		});
	}

	res.send({
		status: 201,
		message: "Registration successful",
	});
});

authRoute.patch(
	"/update",
	upload.single("avatar"),
	isAuth,
	async (req, res) => {
		const error = { status: 400 };
		const { name, userName, password, newPassword } = req.body;

		// Find user
		const user = await usernameExist(req.user.userName);
		if (!user) {
			error.message = "User not found";
			return res.send(error);
		}

		try {
			await validateUserUpdation({
				name,
				userName,
				password,
				newPassword,
				actualPass: user.password,
			});
		} catch (error) {
			return res.send({ message: error.message, status: error.status });
		}

		const avatarUrl = req.file?.path;
		const avatar = await uploadImageOnCloudinary(avatarUrl); //uploaded image data
		// Update avatar if uploaded
		if (avatar) {
			user.avatar = avatar.secure_url;
		}

		// Update name if provided
		if (name && name !== user.name) {
			user.name = name;
		}

		// Update username if provided and available
		if (userName && userName !== user.userName) {
			const isUsernameTaken = await usernameExist(userName);
			if (isUsernameTaken) {
				error.message = "Username already taken";
				return res.send(error);
			}
			user.userName = userName;
		}

		// Update password if provided and matches the old password
		if (newPassword && newPassword !== user.password) {
			user.password = await encrypt(newPassword);
		}

		// Save updates
		const updatedUser = await user.save();
		if (!updatedUser) {
			error.message = "Error updating user";
			return res.send(error);
		}

		res.send({
			status: 200,
			message: "User updated successfully",
			user: {
				name: updatedUser.name,
				userName: updatedUser.userName,
				avatar: updatedUser.avatar,
				userId: updatedUser._id,
			},
		});
	},
);

authRoute.get("/verify/:token", async (req, res) => {
	const token = req.params.token;
	const error = {
		status: 500,
		message: "Internal Server Error",
	};

	let email = validateToken(token);
	if (!email) {
		res.send(error);
	}

	const response = await updateEmailVerified(email);
	if (!response) {
		res.send(error);
	}

	res.send({
		status: 200,
		message: "Successfully verified",
	});
});

authRoute.post("/login", async (req, res) => {
	const { loginId, password } = req.body;

	let user;
	if (validator.isEmail(loginId)) {
		user = await emailExist(loginId);
		if (!user) {
			return res.send({
				status: 400,
				message: `Email doesn't exist`,
			});
		}
	} else {
		user = await usernameExist(loginId);
		if (!user) {
			return res.send({
				status: 400,
				message: `Username doesn't exist`,
			});
		}
	}

	if (!user.emailVerified) {
		return res.send({
			status: 400,
			message: "Please Verify Your Email Before Logging In",
		});
	}

	const isMatching = await decrypt(password, user.password);
	if (!isMatching) {
		return res.send({
			status: 400,
			message: `Wrong Password`,
		});
	}

	const clientUser = {
		email: user.email,
		userName: user.userName,
		userId: user._id,
		avatar: user.avatar,
	};
	const USER_TOKEN = createUserToken(clientUser);

	res.send({
		status: 200,
		message: "Login successful",
		user: clientUser,
		accessToken: USER_TOKEN,
	});
});

authRoute.delete("/delete", isAuth, async (req, res) => {
	const { email, password } = req.query;
	const errorObj = {
		status: 400,
	};
	const userId = req.user.userId;

	if (!email || !password) {
		errorObj.message = "Missing credentials";
		return res.send(errorObj);
	}

	//checking if the user entered correct email
	const userDB = await emailExist(email);
	if (!userDB || userDB._id.toString() !== userId) {
		errorObj.message = `Wrong email address`;
		return res.send(errorObj);
	}

	//checking if the user entered correct password
	const isMatching = await decrypt(password, userDB.password);
	if (!isMatching) {
		errorObj.message = `Wrong Password`;
		return res.send(errorObj);
	}

	const deletedUser = await deleteUser(userId);

	if (!deletedUser) {
		res.send({
			status: 500,
			message: "Internal Server Error",
		});
	}

	res.send({
		status: 200,
		message: "Account Deleted Successfully",
	});
});

export default authRoute;
