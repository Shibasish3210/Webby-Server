import { router } from "../app.js";
import isAuth from "../middlewares/isAuth.js";
import {
	createProject,
	deleteProject,
	getFeedProjects,
	getProjects,
	projectExists,
	updateProject,
	updateProjectVisibility,
} from "../model/projectModel.js";
import {
	validateProjectCreation,
	validateProjectUpdation,
} from "../utils/cleanupAndValidate.js";

const projectRoute = router();
projectRoute.use(isAuth);

projectRoute.get("/", async (req, res) => {
	const SKIP = +req.query.skip || 0;
	const { userId } = req.user;
	const projects = await getProjects(userId, SKIP);
	if (!projects) {
		return res.send({
			status: 400,
			message: "Something went wrong",
		});
	}
	return res.send({
		status: 200,
		message: "Successfully found projects",
		data: projects,
	});
});

projectRoute.get("/projects", async (req, res) => {
	const SKIP = +req.query.skip || 0;
	const projects = await getFeedProjects(SKIP);
	if (!projects) {
		return res.send({
			status: 500,
			message: "Something went wrong",
		});
	}
	return res.send({
		status: 200,
		message: "Successfully found projects",
		data: projects,
	});
});

projectRoute.post("/create", async (req, res) => {
	const { name, details, visibility } = req.body;
	const { userId } = req.user;
	console.log(name, details, visibility, userId);
	let ObjUserID;
	try {
		ObjUserID = await validateProjectCreation(
			name,
			details,
			visibility,
			userId,
		);
	} catch (err) {
		return res.send({
			status: 400,
			message: err,
		});
	}

	const projectDB = await createProject(name, details, visibility, ObjUserID);

	if (!projectDB) {
		return res.send({
			status: 500,
			message: "Database error creating project",
		});
	}

	return res.send({
		status: 200,
		message: "Project created successfully",
		data: projectDB,
	});
});

projectRoute.patch("/update", async (req, res) => {
	const { projectId, html, css, js } = req.body;
	const { userId } = req.user;

	//validating data
	try {
		await validateProjectUpdation({ html, css, js }); // validating project data
		const exists = await projectExists(projectId); //checking existence of project
		if (!exists) {
			return res.send({
				status: 400,
				message: "Project does not exist",
			});
		} else if (exists.userId.toString() !== userId) {
			//checking ownership
			return res.send({
				status: 400,
				message: "Not authorized for this operation",
			});
		}
	} catch (error) {
		console.log(error);
		return res.send({
			status: 400,
			message: error,
		});
	}

	const updatedProj = await updateProject({ projectId, html, css, js });
	if (!updatedProj) {
		return res.send({
			status: 500,
			message: "Something went wrong updating project",
		});
	}

	return res.send({
		status: 200,
		message: "Project Updated SuccessFully",
		updateProject: updatedProj,
	});
});

projectRoute.patch("/change_visibility", async (req, res) => {
	const { projectId, visibility } = req.body;
	const { userId } = req.user;

	//validating data
	try {
		if (!projectId || !visibility) {
			//checking for missing credentials
			return res.send({
				status: 400,
				message: "Missing credentials",
			});
		}

		if (visibility !== "public" && visibility !== "private") {
			//checking if visibility is valid
			return res.send({
				status: 400,
				message: "Invalid visibility",
			});
		}
		const exists = await projectExists(projectId); //checking existence of project
		if (!exists) {
			return res.send({
				status: 400,
				message: "Project does not exist",
			});
		} else if (exists.userId.toString() !== userId) {
			//checking ownership
			return res.send({
				status: 400,
				message: "Not authorized for this operation",
			});
		}
	} catch (error) {
		console.log(error);
		return res.send({
			status: 400,
			message: error,
		});
	}

	const updatedProj = await updateProjectVisibility({
		projectId,
		visibility,
	});
	if (!updatedProj) {
		return res.send({
			status: 500,
			message: "Something went wrong updating project",
		});
	}

	return res.send({
		status: 200,
		message: "Project Visibility Updated SuccessFully",
		visibility: updateProject.isPublished,
	});
});

projectRoute.delete("/delete/:projectId", async (req, res) => {
	const { projectId } = req.params;

	if (!projectId) {
		return res.send({
			status: 400,
			message: "Project Id is required",
		});
	}

	const projectExist = await projectExists(projectId);

	if (!projectExist) {
		return res.send({
			status: 400,
			message: "Project does not exist",
		});
	} else if (projectExist.userId.toString() !== req.user.userId) {
		return res.send({
			status: 400,
			message: "Unauthorized for this operation",
		});
	}

	const deletedProject = await deleteProject(projectId);
	if (!deletedProject) {
		return res.send({
			status: 500,
			message: "Something went wrong deleting this project",
		});
	}

	return res.send({
		status: 200,
		message: "Project deleted successfully",
	});
});

projectRoute.get("/:projectId", async (req, res) => {
	const { projectId } = req.params;
	// console.log(projectId, req.user);
	if (!projectId) {
		return res.send({
			status: 400,
			message: "Project Id is required",
		});
	}

	const projectExist = await projectExists(projectId);
	// console.log(projectExist);

	if (!projectExist) {
		return res.send({
			status: 400,
			message: "Project does not exist",
		});
	} else if (projectExist.userId.toString() !== req.user.userId) {
		return res.send({
			status: 400,
			message: "Unauthorized for this operation",
		});
	}

	return res.send({
		status: 200,
		message: "Project Fetched Successfully",
		data: projectExist,
	});
});

export default projectRoute;
