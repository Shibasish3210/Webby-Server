import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

export const app = express();
export const router = express.Router;
export const PORT = process.env.PORT || 5000;