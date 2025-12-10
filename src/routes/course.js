import express from "express";
import Course from "../models/course.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import  userAuth from "../middleware/auth.js";
import authAdmin from "../middleware/authAdmin.js";

const courseRouter = express.Router();

// CREATE COURSE
courseRouter.post("/course/create", userAuth, authAdmin, async (req, res) => {
  try {
    const course = new Course(req.body);

    // Count total lectures
    course.totalLectures = course.modules.reduce(
      (acc, module) => acc + module.lectures.length,
      0
    );

    const savedCourse = await course.save();
    res.status(201).json({ message: "Course created", data: savedCourse });
  } catch (err) {
    res.status(500).json({ message: "Error creating course", error: err.message });
  }
});

// GET ALL COURSES
courseRouter.get("/course/all", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching courses" });
  }
});



// UPDATE COURSE
courseRouter.put("/course/update/:id", userAuth, authAdmin, async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    updatedCourse.totalLectures = updatedCourse.modules.reduce(
      (acc, module) => acc + module.lectures.length,
      0
    );

    await updatedCourse.save();

    res.json({ message: "Course updated", data: updatedCourse });
  } catch (err) {
    res.status(500).json({ message: "Error updating course" });
  }
});

// DELETE COURSE
courseRouter.delete("/course/delete/:id", userAuth, authAdmin, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting course" });
  }
});

// GET SINGLE COURSE
courseRouter.get("/course/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Error fetching course" });
  }
});

export default courseRouter;
