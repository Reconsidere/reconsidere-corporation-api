TransactionHistory = require('../../../models/transactionhistory.model');

module.exports = transactionhistory = {
	Query: {
		async allTransactionHistory(root, { _idCorporation }) {
			return await TransactionHistory.findOne({ _idCorporation: _idCorporation });
		}
	},
	Mutation: {
	}
};
