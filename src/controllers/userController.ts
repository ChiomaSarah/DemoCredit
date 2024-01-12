require("dotenv").config();
import { Request, Response } from "express";
const knex = require("../database/db");
import bcrypt from "bcryptjs";
import { User } from "../models/types";
import { generateJwtToken } from "../middleware/verifyToken";
import { generateAccountNumber } from "../middleware/generateAccountNumber";

export const createUser = async (req: Request, res: Response) => {
  const { firstname, lastname, phoneNumber, gender, age, email, password } =
    req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const accountNumber = await generateAccountNumber(knex);

  try {
    const existingUser = await knex("users").where("email", email).first();
    if (existingUser) {
      return res.status(400).json({
        error: "A user with this email already exists... Please, login.",
      });
    }
    const newUser: User = {
      firstname,
      lastname,
      phoneNumber,
      gender,
      age,
      password: hashedPassword,
      email,
    };

    const [userId] = await knex("users").insert(newUser);

    // Create an account for the user upon registration
    await knex("accounts").insert({
      user_id: userId,
      account_no: accountNumber,
      balance: 0,
      firstname,
      lastname,
    });

    const token = generateJwtToken(userId);
    res.status(200).json({
      message: "User registered successfully",
      userId: userId[0],
      newUser,
      accountNumber,
      token,
    });
  } catch (error) {
    console.error("Error registering user: ", error);
    res.status(500).json({ error: "Error registering user" });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user: User | undefined = await knex("users").where({ email }).first();
    if (!user) {
      res
        .status(401)
        .json({ error: "No user with that email found...Kindly signup!" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Password Mismatch!" });
      return;
    }
    if (user.id === undefined) {
      res.status(500).json({ error: "User ID is undefined" });
      return;
    }
    const token = generateJwtToken(user.id);

    res.status(200).json({ message: "Login Accepted!", user, token });
  } catch (error) {
    console.error("Unable to log in: ", error);
    res.status(500).json({ error: "Unable to log in" });
  }
};
