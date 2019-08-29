var Provider = require('../../../models/provider.model');
mongoose = require('mongoose');

module.exports = provider = {
	Query: {
		async getProvider(root, { _id }) {
			return await Provider.findById(_id);
		},
		async getProviderByUser(root, { _id }) {
			var res = await Provider.findOne({ 'users._id': _id });
			if (!res) {
				return undefined;
			} else {
				return res;
			}
		},
		async allProviders() {
			return await Provider.find();
		},

		async allUnits(root, { _id }) {
			var res = await Provider.findById(_id);
			if (res) {
				return res.units;
			} else {
				return undefined;
			}
		}
	},
	Mutation: {
		async createorUpdateProvider(root, { input }) {
			const session = await mongoose.startSession();
			try {
				session.startTransaction();
				var emailAlreadyExist = false;
				for (var i = 0; input.length > i; i++) {
					var res = await Provider.findOne();
					if (res === undefined || res === null) {
						var returned = await Provider.create(input[i]);
					} else if (input[i]._id) {
						Provider.update(
							{ 'provider._id': input[i]._id },
							{
								$set: {
									'provider.$': input[i]
								}
							},
							function(err, model) {
								if (err) {
									throw new Error('ERE009');
								}
							}
						);
					} else {
						for (var x = 0; input[i].users.length > x; x++) {
							var res = await Provider.findOne({ 'users.email': input[i].users[x].email });
							if (res) {
								emailAlreadyExist = true;
							} else {
								Provider.findOne(function(err, prov) {
									if (!prov) console.log('ERE009');
									else {
										if (prov === undefined || prov === null) {
											prov = transaction;
										} else {
											trans.checkPoints.collectionperformed =
												transaction.checkPoints.collectionperformed;
										}
										trans.update(trans).then((x) => {});
									}
								});
							}
						}
					}
				}

				await session.commitTransaction();
				await session.endSession();
				console.log('resolved');
				var res = await Provider.find();
				return res.scheduling;

			} catch (error) {
				await session.abortTransaction();
				await session.endSession();
				console.log(error);
				console.log('aborting');
				return new Error('ERE009');
			}
		},
		async deleteProvider(root, { _id }) {
			// return await Provider.findOneAndRemove({
			// 	_id
			// });
		}
	}
};
