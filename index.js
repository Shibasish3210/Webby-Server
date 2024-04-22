import { json, urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import { PORT, app } from "./app.js";
import connectToMongoDB from "./db.js";
import authRoute from './controllers/authController.js';
import projectRoute from './controllers/projectController.js';

connectToMongoDB();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    // origin: "https://code-webby.vercel.app",
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}))
app.use('/auth', authRoute);
app.use('/project', projectRoute);

app.listen(PORT, ()=>{
    console.log(`server listening on port ${PORT}`);
})
