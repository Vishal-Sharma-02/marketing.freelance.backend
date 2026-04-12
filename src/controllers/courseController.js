import Course from "../models/course.js";
import { sendSuccess, sendError } from "../utils/response.js";

const countLectures = (modules) =>
  modules?.reduce((acc, module) => acc + (module.lectures?.length || 0), 0) || 0;

export const createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    course.totalLectures = countLectures(course.modules);
    const savedCourse = await course.save();
    return sendSuccess(res, "Course created", savedCourse, 201);
  } catch (err) {
    return sendError(res, "Error creating course", err.message, 500);
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return sendSuccess(res, "Courses fetched successfully", courses, 200);
  } catch (err) {
    return sendError(res, "Error fetching courses", err.message, 500);
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return sendError(res, "Course not found", null, 404);
    }
    return sendSuccess(res, "Course fetched successfully", course, 200);
  } catch (err) {
    return sendError(res, "Error fetching course", err.message, 500);
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return sendError(res, "Course not found", null, 404);
    }

    Object.assign(course, req.body);
    course.totalLectures = countLectures(course.modules);
    const updatedCourse = await course.save();

    return sendSuccess(res, "Course updated", updatedCourse, 200);
  } catch (err) {
    return sendError(res, "Error updating course", err.message, 500);
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return sendError(res, "Course not found", null, 404);
    }
    return sendSuccess(res, "Course deleted", null, 200);
  } catch (err) {
    return sendError(res, "Error deleting course", err.message, 500);
  }
};
