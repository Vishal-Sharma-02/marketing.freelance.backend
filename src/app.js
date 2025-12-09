import cookieParser from "cookie-parser";
import db from './config/database.js';
import cors from  'cors';
import http from  'http';
import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import bodyParser from "body-parser";
import { webhookHandler } from "./routes/payment.js";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://anaylixhub.netlify.app",
    "https://anaylixhub.in",
    "https://www.anaylixhub.in"
  ],
  credentials: true
}));

app.post(
  "/payment/webhook",
  bodyParser.raw({ type: "application/json" }),
  webhookHandler
);

app.set("trust proxy", 1);

app.use(cookieParser());
app.use(express.json());

import authRouter from './routes/auth.js';
import profileRouter from './routes/profile.js';
import courseRouter from "./routes/course.js";
import paymentRouter from "./routes/payment.js";

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",courseRouter);
app.use("/",paymentRouter);

const server = http.createServer(app);

db().then(()=>{
    console.log("Database connected");
    server.listen(process.env.PORT,()=>{
        console.log(`Server running on port ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log("Database connection failed",err.message);
})