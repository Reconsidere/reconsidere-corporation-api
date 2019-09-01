var Provider = require('../../../models/provider.model');
var Corporation = require('../../../models/corporation.model');
var Collector = require('../../../models/collector.model');
mongoose = require('mongoose');

var Classification = {
	Provider: 'Fornecedor',
	Collector: 'Empresa Coletora'
};

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
		async createorUpdateProvider(root, { _id, typeCorporation, input }) {
			const session = await mongoose.startSession();
			try {
				session.startTransaction();
				for (var i = 0; input.length > i; i++) {
					var res = await Provider.findOne();
					if (res === undefined || res === null) {
						var id = undefined;
						var returned = await Provider.create(input[i]).then((x) => {
							id = x._id;
						});
						addID(_id, id, typeCorporation);
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
						var res = await Provider.find();
						var id;
						for (var x = 0; input[i].users.length > x; x++) {
							id = undefined;
							var existEmail = res.find((x) => x.email === input[i].users[x].email);
							if (!existEmail) {
								res.push(input[i]);
								await res.update(res).then((x) => {
									id = x._id;
								});
								addID(_id, id, typeCorporation);
							}
						}
					}
				}

				/*Salvando os ids 'novos apenas' dos fornecedores criados para que a empresa que os criaram possam 
				carregarseus dados futuramente, esta em aberto para que fornecedores 
				cadastrem seus fornecedores tbm */

				await session.commitTransaction();
				await session.endSession();
				console.log('resolved');
				var res = await Provider.find();
				return res;
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
function addID(_id, id, typeCorporation) {
	if (typeCorporation === Classification.Collector) {
		var collector = Collector.findById(_id);
		if (collector.providers === undefined || collector.providers.length <= 0) {
			collector.providers = [ id ];
		} else {
			collector.providers.push(id);
		}
		Collector.findOne(id, function(err, coll) {
			if (!coll) console.log('ERE009');
			else {
				coll.providers = collector.providers;
				coll.update(coll).then((x) => {});
			}
		});
	} else if (typeCorporation === Classification.Provider) {
		var provider = Provider.findById(_id);
		if (provider.providers === undefined || provider.providers.length <= 0) {
			provider.providers = [ id ];
		} else {
			provider.providers.push(id);
		}
		Provider.findOne(id, function(err, prov) {
			if (!prov) console.log('ERE009');
			else {
				prov.providers = provider.providers;
				prov.update(prov).then((x) => {});
			}
		});
	} else {
		var corporation = Corporation.findById(_id);
		if (corporation.providers === undefined || corporation.providers.length <= 0) {
			corporation.providers = [ id ];
		} else {
			corporation.providers.push(id);
		}
		Corporation.findById(id, function(err, corp) {
			if (!corp) console.log('ERE009');
			else {
				corp.providers = corporation.providers;
				corp.update(corp).then((x) => {});
			}
		});
	}
}
