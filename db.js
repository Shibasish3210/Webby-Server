import mongoose from "mongoose";

const Mongo_URI = process.env.MONGO_URI;

const connectToMongoDB = ()=>{
    mongoose.connect(Mongo_URI)
    .then(()=>{
        console.log('Connected to Mongo DB');
    }).catch((err)=>{
        console.log(err);
    })
}

export const Schema = mongoose.Schema;
export const model = mongoose.model;
export const Id = mongoose.Types.ObjectId;

export default connectToMongoDB;
