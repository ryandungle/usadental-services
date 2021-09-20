const axios = require("axios");
const {
  config,
  config: { clinicId },
} = require("../helpers/config");
const Transaction = require("../model/transaction");
const { format } = require("date-fns");
const logger = require("../utils/logger");
const { getRequestKey } = require("../helpers/sikkaQueries");
const PromisePool = require("es6-promise-pool");

async function getTransactionsByDateRange(startdate, enddate) {
  const { request_key } = await getRequestKey();
  const limit = 1000;
  let offset = 0;
  let totalPage = 0;
  const transactionData = [];

  loop1: do {
    let { data, headers, status } = await axios.get(
      `https://api.sikkasoft.com/v2/transactions`,
      {
        params: {
          request_key,
          startdate,
          enddate,
          transaction_type: "Payment",
          limit,
          offset,
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      }
    );
    if (!data) return [];
    if (status == 429) {
      // rate mimit exceeded
      await new Promise((resolve) =>
        setTimeout(resolve, headers["x-rate-limit-reset"] * 1000)
      );
      continue loop1;
    }

    if (totalPage === 0) {
      totalPage = Math.floor(data[0].total_count / limit);
    }
    transactionData.push(data[0]);
    offset++;
    if (headers["x-rate-limit-remaining"] == 0) {
      logger.info("sikka api limit reached, waiting");
      await new Promise((resolve) =>
        setTimeout(resolve, headers["x-rate-limit-reset"] * 1000)
      );
    }
  } while (offset <= totalPage);

  const transactions = transactionData.reduce((acc, curr) => {
    return [...acc, ...curr.items];
  }, []);

  return transactions;
}

function upsertTransactions(transactions) {
  if (transactions.length <= 0) return null;
  const transactionToAdd = transactions.pop();

  return Transaction.updateOne(
    { transaction_sr_no: transactionToAdd.transaction_sr_no },
    transactionToAdd,
    { upsert: true }
  ).catch((error) => {
    logger.error(error);
  });
}

async function cacheTransactionsMissouriOffice() {
  const transactions = await getTransactionsByDateRange(
    format(new Date(), "yyyy-MM-dd"),
    format(new Date(), "yyyy-MM-dd")
  );
  const promisePool = new PromisePool(
    () => upsertTransactions(transactions),
    500
  );
  try {
    await promisePool.start();
    logger.info("Add transactions completed");
  } catch (error) {
    logger.error(error);
  }
}

module.exports = {
  getTransactionsByDateRange,
  cacheTransactionsMissouriOffice,
};
