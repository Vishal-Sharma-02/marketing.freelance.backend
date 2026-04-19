import express from "express";
import { sendWebinarContactRequest } from "../controllers/webinarController.js";

const webinarRouter = express.Router();

webinarRouter.post("/webinar/contact", sendWebinarContactRequest);

export default webinarRouter;
