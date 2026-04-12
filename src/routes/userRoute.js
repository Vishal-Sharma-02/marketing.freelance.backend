import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validateGetUsersQuery, validateUserIdParam, validateUpdateUser } from "../validators/userValidator.js";
import {
  profile,
  getUsers,
  getUserById,
  updateProfile,
  updateUserById,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/user/profile", authenticate, authorizeRoles("user", "admin"), profile);
userRouter.patch("/user/update", authenticate, authorizeRoles("user", "admin"), validateUpdateUser, updateProfile);
userRouter.patch(
  "/user/update/:id",
  authenticate,
  authorizeRoles("admin"),
  validateUserIdParam,
  validateUpdateUser,
  updateUserById
);
userRouter.get("/user", authenticate, authorizeRoles("admin"), validateGetUsersQuery, getUsers);
userRouter.get("/user/:id", authenticate, authorizeRoles("admin"), validateUserIdParam, getUserById);

export default userRouter;