import cookieParser from "cookie-parser";
import db from './config/database.js';
import cors from  'cors';
import helmet from 'helmet';
import http from  'http';
import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import rateLimit from 'express-rate-limit';
import bodyParser from "body-parser";
import { webhookHandler } from "./routes/paymentRoute.js";

const requiredEnvVars = [
  "PORT",
  "JWT_SECRET",
  "DATABASE_SECRET_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM"
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://anaylixhub.netlify.app",
    "https://anaylixhub.in",
    "https://www.anaylixhub.in"
  ],
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: true,
}));

app.post(
  "/payment/webhook",
  bodyParser.raw({ type: "application/json" }),
  webhookHandler
);

app.set("trust proxy", 1);

app.use(cookieParser());
app.use(express.json());

import authRouter from './routes/authRoute.js';
import userRouter from './routes/userRoute.js';
import courseRouter from "./routes/courseRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import contactRouter from "./routes/contactRoute.js";
import webinarRouter from "./routes/webinarRoute.js";

app.use("/",authRouter);
app.use("/",userRouter);
app.use("/",courseRouter);
app.use("/",paymentRouter);
app.use("/", contactRouter);
app.use("/", webinarRouter);

const server = http.createServer(app);

db().then(()=>{
    console.log("Database connected");
    server.listen(process.env.PORT,()=>{
        console.log(`Server running on port ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log("Database connection failed",err.message);
})

// console.log(email);
// console.log(user);
// console.log(isMatch);
