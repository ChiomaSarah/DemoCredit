require("dotenv").config();
import { Request, Response } from "express";
const knex = require("../database/db");
import bcrypt from "bcryptjs";
import { User } from "../models/types";
import { generateJwtToken } from "../middleware/verifyToken";
import { generateAccountNumber } from "../middleware/generateAccountNumber";
import { handleErrorResponse } from "../utils/errorResponse";

export const createUser = async (req: Request, res: Response) => {
  const { firstname, lastname, phoneNumber, gender, age, email, password } =
    req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const accountNumber = await generateAccountNumber(knex);

  const trx = await knex.transaction();

  try {
    const existingUser = await trx("users").where("email", email).first();
    if (existingUser) {
      return res.status(400).json({
        error: "A user with this email already exists. Please, login.",
      });
    }

    const userDetails: User = {
      firstname,
      lastname,
      phoneNumber,
      gender,
      age,
      password: hashedPassword,
      email,
    };

    const [userId] = await trx("users").insert(userDetails);

    // Create an account for the user upon registration
    await trx("accounts").insert({
      user_id: userId,
      account_no: accountNumber,
      balance: 0,
      firstname,
      lastname,
    });

    // Commit the transaction.
    await trx.commit();

    return res.status(200).json({
      message: "User registration successful!",
      user: userDetails,
      accountNumber,
    });
  } catch (error) {
    // If an error occurs, rollback the transaction.
    await trx.rollback();

    console.error("Error registering user: ", error);
    return handleErrorResponse(
      res,
      `Error registering user: ${(error as Error).message || error}`
    );
  }
};

export const userLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const trx = await knex.transaction();

  try {
    const user: User | undefined = await trx("users").where({ email }).first();
    if (!user) {
      return res
        .status(401)
        .json({ error: "No user with that email found. Kindly signup." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Password mismatch!" });
    }

    if (user.id === undefined) {
      return res.status(500).json({ error: "User ID is undefined!" });
    }
    const token = generateJwtToken(user.id);

    if (user.id === undefined) {
      // Rollback the transaction if 'user.id' is undefined
      await trx.rollback();
      return res.status(500).json({ error: "User ID is undefined!" });
    }

    // Fetch the user's account number and return in the login response.
    const accountNumber = await trx("accounts")
      .select("account_no")
      .where("user_id", user.id)
      .first();

    // Commit the transaction
    await trx.commit();

    if (!accountNumber) {
      return res.status(500).json({ error: "Account information not found" });
    }

    return res.status(200).json({
      message: "Login accepted!",
      user,
      accountNumber,
      token,
    });
  } catch (error) {
    // If an error occurs, rollback the transaction.
    await trx.rollback();

    console.error("Login failed!: ", error);
    return handleErrorResponse(
      res,
      `Login failed!: ${(error as Error).message || error}`
    );
  }
};
