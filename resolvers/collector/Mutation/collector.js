var Collector = require('../../../models/collector.model');
var Corporation = require('../../../models/corporation.model');
var Provider = require('../../../models/provider.model');
var CheckPoint = require('../../../models/checkpoint.model');
var TransactionHistory = require('../../../models/transactionhistory.model');
mongoose = require('mongoose');

var Classification = {
	Provider: 'Fornecedor',
	Collector: 'Empresa Coletora'
};

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
		},
		async allUnits(root, { _id }) {
			var res = await Collector.findById(_id);
			if (res) {
				var unit;
				var units = [];
				for (var i = 0; res.units.length > i; i++) {
					unit = undefined;
					unit = await Collector.findById(res.units[i]._id);
					if (!unit) {
						unit = await Corporation.findById(res.units[i]._id);
					}
					if (!unit) {
						unit = await Provider.findById(res.units[i]._id);
					}

					units.push(unit);
				}
				return units;
			} else {
				return undefined;
			}
		},
		async allClientsToCollector(root, { _id }) {
			var clients = [];
			var corporation = await Corporation.findOne({ 'entries.sale._idColector': _id });
			var provider = await Provider.findOne({ 'entries.sale._idColector': _id });
			if (corporation) {
				corporation.entries.sale.forEach((sale, index) => {
					if (sale._idColector !== _id) {
						sales.splice(index, 1);
					}
				});
				clients.push(corporation);
			}
			if (provider) {
				provider.entries.sale.forEach((sale, index) => {
					if (sale._idColector !== _id) {
						sales.splice(index, 1);
					}
				});
				clients.push(provider);
			}
			return clients;
		},
		async allDocuments(root, { _id }) {
			var res = await Collector.findById(_id);
			if (res) {
				return res.documents;
			} else {
				return undefined;
			}
		},
		async allDepartments(root, { _id }) {
			var res = await Collector.findById(_id);
			if (res) {
				return res.departments;
			} else {
				return undefined;
			}
		},
		async allResiduesRegister(root, { _id }) {
			var res = await Collector.findById(_id);
			if (res) {
				return res.residuesRegister;
			} else {
				return undefined;
			}
		},
		async allResidueArrived(root, { _id }) {
			var res = await Collector.findById(_id);
			if (res) {
				return res.residuesPerformed;
			} else {
				return undefined;
			}
		},
		async allSchedulings(root, { _id }) {
			var res = await Collector.findById(_id);
			if (res) {
				return res.scheduling;
			} else {
				return undefined;
			}
		},
		async allEntries(root, { _id }) {
			var res = await Collector.findById(_id);
			if (res) {
				return res.entries;
			} else {
				return undefined;
			}
		},
		async allProvidersId(root, { _id }) {
			var res = await Collector.findById(_id);
			if (res) {
				return res.myProviders;
			} else {
				return undefined;
			}
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
		async createCollectorUnit(root, { _id, typeCorporation, input }) {
			var res = await Collector.findById(_id);
			for (var i = 0; input.length > i; i++) {
				for (var x = 0; res.units.length > x; x++) {
					if (input[i].users[0].email === res.units[x].email) {
						throw new Error('WRE005');
					}
				}
			}

			const session = await mongoose.startSession();
			try {
				session.startTransaction();
				for (var i = 0; input.length > i; i++) {
					var id = undefined;
					var returned = await Corporation.create(input[i]).then((x) => {
						id = x._id;
					});
					addID(_id, id, typeCorporation);
				}

				await session.commitTransaction();
				await session.endSession();
				console.log('resolved');
				return await Collector.findById(_id);
			} catch (error) {
				await session.abortTransaction();
				await session.endSession();
				console.log(error);
				console.log('aborting');
				return new Error('ERE009');
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
		},

		async createorUpdateDepartment(root, { _id, input }) {
			try {
				res = await Collector.findById(_id, function(err, corp) {
					if (err) {
						return next(new Error('ERE009'));
					} else {
						for (var i = 0; input.length > i; i++) {
							if (input[i]._id) {
								index = corp.departments.findIndex((x) => x._id == input[i]._id);
								if (index) {
									corp.departments[index] = input[i];
								} else if (!corp.departments || corp.departments.length <= 0) {
									corp.departments = [ input[i] ];
								}
							} else {
								if (!corp.departments || corp.departments.length <= 0) {
									corp.departments = [ input[i] ];
								} else {
									corp.departments.push(input[i]);
								}
							}
						}
						corp.save();
						return;
					}
				});

				var res = await Collector.findById(_id);
				return res.departments;
			} catch (error) {
				throw new Error('ERE009');
			}
		},

		async createorUpdateResiduesRegister(root, { _id, input }) {
			const session = await mongoose.startSession();
			try {
				session.startTransaction();
				var res = await Collector.findById(_id);
				var returnElement;
				if (
					!res.residuesRegister ||
					!res.residuesRegister.departments ||
					res.residuesRegister.departments.length <= 0
				) {
					var elementSaved;
					returnElement = await new Promise((resolve, reject) => {
						Collector.findById(_id, function(err, corp) {
							if (!corp) console.log('ERE009');
							else {
								input.departments.forEach((department) => {
									if (
										!res.residuesRegister ||
										!res.residuesRegister.departments ||
										res.residuesRegister.departments.length <= 0
									) {
										res['residuesRegister'] = new Object();
										var depart = {
											_id: department._id,
											name: department.name,
											isChanged: false,
											description: department.description,
											active: department.active,
											qrCode: []
										};
										res['residuesRegister']['departments'] = [ depart ];
									} else {
										var depart = {
											_id: department._id,
											name: department.name,
											isChanged: false,
											description: department.description,
											active: department.active,
											qrCode: []
										};
										var exist = res.residuesRegister.departments.find(
											(x) => x.name === depart.name
										);
										if (!exist) {
											res.residuesRegister.departments.push(depart);
										}
									}
								});

								input.departments.forEach((department) => {
									department.qrCode.forEach((qrCode) => {
										res.residuesRegister.departments.forEach((departmentDB) => {
											if (department.name === departmentDB.name) {
												departmentDB.qrCode.push(qrCode);
											}
										});
									});
								});

								corp.residuesRegister = res.residuesRegister;
								corp.update(corp).then((x) => {
									resolve(corp);
								});
							}
						});
					});

					/* gerando checkPoint */
					var checkpoint = await CheckPoint.findOne({ _idCorporation: _id });
					var isNew = false;
					res = await Collector.findById(_id);
					var checkpoin = await new Promise(async (resolve, reject) => {
						res.residuesRegister.departments.forEach((department) => {
							department.qrCode.forEach((qrCode) => {
								if (!checkpoint) {
									var value = {
										code: qrCode.code,
										material: qrCode.material
									};

									checkpoint = new Object({
										_idCorporation: _id,
										wastegenerated: new Object({
											qrCode: [ value ]
										})
									});
									isNew = true;
								} else {
									var value = {
										code: qrCode.code,
										material: qrCode.material
									};

									if (!checkpoint.wastegenerated || checkpoint.wastegenerated.length <= 0) {
										checkpoint = new Object({
											_idCorporation: _id,
											wastegenerated: new Object({
												qrCode: [ value ]
											})
										});
									} else {
										checkpoint.wastegenerated.qrCode.push(value);
									}
								}
							});
						});
						if (isNew) {
							var returned = await CheckPoint.create(checkpoint);
						} else {
							CheckPoint.findOne(function(err, check) {
								if (!check) console.log('ERE009');
								else {
									if (!check || check.length <= 0) {
										check = check;
									} else {
										check.wastegenerated = checkpoint.wastegenerated;
									}
									check.update(check).then((x) => {});
								}
							});
						}
						resolve();
					});

					/*Gerando historico */
					var transaction = await TransactionHistory.findOne({ _idCorporation: _id });
					var isNew = false;
					res = await Collector.findById(_id);
					var history = await new Promise(async (resolve, reject) => {
						res.residuesRegister.departments.forEach((department) => {
							department.qrCode.forEach((qrCode) => {
								if (!transaction) {
									var value = {
										date: new Date(),
										code: qrCode.code,
										material: qrCode.material
									};

									transaction = new Object({
										_idCorporation: _id,
										checkPoints: new Object({
											wastegenerated: new Object({
												qrCode: [ value ]
											})
										})
									});
									isNew = true;
								} else {
									var value = {
										date: new Date(),
										code: qrCode.code,
										material: qrCode.material
									};

									if (
										transaction.checkPoints.wastegenerated === undefined ||
										transaction.checkPoints.wastegenerated.length <= 0
									) {
										transaction = new Object({
											_idCorporation: _id,
											checkPoints: new Object({
												wastegenerated: new Object({
													qrCode: [ value ]
												})
											})
										});
									} else {
										transaction.checkPoints.wastegenerated.qrCode.push(value);
									}
								}
							});
						});
						if (isNew) {
							var returned = await TransactionHistory.create(transaction);
						} else {
							TransactionHistory.findOne(function(err, trans) {
								if (!trans) console.log('ERE009');
								else {
									if (trans === undefined || trans.length <= 0) {
										trans = transaction;
									} else {
										trans.checkPoints.wastegenerated = transaction.checkPoints.wastegenerated;
									}
									trans.update(trans).then((x) => {});
								}
							});
						}
						resolve();
					});
				} else {
					var removed = false;
					for (i = 0; input.departments.length > i; i++) {
						if (input.departments[i].isChanged) {
							var existRemoved = false;
							/*verifica se existe mudança de departamento e exclui o item que esta salvo no departamento antigo para depois inserir no novo
						Se por acaso o usuário modificou, mas voltou ao antigo ele apenas não exclui e retorn
						*/
							for (y = 0; y < input.departments[i].qrCode.length; y++) {
								res.residuesRegister.departments.forEach((department, index) => {
									department.qrCode.forEach((qrCode, indexQrCode) => {
										if (input.departments[i]._id !== department._id) {
											if (qrCode.code === input.departments[i].qrCode[y].code) {
												department.qrCode.splice(indexQrCode, 1);
											}
										}
									});
								});
								//se não tem mais qrcode remove o departamento
								res.residuesRegister.departments.forEach((department, index) => {
									if (!department || !department.qrCode || department.qrCode.length <= 0) {
										res.residuesRegister.departments.splice(index, 1);
									}
								});
							}
							input.departments[i].isChanged = false;
							removed = true;
						}
					}

					await res.update(res).then(console.log('ok removed from old'));
					res = await Collector.findById(_id);

					for (i = 0; input.departments.length > i; i++) {
						res = await Collector.findById(_id);
						var exist = await res.residuesRegister.departments.find(
							(x) => x._id == input.departments[i]._id
						);

						if (exist === undefined || exist.length <= 0) {
							await res.residuesRegister.departments.push(input.departments[i]);
							await res.update(res).then(console.log('ok push in department'));
							res = await Collector.findById(_id);

							/* gerando checkPoint */
							var checkpoint = await CheckPoint.findOne({ _idCorporation: _id });
							var element = await new Promise((resolve, reject) => {
								res.residuesRegister.departments.forEach((department) => {
									department.qrCode.forEach((qrCode) => {
										if (input.departments[i].name === department.name) {
											checkpoint.wastegenerated.qrCode.push(qrCode);
										}
									});
								});
								CheckPoint.findOne({ _idCorporation: _id }, function(err, check) {
									if (!check) console.log('ERE009');
									else {
										check.wastegenerated = checkpoint.wastegenerated;
										check.update(check).then((x) => {});
									}
								});
								resolve();
							});

							/* gerando histórico de alterações */
							res = await Collector.findById(_id);
							var transaction = TransactionHistory.findOne({ _idCorporation: _id });
							var history = await new Promise((resolve, reject) => {
								res.residuesRegister.departments.forEach((department) => {
									department.qrCode.forEach((qrCode) => {
										if (input.departments[i].name === department.name) {
											var value = {
												date: new Date(),
												code: qrCode.code,
												material: qrCode.material
											};
											TransactionHistory.findOne({ _idCorporation: _id }, function(err, trans) {
												if (!trans) console.log('ERE009');
												else {
													trans.checkPoints.wastegenerated.qrCode.push(value);
													trans.update(trans).then((x) => {});
												}
											});
										}
									});
								});
								resolve();
							});
							res = await Collector.findById(_id);
						} else {
							for (q = 0; input.departments[i].qrCode.length > q; q++) {
								var isUpdated = false;
								res = await Collector.findById(_id);
								if (input.departments[i].qrCode[q]._id) {
									res.residuesRegister.departments.forEach((department) => {
										department.qrCode.forEach((qrCode) => {
											if (qrCode.code == input.departments[i].qrCode[q].code) {
												qrCode.set(input.departments[i].qrCode[q]);
												isUpdated = true;
											}
										});
									});
									if (isUpdated) {
										await res.update(res).then(console.log('ok set qr codes'));
										res = await Collector.findById(_id);
										isUpdated = false;

										/* gerando checkPoint */
										var checkpoint = await CheckPoint.findOne({ _idCorporation: _id });
										var element = await new Promise((resolve, reject) => {
											checkpoint.wastegenerated.qrCode.forEach((qrCode) => {
												if (qrCode.code == input.departments[i].qrCode[q].code) {
													qrCode.set(input.departments[i].qrCode[q]);
												}
											});
											CheckPoint.findOne({ _idCorporation: _id }, function(err, check) {
												if (!check) console.log('ERE009');
												else {
													check.wastegenerated = checkpoint.wastegenerated;
													check.update(check).then((x) => {
														resolve();
													});
												}
											});
										});

										/* gerando histórico de alterações */
										var transaction = await TransactionHistory.findOne({ _idCorporation: _id });
										res = await Collector.findById(_id);
										var history = await new Promise((resolve, reject) => {
											var value = {
												date: new Date(),
												code: input.departments[i].qrCode[q].code,
												material: input.departments[i].qrCode[q].material
											};
											TransactionHistory.findOne({ _idCorporation: _id }, function(err, trans) {
												if (!trans) console.log('ERE009');
												else {
													trans.checkPoints.wastegenerated.qrCode.push(value);
													trans.update(trans).then((x) => {});
												}
											});
											resolve();
										});
										res = await Collector.findById(_id);
									}
								} else {
									res.residuesRegister.departments.forEach((department) => {
										if (input.departments[i]._id == department._id) {
											department.qrCode.push(input.departments[i].qrCode[q]);
										}
									});
									await res.update(res).then(console.log('ok push to exist department'));
									res = await Collector.findById(_id);

									/* gerando checkPoint */
									var checkpoint = await CheckPoint.findOne({ _idCorporation: _id });
									var isPushed = false;
									var element = await new Promise((resolve, reject) => {
										checkpoint.wastegenerated.qrCode.forEach((qrCode, index) => {
											if (!isPushed) {
												checkpoint.wastegenerated.qrCode.push(input.departments[i].qrCode[q]);
												isPushed = true;
											}
										});
										CheckPoint.findOne({ _idCorporation: _id }, function(err, check) {
											if (!check) console.log('ERE009');
											else {
												check.wastegenerated = checkpoint.wastegenerated;
												check.update(check).then((x) => {
													resolve();
												});
											}
										});
									});

									/* gerando histórico de alterações */
									res = await Collector.findById(_id);
									var transaction = await TransactionHistory.findOne({ _idCorporation: _id });
									var history = await new Promise((resolve, reject) => {
										var value = {
											date: new Date(),
											code: input.departments[i].qrCode[q].code,
											material: input.departments[i].qrCode[q].material
										};
										TransactionHistory.findOne({ _idCorporation: _id }, function(err, trans) {
											if (!trans) console.log('ERE009');
											else {
												trans.checkPoints.wastegenerated.qrCode.push(value);
												trans.update(trans).then((x) => {});
												resolve();
											}
										});
									});
									res = await Collector.findById(_id);
								}
							}
						}
					}
				}

				await session.commitTransaction();
				await session.endSession();
				console.log('resolved');

				var res = await Collector.findById(_id);
				return res.residuesRegister;
			} catch (error) {
				await session.abortTransaction();
				await session.endSession();
				console.log(error);
				console.log('aborting');
				return new Error('ERE009');
			}
		},

		async createorUpdateScheduling(root, { _id, input }) {
			const session = await mongoose.startSession();
			try {
				session.startTransaction();
				var res = await Collector.findById(_id);

				if (!res.scheduling || res.scheduling.length <= 0) {
					returnElement = await new Promise((resolve, reject) => {
						Collector.findById(_id, function(err, corp) {
							if (!corp) console.log('ERE009');
							else {
								input.forEach((scheduling) => {
									if (res.scheduling === undefined || res.scheduling.length <= 0) {
										res.scheduling = [ scheduling ];
									} else {
										res.scheduling.push(scheduling);
									}
								});
							}

							corp.scheduling = res.scheduling;
							corp.update(corp).then((x) => {
								resolve(corp);
							});
						});
					});

					/* gerando checkPoint */
					var checkpoint = await CheckPoint.findOne({ _idCorporation: _id });
					res = await Collector.findById(_id);
					var isNew = false;
					var checkpoin = await new Promise(async (resolve, reject) => {
						res.scheduling.forEach((scheduling) => {
							scheduling.qrCode.forEach((qrCode) => {
								if (!checkpoint) {
									var value = {
										code: qrCode.code,
										material: qrCode.material
									};

									checkpoint = new Object({
										collectionrequested: new Object({
											qrCode: [ value ]
										})
									});
									isNew = true;
								} else {
									var value = {
										code: qrCode.code,
										material: qrCode.material
									};

									if (!checkpoint.collectionrequested || checkpoint.collectionrequested.length <= 0) {
										checkpoint = new Object({
											collectionrequested: new Object({
												qrCode: [ value ]
											})
										});
									} else {
										checkpoint.collectionrequested.qrCode.push(value);
									}
								}
							});
						});
						if (isNew) {
							var returned = await CheckPoint.create(checkpoint);
						} else {
							CheckPoint.findOne({ _idCorporation: _id }, function(err, check) {
								if (!check) console.log('ERE009');
								else {
									if (!check || check.length <= 0) {
										check = check;
									} else {
										check.collectionrequested = checkpoint.collectionrequested;
									}
									check.update(check).then((x) => {});
								}
							});
						}
						resolve();
					});

					/*Gerando historico */
					var transaction = await TransactionHistory.findOne({ _idCorporation: _id });
					res = await Collector.findById(_id);
					var isNew = false;
					var history = await new Promise(async (resolve, reject) => {
						res.scheduling.forEach((scheduling) => {
							scheduling.qrCode.forEach((qrCode) => {
								if (!transaction) {
									var value = {
										date: new Date(),
										code: qrCode.code,
										material: qrCode.material
									};

									transaction = new Object({
										checkPoints: new Object({
											collectionrequested: new Object({
												qrCode: [ value ]
											})
										})
									});
									isNew = true;
								} else {
									var value = {
										date: new Date(),
										code: qrCode.code,
										material: qrCode.material
									};

									if (
										!transaction.checkPoints ||
										!transaction.checkPoints.collectionrequested ||
										transaction.checkPoints.collectionrequested.length <= 0
									) {
										transaction = new Object({
											checkPoints: new Object({
												collectionrequested: new Object({
													qrCode: [ value ]
												})
											})
										});
									} else {
										transaction.checkPoints.collectionrequested.qrCode.push(value);
									}
								}
							});
						});
						if (isNew) {
							var returned = await TransactionHistory.create(transaction);
						} else {
							TransactionHistory.findOne({ _idCorporation: _id }, function(err, trans) {
								if (!trans) console.log('ERE009');
								else {
									if (!trans || trans.length <= 0) {
										trans = transaction;
									} else {
										trans.checkPoints.collectionrequested =
											transaction.checkPoints.collectionrequested;
									}
									trans.update(trans).then((x) => {});
								}
							});
						}
						resolve();
					});
				} else {
					for (var i = 0; input.length > i; i++) {
						var exist = await res.scheduling.find((x) => x._id == input[i]._id);

						if (!exist || exist.length <= 0) {
							res.scheduling.push(input[i]);
							await res.update(res).then(console.log('ok push scheduling'));
						} else {
							exist.set(input[i]);
							await res.update(res).then(console.log('ok set scheduling'));
						}
						res = await Collector.findById(_id);

						/* gerando checkPoint */
						var checkpoint = await CheckPoint.findOne({ _idCorporation: _id });
						var element = await new Promise((resolve, reject) => {
							for (var x = 0; input[i].qrCode.length > x; x++) {
								var existQr = undefined;
								for (y = 0; y < checkpoint.collectionrequested.qrCode.length; y++) {
									if (checkpoint.collectionrequested.qrCode[y].code === input[i].qrCode[x].code) {
										existQr = checkpoint.collectionrequested.qrCode[y];
									}
								}
								if (existQr) {
									existQr.set(input[i].qrCode[x]);
								} else {
									checkpoint.collectionrequested.qrCode.push(input[i].qrCode[x]);
								}
							}

							CheckPoint.findOne({ _idCorporation: _id }, function(err, check) {
								if (!check) console.log('ERE009');
								else {
									check.collectionrequested = checkpoint.collectionrequested;
									check.update(check).then((x) => {
										resolve();
									});
								}
							});
						});

						/* gerando histórico de alterações */
						var transaction = await TransactionHistory.findOne({ _idCorporation: _id });
						var element = await new Promise((resolve, reject) => {
							for (var x = 0; input[i].qrCode.length > x; x++) {
								transaction.checkPoints.collectionrequested.qrCode.push(input[i].qrCode[x]);
							}

							TransactionHistory.findOne({ _idCorporation: _id }, function(err, trans) {
								if (!trans) console.log('ERE009');
								else {
									trans.checkPoints.collectionrequested = transaction.checkPoints.collectionrequested;
									trans.update(trans).then((x) => {
										resolve();
									});
								}
							});
						});
						res = await Collector.findById(_id);
					}
				}

				await session.commitTransaction();
				await session.endSession();
				console.log('resolved');

				var res = await Collector.findById(_id);
				return res.scheduling;
			} catch (error) {
				await session.abortTransaction();
				await session.endSession();
				console.log(error);
				console.log('aborting');
				return new Error('ERE009');
			}
		},

		async createorUpdateEntries(root, { _id, input }) {
			const session = await mongoose.startSession();
			try {
				session.startTransaction();
				var res = await Collector.findById(_id);
				if (res.entries === undefined || res.entries === null) {
					returnElement = await new Promise((resolve, reject) => {
						Collector.findById(_id, function(err, corp) {
							if (!corp) console.log('ERE009');
							else {
								if (res.entries === undefined || res.entries === null) {
									res.entries = input;
								} else {
									res.entries = input;
								}
							}

							corp.entries = res.entries;
							corp.update(corp).then((x) => {
								resolve(corp);
							});
						});
					});
					/* gerando checkPoint */
					var checkpoint = await CheckPoint.find({ _idCorporation: _id });
					res = await Collector.findById(_id);
					var isNew = false;
					var checkpoin = await new Promise(async (resolve, reject) => {
						if (res.entries.sale && res.entries.sale.length > 0) {
							res.entries.sale.forEach((sale) => {
								if (!checkpoint || checkpoint.length <= 0) {
									var value = {
										code: sale.qrCode.code,
										material: sale.qrCode.material
									};
									checkpoint = new Object({
										collectionperformed: new Object({
											qrCode: [ value ]
										})
									});
									isNew = true;
								} else {
									var value = {
										code: sale.qrCode.code,
										material: sale.qrCode.material
									};

									if (!checkpoint.collectionperformed || checkpoint.collectionperformed.length <= 0) {
										checkpoint = new Object({
											collectionperformed: new Object({
												qrCode: [ value ]
											})
										});
									} else {
										checkpoint.collectionperformed.qrCode.push(value);
									}
								}
							});
						} else if (res.entries.purchase && res.entries.purchase.length > 0) {
							res.entries.purchase.forEach((purchase) => {
								if (!checkpoint || checkpoint.length <= 0) {
									var value = {
										code: purchase.qrCode.code,
										material: purchase.qrCode.material
									};

									checkpoint = new Object({
										collectionperformed: new Object({
											qrCode: [ value ]
										})
									});
									isNew = true;
								} else {
									var value = {
										code: purchase.qrCode.code,
										material: purchase.qrCode.material
									};

									if (!checkpoint.collectionperformed || checkpoint.collectionperformed.length <= 0) {
										checkpoint = new Object({
											collectionperformed: new Object({
												qrCode: [ value ]
											})
										});
									} else {
										checkpoint.collectionperformed.qrCode.push(value);
									}
								}
							});
						}
						if (isNew) {
							var returned = await CheckPoint.create(checkpoint);
						} else {
							CheckPoint.findOne({ _idCorporation: _id }, function(err, check) {
								if (!check) {
									console.log('ERE009');
								} else {
									if (!check || check.length <= 0) {
										check = checkpoint;
									} else {
										check.collectionperformed = checkpoint.collectionperformed;
									}
									check.update(check).then((x) => {});
								}
							});
						}
						resolve();
					});

					/* gerando histórico de alterações */
					var transaction = await TransactionHistory.find({ _idCorporation: _id });
					res = await Collector.findById(_id);
					var isNew = false;
					var history = await new Promise(async (resolve, reject) => {
						if (res.entries.sale && res.entries.sale.length > 0) {
							res.entries.sale.forEach((sale) => {
								if (transaction === undefined || transaction === null) {
									var value = {
										date: new Date(),
										code: sale.qrCode.code,
										material: sale.qrCode.material
									};

									transaction = new Object({
										checkPoints: new Object({
											collectionperformed: new Object({
												qrCode: [ value ]
											})
										})
									});
									isNew = true;
								} else {
									var value = {
										date: new Date(),
										code: sale.qrCode.code,
										material: sale.qrCode.material
									};

									if (
										!transaction.checkPoints ||
										!transaction.checkPoints.collectionperformed ||
										transaction.checkPoints.collectionperformed.length <= 0
									) {
										transaction = new Object({
											checkPoints: new Object({
												collectionperformed: new Object({
													qrCode: [ value ]
												})
											})
										});
									} else {
										transaction.checkPoints.collectionperformed.qrCode.push(value);
									}
								}
							});
						} else if (res.entries.purchase && res.entries.purchase.length > 0) {
							res.entries.purchase.forEach((purchase) => {
								if (transaction === undefined || transaction === null) {
									var value = {
										date: new Date(),
										code: purchase.qrCode.code,
										material: purchase.qrCode.material
									};

									transaction = new Object({
										checkPoints: new Object({
											collectionperformed: new Object({
												qrCode: [ value ]
											})
										})
									});
									isNew = true;
								} else {
									var value = {
										date: new Date(),
										code: purchase.qrCode.code,
										material: purchase.qrCode.material
									};

									if (
										!transaction.checkPoints ||
										!transaction.checkPoints.collectionperformed ||
										transaction.checkPoints.collectionperformed.length <= 0
									) {
										transaction = new Object({
											checkPoints: new Object({
												collectionperformed: new Object({
													qrCode: [ value ]
												})
											})
										});
									} else {
										transaction.checkPoints.collectionperformed.qrCode.push(value);
									}
								}
							});
						}
						if (isNew) {
							var returned = await TransactionHistory.create(transaction);
						} else {
							TransactionHistory.findOne({ _idCorporation: _id }, function(err, trans) {
								if (!trans) console.log('ERE009');
								else {
									if (trans === undefined || trans === null) {
										trans = transaction;
									} else {
										trans.checkPoints.collectionperformed =
											transaction.checkPoints.collectionperformed;
									}
									trans.update(trans).then((x) => {});
								}
							});
						}
						resolve();
					});
				} else {
					if (input.sale !== undefined || input.sale.length > 0) {
						for (i = 0; i < input.sale.length; i++) {
							var exist = await res.entries.sale.find((x) => x._id == input.sale[i]._id);
							if (exist) {
								exist.set(input.sale[i]);
								await res.update(res).then(console.log('ok set entries sale'));
							} else {
								await res.entries.sale.push(input.sale[i]);
								await res.update(res).then(console.log('ok push entries sale'));
							}
							res = await Collector.findById(_id);

							/* gerando checkPoint */
							var checkpoint = await CheckPoint.findOne({ _idCorporation: _id });
							var element = await new Promise((resolve, reject) => {
								if (input.sale !== undefined && input.sale.length > 0) {
									var existQr = undefined;
									for (y = 0; y < checkpoint.collectionperformed.qrCode.length; y++) {
										if (
											checkpoint.collectionperformed.qrCode[y].code === input.sale[i].qrCode.code
										) {
											existQr = checkpoint.collectionperformed.qrCode[y];
										}
									}
									if (existQr) {
										existQr.set(input.sale[i].qrCode);
									} else {
										checkpoint.collectionperformed.qrCode.push(input.sale[i].qrCode);
									}
								}
								CheckPoint.findOne({ _idCorporation: _id }, function(err, check) {
									if (!check) console.log('ERE009');
									else {
										check.collectionperformed = checkpoint.collectionperformed;
										check.update(check).then((x) => {
											resolve();
										});
									}
								});
							});

							/* gerando histórico de alterações */
							res = await Collector.findById(_id);
							var transaction = await TransactionHistory.findOne({ _idCorporation: _id });
							var element = await new Promise((resolve, reject) => {
								if (input.sale !== undefined && input.sale.length > 0) {
									transaction.checkPoints.collectionperformed.qrCode.push(input.sale[i].qrCode);
								}
								TransactionHistory.findOne({ _idCorporation: _id }, function(err, trans) {
									if (!trans) console.log('ERE009');
									else {
										trans.checkPoints.collectionperformed =
											transaction.checkPoints.collectionperformed;
										trans.update(trans).then((x) => {
											resolve();
										});
									}
								});
							});
							res = await Collector.findById(_id);
						}
					} else if (input.purchase !== undefined || input.purchase.length > 0) {
						for (i = 0; i < input.purchase.length; i++) {
							var exist = await res.entries.purchase.find((x) => x._id == input.purchase[i]._id);
							if (exist) {
								exist.set(input.purchase[i]);
								await res.update(res).then(console.log('ok set entries purchase'));
							} else {
								await res.entries.purchase.push(input.purchase[i]);
								await res.update(res).then(console.log('ok push entries purchase'));
							}
							res = await Collector.findById(_id);

							/* gerando checkPoint */
							var checkpoint = await CheckPoint.findOne({ _idCorporation: _id });
							var element = await new Promise((resolve, reject) => {
								if (input.purchase !== undefined && input.purchase.length > 0) {
									var existQr = undefined;
									for (y = 0; y < checkpoint.collectionperformed.qrCode.length; y++) {
										if (
											checkpoint.collectionperformed.qrCode[y].code ===
											input.purchase[i].qrCode.code
										) {
											existQr = checkpoint.collectionperformed.qrCode[y];
										}
									}
									if (existQr) {
										existQr.set(input.purchase[i].qrCode);
									} else {
										checkpoint.collectionperformed.qrCode.push(input.purchase[i].qrCode);
									}
								}

								CheckPoint.findOne({ _idCorporation: _id }, function(err, check) {
									if (!check) console.log('ERE009');
									else {
										check.collectionperformed = checkpoint.collectionperformed;
										check.update(check).then((x) => {
											resolve();
										});
									}
								});
							});

							/* gerando histórico de alterações */
							res = await Collector.findById(_id);
							var transaction = await TransactionHistory.findOne();
							var element = await new Promise((resolve, reject) => {
								if (input.purchase !== undefined && input.purchase.length > 0) {
									transaction.checkPoints.collectionperformed.qrCode.push(input.purchase[i].qrCode);
								}

								TransactionHistory.findOne({ _idCorporation: _id }, function(err, trans) {
									if (!trans) console.log('ERE009');
									else {
										trans.checkPoints.collectionperformed =
											transaction.checkPoints.collectionperformed;
										trans.update(trans).then((x) => {
											resolve();
										});
									}
								});
							});
							res = await Collector.findById(_id);
						}
					}
				}
				await session.commitTransaction();
				await session.endSession();
				console.log('resolved');

				var res = await Collector.findById(_id);
				return res.entries;
			} catch (error) {
				await session.abortTransaction();
				await session.endSession();
				console.log(error);
				console.log('aborting');
				return new Error('ERE009');
			}
		},
		async createorUpdateResidueArrived(root, { _id, input }) {},
		async createorUpdateDocument(root, { _id, input }) {
			try {
				var element = await new Promise((resolve, reject) => {
					var res = Collector.findById(_id, function(err, corp) {
						if (err) {
							reject(next(new Error('ERE009')));
						} else {
							for (var i = 0; input.length > i; i++) {
								if (input[i]._id) {
									index = corp.documents.findIndex((x) => x._id == input[i]._id);
									corp.documents[index] = input[i];
								} else {
									corp.documents.push(input[i]);
								}
							}
							corp.save();
							resolve(corp);
						}
					});
				});

				var res = await Collector.findById(_id);
				return res.documents;
			} catch (error) {
				throw new Error('ERE009');
			}
		}
	}
};

