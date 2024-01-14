import { Request, Response } from "express";
import { TransactionRef, TransactionType } from "../enum/transactionEnum";
import { formatAsCurrency } from "../utils/formatCurrency";
import { handleErrorResponse } from "../utils/errorResponse";
import { getCurrentFormattedTime } from "../utils/formatDateAndTime";
const knex = require("../database/db");

export const fundWallet = async (req: Request, res: Response) => {
  const trx = await knex.transaction();

  try {
    const { accountNumber, amount } = req.body;

    // Validate amount is a positive number
    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }

    // Check if an account exists for the provided account_number
    const existingAccount = await trx("accounts")
      .where({ account_no: accountNumber })
      .first();

    if (!existingAccount) {
      return res.status(404).json({ error: "Account not found!" });
    }

    // Update user's account balance in the database
    const existingBalance = parseFloat(existingAccount.balance);
    const updatedBalance = existingBalance + parseFloat(amount);

    await trx("accounts")
      .where({ account_no: accountNumber })
      .update({ balance: updatedBalance });

    // Commit the transaction
    await trx.commit();

    // Insert transaction record into the transactions table
    await knex("transactions").insert({
      user_id: existingAccount.user_id,
      sender_account_number: existingAccount.account_no,
      sender_account_name: `${existingAccount.firstname} ${existingAccount.lastname}`,
      receiver_account_number: existingAccount.account_no,
      receiver_account_name: `${existingAccount.firstname} ${existingAccount.lastname}`,
      amount: amount,
      type: TransactionType.Credit,
      reference: TransactionRef.Deposit,
    });

    const formattedBalance = formatAsCurrency(updatedBalance);
    const formattedAmount = formatAsCurrency(amount);
    const { formattedTime, formattedDate } = await getCurrentFormattedTime();

    return res.status(200).json({
      message: `Your account has been successfully funded with ${formattedAmount}`,
      balance: formattedBalance,
      time: formattedTime,
      date: formattedDate,
    });
  } catch (error) {
    // If an error occurs, rollback the transaction.
    await trx.rollback();
    console.log("Error funding account: ", error);
    return handleErrorResponse(res, "Error funding account!");
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

    // Insert transaction record into the transactions table.
    await knex("transactions").insert({
      user_id: senderAccount.user_id,
      sender_account_number: senderAccountNumber,
      sender_account_name: `${senderAccount.firstname} ${senderAccount.lastname}`,
      receiver_account_number: recipientAccountNumber,
      receiver_account_name: `${recipientAccount.firstname} ${recipientAccount.lastname}`,
      amount: amount,
      type: TransactionType.Debit,
      reference: TransactionRef.Transfer,
    });

    const formattedBalance = formatAsCurrency(updatedSenderBalance);
    const formattedAmount = formatAsCurrency(amount);
    const { formattedTime, formattedDate } = await getCurrentFormattedTime();

    return res.status(200).json({
      message: `You have successfully transferred ${formattedAmount} to ${recipientAccount.firstname} ${recipientAccount.lastname}.`,
      "recipient's account": `${recipientAccount.account_no} (${recipientAccount.firstname} ${recipientAccount.lastname})`,
      balance: formattedBalance,
      time: formattedTime,
      date: formattedDate,
    });
  } catch (error) {
    console.error("Error transferring funds: ", error);
    return handleErrorResponse(res, "Error transfering funds!");
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
      return res.status(404).json({ error: "Account not found!" });
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
      sender_account_name: `${account.firstname} ${account.lastname}`,
      receiver_account_number: accountNumber,
      receiver_account_name: `${account.firstname} ${account.lastname}`,
      amount: amount,
      type: TransactionType.Debit,
      reference: TransactionRef.Withdrawal,
    });

    const formattedBalance = formatAsCurrency(updatedBalance);
    const formattedAmount = formatAsCurrency(amount);
    const { formattedTime, formattedDate } = await getCurrentFormattedTime();

    return res.status(200).json({
      message: `You have successfully withdrawn ${formattedAmount} from your wallet.`,
      balance: formattedBalance,
      time: formattedTime,
      date: formattedDate,
    });
  } catch (error) {
    console.error("Error withdrawing funds!: ", error);
    return handleErrorResponse(res, "Error withdrawing funds!");
  }
};

export const transactionHistory = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    const transactions = await knex("transactions")
      .where({ user_id: userId })
      .select("*");

    const { formattedTime, formattedDate } = await getCurrentFormattedTime();

    const formattedTransactions = transactions.map(
      (transaction: {
        transaction_id: number;
        user_id: number;
        sender_account_number?: number;
        receiver_account_number?: number;
        sender_account_name?: string;
        receiver_account_name?: string;
        amount: number;
        type: any;
        reference: any;
        created_at: Date;
      }) => {
        const senderAccountFormatted =
          transaction.type === TransactionType.Credit
            ? `${transaction.sender_account_number} (${transaction.sender_account_name})`
            : undefined;

        const receiverAccountFormatted = `${transaction.receiver_account_number} (${transaction.receiver_account_name})`;

        const accountField =
          transaction.type === TransactionType.Credit
            ? "sender's account"
            : "receiver's account";

        return {
          transactionId: transaction.transaction_id,
          userId: transaction.user_id,
          amount: formatAsCurrency(transaction.amount),
          [accountField]: senderAccountFormatted || receiverAccountFormatted,
          type: transaction.type,
          reference: transaction.reference,
          time: formattedTime,
          date: formattedDate,
        };
      }
    );

    return res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error("Error spooling transaction history!", error);
    return handleErrorResponse(res, "Error spooling transaction history!");
  }
};
