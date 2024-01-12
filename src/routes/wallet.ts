import express from "express";
import {
  fundWallet,
  transactionHistory,
  transferFund,
  withdrawFund,
} from "../controllers/walletController";
import { verifyToken } from "../middleware/verifyToken";

// "use strict";
const router = express.Router();

router.post("/fund-wallet", verifyToken, fundWallet);
router.post("/transfer", verifyToken, transferFund);
router.post("/withdraw", verifyToken, withdrawFund);
router.get("/transactions/:userId", verifyToken, transactionHistory);

export default router;
