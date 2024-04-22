import { Schema, model } from "../db.js";

const projectSchema = new Schema({
    name:{
        type: 'string',
        required: true
    },
    details:{
        type: 'string',
        required: true
    },
    isPublished:{
        type: 'boolean',
        required: true,
        default: true,
    },
    html:{
        type: 'string',
        required: false,
        default: ''
    },
    css:{
        type: 'string',
        required: false,
        default: ''
    },
    js:{
        type: 'string',
        required: false,
        default: ''
    },
    userId:{
        type: Schema.Types.ObjectId,
        required: true
    },
    isDeleted:{
        type: 'boolean',
        required: true,
        default: false
    },
    createdAt:{
        type: 'string',
        required: true,
    }
});

const projectModel = model('project', projectSchema);

export default projectModel;