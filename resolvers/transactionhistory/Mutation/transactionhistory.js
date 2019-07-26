TransactionHistory = require('../../../models/transactionhistory.model');

module.exports = transactionhistory = {
	Query: {
		async allTransactionHistory() {
			return await TransactionHistory.find();
		}
	},
	Mutation: {}
};
