import express from "express";
import { createUser, userLogin } from "./../controllers/userController";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", userLogin);

export default router;
