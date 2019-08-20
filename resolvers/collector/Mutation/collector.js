Collector = require('../../../models/collector.model');
CheckPoint = require('../../../models/checkpoint.model');
TransactionHistory = require('../../../models/transactionhistory.model');

module.exports = collector = {
	Query: {
		async getCollector(root, { _id }) {
			return await Collector.findById(_id);
		},
		async getCollectorByUser(root, { _id }) {
			var res = await Collector.findOne({ 'users._id': _id });
			if (!res) {
				return null;
			} else {
				return res;
			}
		},
		async allCollectors(root, { _id }) {
			return await Collector.find();
		}
	},
	Mutation: {
		async createCollector(root, { input }) {
			var res = await Collector.findOne({ 'users.email': input.users[0].email });
			if (res) {
				throw new Error('WRE005');
			} else {
				return await Collector.create(input);
			}
		},
		async updateCollector(root, { _id, input }) {
			return await Collector.findOneAndUpdate(
				{
					_id
				},
				input,
				{
					new: true
				}
			);
		},
		async deleteCollector(root, { _id }) {
			// return await Collector.findOneAndRemove({
			// 	_id
			// });
		}
	}
};
