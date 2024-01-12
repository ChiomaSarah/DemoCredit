import { Request, Response } from "express";
import { TransactionRef, TransactionType } from "../enum/transactionEnum";
const knex = require("../database/db");

export const fundWallet = async (req: Request, res: Response) => {
  const trx = await knex.transaction();
  try {
    const { accountNumber, amount } = req.body;

    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number." });
    }

    // Check if an account exists for the provided account_number
    const existingAccount = await trx("accounts")
      .where({ account_no: accountNumber })
      .first();

    if (!existingAccount) {
      return res.status(404).json({ error: "Account not found!" });
    }

    // Update user's account balance in the database
    const updatedBalance = existingAccount.balance + parseFloat(amount);
    await trx("accounts")
      .where({ account_no: accountNumber })
      .update({ balance: updatedBalance });

    // Insert transaction record into the transactions table
    await knex("transactions").insert({
      user_id: existingAccount.user_id,
      sender_account_number: existingAccount.account_no,
      receiver_account_number: existingAccount.account_no,
      amount: amount,
      type: TransactionType.Credit,
      reference: TransactionRef.Deposit,
    });

    // Commit the transaction
    await trx.commit();

    // format the balance to currency format
    const formattedUpdatedBalance = `₦${updatedBalance.toLocaleString(
      "en-US"
    )}`;
    return res.status(200).json({
      message: `You have successfully funded your wallet with ₦${amount}`,
      balance: formattedUpdatedBalance,
    });
  } catch (error) {
    await trx.rollback();
    console.log("Error funding account: ", error);
    return res.status(500).json({ error: "Error funding account" });
  }
};

export const transferFund = async (req: Request, res: Response) => {
  try {
    const { senderAccountNumber, recipientAccountNumber, amount } = req.body;

    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number." });
    }

    // Fetch sender and recipient's account details.
    const senderAccount = await knex("accounts")
      .where({ account_no: senderAccountNumber })
      .first();

    const recipientAccount = await knex("accounts")
      .where({ account_no: recipientAccountNumber })
      .first();

    if (!senderAccount || !recipientAccount) {
      return res.status(404).json({ error: "Account not found." });
    }

    if (senderAccount.balance < parseFloat(amount)) {
      return res
        .status(400)
        .json({ error: "Insufficient funds for transfer!" });
    }

    const updatedSenderBalance = senderAccount.balance - parseFloat(amount);
    await knex("accounts")
      .where({ account_no: senderAccountNumber })
      .update({ balance: updatedSenderBalance });

    // Insert transaction record into the transactions table
    await knex("transactions").insert({
      user_id: senderAccount.user_id,
      sender_account_number: senderAccountNumber,
      receiver_account_number: recipientAccountNumber,
      amount: amount,
      type: TransactionType.Debit,
      reference: TransactionRef.Transfer,
    });

    const formattedSenderBalance = `₦${updatedSenderBalance.toLocaleString(
      "en-US"
    )}`;
    return res.status(200).json({
      message: `You have successfully transferred ₦${amount} to ${recipientAccount.firstname} ${recipientAccount.lastname}.`,
      account: senderAccount.account_number,
      balance: formattedSenderBalance,
    });
  } catch (error) {
    console.error("Error transferring funds: ", error);
    return res.status(500).json({ error: "Error transferring funds" });
  }
};

export const withdrawFund = async (req: Request, res: Response) => {
  try {
    const { accountNumber, amount } = req.body;
    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number." });
    }
    const account = await knex("accounts")
      .where({ account_no: accountNumber })
      .first();
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    if (account.balance < parseFloat(amount)) {
      return res
        .status(400)
        .json({ error: "Insufficient funds for withdrawal" });
    }

    const updatedBalance = account.balance - parseFloat(amount);
    await knex("accounts")
      .where({ account_no: accountNumber })
      .update({ balance: updatedBalance });

    // Insert transaction record into the transactions table
    await knex("transactions").insert({
      user_id: account.user_id,
      sender_account_number: accountNumber,
      receiver_account_number: accountNumber,
      amount: amount,
      type: TransactionType.Debit,
      reference: TransactionRef.Withdrawal,
    });

    const formattedUpdatedBalance = `₦${updatedBalance.toLocaleString(
      "en-US"
    )}`;
    return res.status(200).json({
      message: `You have successfully withdrawn ₦${amount} from your wallet.`,
      balance: formattedUpdatedBalance,
    });
  } catch (error) {
    console.error("Error withdrawing funds: ", error);
    return res.status(500).json({ error: "Error withdrawing funds" });
  }
};

export const transactionHistory = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    const transactions = await knex("transactions")
      .where({ user_id: userId })
      .select("*");

    const formattedTransactions = transactions.map(
      (transaction: {
        transaction_id: number;
        user_id: number;
        sender_account_number?: number;
        recipient_account_number?: number;
        amount: number;
        type: any;
        reference: any;
        created_at: Date;
      }) => {
        let senderAccountNumber: number | undefined = undefined;
        let receiverAccountNumber: number | undefined = undefined;

        switch (transaction.type) {
          case TransactionType.Credit:
            senderAccountNumber = transaction.sender_account_number;
            break;
          case TransactionType.Debit:
            receiverAccountNumber = transaction.recipient_account_number;
            break;

          default:
            break;
        }

        return {
          transactionId: transaction.transaction_id,
          userId: transaction.user_id,
          amount: transaction.amount,
          senderAccountNumber,
          receiverAccountNumber,
          type: transaction.type,
          reference: transaction.reference,
          createdAt: transaction.created_at,
        };
      }
    );

    return res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error("couldn't get your transaction history", error);
    return res
      .status(500)
      .json({ error: "Error spooling transaction history" });
  }
};
