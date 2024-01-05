import { Id } from "../db.js";
import projectModel from "../schema/projectSchema.js"

export const createProject = async (name,userId)=>{
    const project = new projectModel({
        name,
        userId,
        createdAt: Date.now(),
    });

    try {
        const projectDb = await project.save();
        return projectDb;
    } catch (error) {
        console.log(error)
        return null;
    }
} 
export const updateProject = async ({ projectId, html, css, js})=>{
    

    try {
        const projectDB = await projectModel.findOneAndUpdate({_id: projectId}, {html, css, js});
        if(!projectDB){
            return null;
        }
        return projectDB;
    } catch (error) {
        console.log(error)
        return null;
    }
} 

export const projectExists = async (projectId)=>{
    try {
        const project = await projectModel.findOne({_id: projectId});
    
        if(!project){
            return null;
        }
        return project;
    } catch (error) {
        console.log(error);
        return null;
    }
}
export const deleteProject = async (projectId)=>{
    try {
        const project = await projectModel.findOneAndDelete({_id: projectId});
    
        if(!project){
            return null;
        }
        return project;
    } catch (error) {
        console.log(error);
        return null;
    }
}
export const getProjects = async (userId, SKIP)=>{
    const LIMIT = +process.env.Limit;
    try {
        const projects = await projectModel.aggregate([
            {
                $match: { userId: new Id(userId) }
            },
            {
                $sort: { createdAt : -1}
            },
            {
                $facet:{
                    metadata: [ { $count: "total" }, { $addFields: { resultPerPage: LIMIT } } ],
                    data: [{$skip: SKIP}, {$limit: LIMIT}]
                }
            }
        ])
        return projects[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}
export const getFeedProjects = async (SKIP)=>{
    const LIMIT = +process.env.Limit;
    try {
        const projects = await projectModel.aggregate([
            {
                $sort: { createdAt : -1}
            },
            {
                $facet:{
                    metadata: [ { $count: "total" }, { $addFields: { resultPerPage: LIMIT } } ],
                    data: [{$skip: SKIP}, {$limit: LIMIT}]
                }
            }
        ])
        return projects[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}