async function addID(_id, id, typeCorporation) {
	var object = {
		unitsId: id
	};
	if (typeCorporation === Classification.Collector) {
		var collector = await Collector.findById(_id);
		if (collector.units === undefined || collector.units.length <= 0) {
			collector['units'] = [ object ];
		} else {
			collector.units.push(object);
		}
		Collector.findOne(_id, function(err, coll) {
			if (!coll) console.log('ERE009');
			else {
				coll.units = collector.units;
				coll.update(coll).then((x) => {});
			}
		});
	} else if (typeCorporation === Classification.Provider) {
		var provider = await Provider.findById(_id);
		if (provider.units === undefined || provider.units.length <= 0) {
			provider['units'] = [ object ];
		} else {
			provider.units.push(object);
		}
		Provider.findOne(_id, function(err, prov) {
			if (!prov) console.log('ERE009');
			else {
				prov.units = provider.units;
				prov.update(prov).then((x) => {});
			}
		});
	} else {
		var corporation = await Corporation.findById(_id);
		if (corporation.units === undefined || corporation.units.length <= 0) {
			corporation['units'] = [ object ];
		} else {
			corporation.units.push(object);
		}
		await Corporation.findById(_id, function(err, corp) {
			if (!corp) console.log('ERE009');
			else {
				corp.units = corporation.units;
				corp.update(corp).then((x) => {});
			}
		});
	}
}
