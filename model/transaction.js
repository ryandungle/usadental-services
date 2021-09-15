const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    transaction_date: {
      type: Date,
    },
    transaction_entry_date: {
      type: Date,
    },
    amount: {
      type: Number,
    },
  },
  { strict: false }
);

module.exports = mongoose.model("TransactionDentrack", transactionSchema);
