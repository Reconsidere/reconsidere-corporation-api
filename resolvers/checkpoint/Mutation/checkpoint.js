CheckPoint = require('../../../models/checkpoint.model');

module.exports = checkpoint = {
	Query: {
		async allCheckPoint() {
			return await CheckPoint.find();
		}
	},
	Mutation: {
		async createorUpdateCheckPoint(root, { input }) {}
	}
};
