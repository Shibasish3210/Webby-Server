import { uploadOnCloudinary } from "../config/cloudinary.js";
import userModel from "../schema/userSchema.js";

export const usernameExist = async (userName) => {
	const user = await userModel.findOne({ userName: userName });

	if (!user) return false;
	return user;
};

export const emailExist = async (email) => {
	const user = await userModel.findOne({ email: email });

	if (!user) return false;
	return user;
};

export const createUserAndSave = async ({
	name,
	userName,
	email,
	password,
	avatar,
}) => {
	const userObj = new userModel({
		name,
		email,
		userName,
		password,
		avatar,
	});

	try {
		const user = await userObj.save();
		return user;
	} catch (error) {
		console.log(error);
		return null;
	}
};

export const uploadImageOnCloudinary = (patientPhoto) => {
	return new Promise(async (resolve, reject) => {
		let uploadedPatientPhoto;
	try {
		uploadedPatientPhoto = await uploadOnCloudinary(patientPhoto);
		if (!uploadedPatientPhoto)
			reject("Failed to upload image on cloudinary");
	} catch (error) {
		reject(error)
		
	}
		resolve(uploadedPatientPhoto);
	});
};

export const updateEmailVerified = async (email) => {
	try {
		const response = await userModel.findOneAndUpdate(
			{ email: email },
			{ emailVerified: true },
		);

		if (!response) return null;

		return response;
	} catch (error) {
		console.log(error);
		return null;
	}
};

export const deleteUser = async (userId) => {
	try {
		const response = await userModel.findOneAndDelete({ _id: userId });

		if (!response) return null;

		return response;
	} catch (error) {
		console.log(error);
		return null;
	}
};
