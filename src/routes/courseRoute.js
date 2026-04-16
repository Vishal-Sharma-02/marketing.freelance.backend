import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

const courseRouter = express.Router();

courseRouter.post(
  "/course/create",
  authenticate,
  authorizeRoles("admin"),
  createCourse
);

courseRouter.get("/course/", getAllCourses);
courseRouter.get("/course/:id", getCourseById);
courseRouter.patch(
  "/course/:id",
  authenticate,
  authorizeRoles("admin"),
  updateCourse
);
courseRouter.delete(
  "/course/:id",
  authenticate,
  authorizeRoles("admin"),
  deleteCourse
);

export default courseRouter;
