import authRoute from "./routes/auth";
import walletRoute from "./routes/wallet";
import express from "express";
const app = express();

app.use(express.json());

app.use("/api", authRoute);

app.use("/api", walletRoute);

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
