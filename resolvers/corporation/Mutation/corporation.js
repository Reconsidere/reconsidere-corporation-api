var Corporation = require('../../../models/corporation.model');
var CheckPoint = require('../../../models/checkpoint.model');
var TransactionHistory = require('../../../models/transactionhistory.model');
mongoose = require('mongoose');

module.exports = corporation = {
	Query: {
		async getCorporation(root, { _id }) {
			return await Corporation.findById(_id);
		},
		async getCorporationByUser(root, { _id }) {
			var res = await Corporation.findOne({ 'users._id': _id });
			if (!res) {
				return undefined;
			} else {
				return res;
			}
		},
		async allCorporations() {
			return await Corporation.find();
		},

		async allUnits(root, { _id }) {
			var res = await Corporation.findById(_id);
			if (res) {
				return res.units;
			} else {
				return undefined;
			}
		},

		async allDepartments(root, { _id }) {
			var res = await Corporation.findById(_id);
			if (res) {
				return res.departments;
			} else {
				return undefined;
			}
		},
		async allResiduesRegister(root, { _id }) {
			var res = await Corporation.findById(_id);
			if (res) {
				return res.residuesRegister;
			} else {
				return undefined;
			}
		},
		async allSchedulings(root, { _id }) {
			var res = await Corporation.findById(_id);
			if (res) {
				return res.scheduling;
			} else {
				return undefined;
			}
		},
		async allEntries(root, { _id }) {
			var res = await Corporation.findById(_id);
			if (res) {
				return res.entries;
			} else {
				return undefined;
			}
		}
	},
	Mutation: {
		async createCorporation(root, { input }) {
			var res = await Corporation.findOne({ 'users.email': input.users[0].email });
			if (res) {
				throw new Error('WRE005');
			} else {
				return await Corporation.create(input);
			}
		},
		async updateCorporation(root, { _id, input }) {
			return await Corporation.findOneAndUpdate(
				{
					_id
				},
				input,
				{
					new: true
				}
			);
		},
		async deleteCorporation(root, { _id }) {
			// return await Collector.findOneAndRemove({
			// 	_id
			// });
		},
		async createorUpdateDepartment(root, { _id, input }) {
			try {
				input.forEach((department) => {
					if (department._id) {
						Corporation.update(
							{ _id: _id, 'departments._id': department._id },
							{
								$set: {
									'departments.$': department
								}
							},
							function(err, model) {
								if (err) {
									throw new Error('ERE009');
								}
							}
						);
					} else {
						Corporation.update({ _id: _id }, { $push: { departments: department } }, function(
							error,
							success
						) {
							if (error) {
								throw new Error('ERE009');
							} else {
							}
						});
					}
				});
				var res = await Corporation.findById(_id);
				return res.departments;
			} catch (error) {
				throw new Error('ERE009');
			}
		},
		async createorUpdateResiduesRegister(root, { _id, input }) {
			const session = await mongoose.startSession();
			try {
				session.startTransaction();
				var res = await Corporation.findById(_id);
				var returnElement;
				if (
					res.residuesRegister === undefined ||
					res.residuesRegister === null ||
					res.residuesRegister.departments === undefined ||
					res.residuesRegister.departments.length <= 0
				) {
					var elementSaved;
					returnElement = await new Promise((resolve, reject) => {
						Corporation.findById(_id, function(err, corp) {
							if (!corp) console.log('ERE009');
							else {
								input.departments.forEach((department) => {
									if (
										res.residuesRegister === undefined ||
										res.residuesRegister === null ||
										res.residuesRegister.departments === undefined ||
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
					var checkpoint = await CheckPoint.find();
					var isNew = false;
					res = await Corporation.findById(_id);
					var checkpoin = await new Promise(async (resolve, reject) => {
						res.scheduling.forEach((scheduling) => {
							scheduling.qrCode.forEach((qrCode) => {
								if (checkpoint === undefined || checkpoint === null || checkpoint.length <= 0) {
									var value = {
										code: qrCode.code,
										material: qrCode.material
									};

									checkpoint = new Object({
										wastegenerated: new Object({
											qrCode: [ value ]
										})
									});
									isNew = true;
								} else {
									res.scheduling.forEach((scheduling) => {
										scheduling.qrCode.forEach((qrCode) => {
											var value = {
												code: qrCode.code,
												material: qrCode.material
											};

											if (
												checkpoint.wastegenerated === undefined ||
												checkpoint.wastegenerated.length <= 0
											) {
												checkpoint = new Object({
													wastegenerated: new Object({
														qrCode: [ value ]
													})
												});
											} else {
												checkpoint.wastegenerated.qrCode.push(value);
											}
										});
									});
								}
							});
						});
						if (isNew) {
							var returned = await CheckPoint.create(checkpoint);
						} else {
							CheckPoint.findOne(function(err, check) {
								if (!check) console.log('ERE009');
								else {
									if (check === undefined || check.length <= 0) {
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
					var transaction = await TransactionHistory.find();
					var isNew = false;
					res = await Corporation.findById(_id);
					var history = await new Promise(async (resolve, reject) => {
						res.scheduling.forEach((scheduling) => {
							scheduling.qrCode.forEach((qrCode) => {
								if (
									transaction === undefined ||
									transaction === null ||
									transaction.checkPoints === undefined
								) {
									var value = {
										date: new Date(),
										code: qrCode.code,
										material: qrCode.material
									};

									transaction = new Object({
										checkPoints: new Object({
											wastegenerated: new Object({
												qrCode: [ value ]
											})
										})
									});
									isNew = true;
								} else {
									res.scheduling.forEach((scheduling) => {
										scheduling.qrCode.forEach((qrCode) => {
											var value = {
												date: new Date(),
												code: qrCode.code,
												material: qrCode.material
											};

											if (
												transaction.wastegenerated === undefined ||
												transaction.wastegenerated.length <= 0
											) {
												transaction = new Object({
													checkPoints: new Object({
														wastegenerated: new Object({
															qrCode: [ value ]
														})
													})
												});
											} else {
												transaction.wastegenerated.qrCode.push(value);
											}
										});
									});
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
					for (i = 0; i < input.departments.length; i++) {
						var exist = await res.residuesRegister.departments.find(
							(x) => x._id == input.departments[i]._id
						);
						if (exist === undefined || exist.length <= 0) {
							input.departments[i].isChanged = false;
							await res.residuesRegister.departments.push(input.departments[i]);
							await res.update(res).then(console.log('ok push in department'));
							res = await Corporation.findById(_id);

							/* gerando checkPoint */
							var checkpoint = await CheckPoint.findOne();
							var element = await new Promise((resolve, reject) => {
								res.residuesRegister.departments.forEach((department) => {
									department.qrCode.forEach((qrCode) => {
										if (input.departments[i].name === department.name) {
											checkpoint.wastegenerated.qrCode.push(qrCode);
										}
									});
								});
								CheckPoint.findOne(function(err, check) {
									if (!check) console.log('ERE009');
									else {
										check.wastegenerated = checkpoint.wastegenerated;
										check.update(check).then((x) => {});
									}
								});
								resolve();
							});

							/* gerando histórico de alterações */
							res = await Corporation.findById(_id);
							var transaction = TransactionHistory.findOne();
							var history = await new Promise((resolve, reject) => {
								res.residuesRegister.departments.forEach((department) => {
									department.qrCode.forEach((qrCode) => {
										if (input.departments[i].name === department.name) {
											var value = {
												date: new Date(),
												code: qrCode.code,
												material: qrCode.material
											};
											TransactionHistory.findOne(function(err, trans) {
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
							res = await Corporation.findById(_id);
						} else {
							if (input.departments[i].isChanged) {
								var existRemoved = false;
								/*verifica se existe mudança de departamento e exclui o item que esta salvo no departamento antigo para depois inserir no novo
							Se por acaso o usuário modificou, mas voltou ao antigo ele apenas não exclui e retorn
							*/
								for (y = 0; y < input.departments[i].qrCode.length; y++) {
									res.residuesRegister.departments.forEach((department, index) => {
										department.qrCode.forEach((qrCode) => {
											if (!existRemoved) {
												if (qrCode.code === input.departments[i].qrCode[y].code) {
													if (input.departments[i]._id !== department._id) {
													} else {
														res.residuesRegister.departments.splice(index, 1);
													}
												}
											}
										});
									});
								}
								await res.update(res).then(console.log('ok set'));
								res = await Corporation.findById(_id);
							}

							for (q = 0; q < input.departments[i].qrCode.length; q++) {
								var isUpdated = false;
								res = await Corporation.findById(_id);
								if (
									input.departments[i].qrCode[q]._id !== undefined &&
									input.departments[i].qrCode[q]._id !== null
								) {
									res.residuesRegister.departments.forEach((department) => {
										department.qrCode.forEach((qrCode) => {
											if (qrCode.code == input.departments[i].qrCode[q].code) {
												department.isChanged = false;
												qrCode.set(input.departments[i].qrCode[q]);
												isUpdated = true;
											}
										});
									});
									if (isUpdated) {
										await res.update(res).then(console.log('ok set'));
										res = await Corporation.findById(_id);
										isUpdated = false;

										/* gerando checkPoint */
										var checkpoint = await CheckPoint.findOne();
										var element = await new Promise((resolve, reject) => {
											checkpoint.wastegenerated.qrCode.forEach((qrCode) => {
												if (qrCode.code == input.departments[i].qrCode[q].code) {
													qrCode.set(input.departments[i].qrCode[q]);
												}
											});
											CheckPoint.findOne(function(err, check) {
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
										var transaction = await TransactionHistory.findOne();
										res = await Corporation.findById(_id);
										var history = await new Promise((resolve, reject) => {
											var value = {
												date: new Date(),
												code: input.departments[i].qrCode[q].code,
												material: input.departments[i].qrCode[q].material
											};
											TransactionHistory.findOne(function(err, trans) {
												if (!trans) console.log('ERE009');
												else {
													trans.checkPoints.wastegenerated.qrCode.push(value);
													trans.update(trans).then((x) => {});
												}
											});
											resolve();
										});
										res = await Corporation.findById(_id);
									}
								} else {
									res.residuesRegister.departments.forEach((department) => {
										department.isChanged = false;
										if (input.departments[i]._id == department._id) {
											department.qrCode.push(input.departments[i].qrCode[q]);
										}
									});
									await res.update(res).then(console.log('ok push to exist department'));
									res = await Corporation.findById(_id);

									/* gerando checkPoint */
									var checkpoint = await CheckPoint.findOne();
									var isPushed = false;
									var element = await new Promise((resolve, reject) => {
										checkpoint.wastegenerated.qrCode.forEach((qrCode, index) => {
											if (!isPushed) {
												checkpoint.wastegenerated.qrCode.push(input.departments[i].qrCode[q]);
												isPushed = true;
											}
										});
										CheckPoint.findOne(function(err, check) {
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
									res = await Corporation.findById(_id);
									var transaction = await TransactionHistory.findOne();
									var history = await new Promise((resolve, reject) => {
										var value = {
											date: new Date(),
											code: input.departments[i].qrCode[q].code,
											material: input.departments[i].qrCode[q].material
										};
										TransactionHistory.findOne(function(err, trans) {
											if (!trans) console.log('ERE009');
											else {
												trans.checkPoints.wastegenerated.qrCode.push(value);
												trans.update(trans).then((x) => {});
											}
										});

										resolve();
									});
									res = await Corporation.findById(_id);
								}
							}
						}
					}
				}

				await session.commitTransaction();
				await session.endSession();
				console.log('resolved');

				var res = await Corporation.findById(_id);
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
				var res = await Corporation.findById(_id);

				if (res.scheduling === undefined || res.scheduling.length <= 0) {
					returnElement = await new Promise((resolve, reject) => {
						Corporation.findById(_id, function(err, corp) {
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
					var checkpoint = await CheckPoint.find();
					var isNew = false;
					res = await Corporation.findById(_id);
					var checkpoin = await new Promise(async (resolve, reject) => {
						res.scheduling.forEach((scheduling) => {
							scheduling.qrCode.forEach((qrCode) => {
								console.log(checkpoint);
								if (checkpoint === undefined || checkpoint === null || checkpoint.length <= 0) {
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
									res.scheduling.forEach((scheduling) => {
										scheduling.qrCode.forEach((qrCode) => {
											var value = {
												code: qrCode.code,
												material: qrCode.material
											};

											if (
												checkpoint.collectionrequested === undefined ||
												checkpoint.collectionrequested.length <= 0
											) {
												checkpoint = new Object({
													collectionrequested: new Object({
														qrCode: [ value ]
													})
												});
											} else {
												checkpoint.collectionrequested.qrCode.push(value);
											}
										});
									});
								}
							});
						});
						if (isNew) {
							var returned = await CheckPoint.create(checkpoint);
						} else {
							CheckPoint.findOne(function(err, check) {
								if (!check) {
									console.log('ERE009');
								} else {
									if (check === undefined || check.length <= 0) {
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

					/* gerando histórico de alterações */
					var transaction = TransactionHistory.find();
					var isNew = false;
					res = await Corporation.findById(_id);
					var history = await new Promise(async (resolve, reject) => {
						res.scheduling.forEach((scheduling) => {
							scheduling.qrCode.forEach((qrCode) => {
								if (
									transaction === undefined ||
									transaction === null ||
									transaction.length <= 0 ||
									transaction.checkPoints === undefined
								) {
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
									res.scheduling.forEach((scheduling) => {
										scheduling.qrCode.forEach((qrCode) => {
											var value = {
												date: new Date(),
												code: qrCode.code,
												material: qrCode.material
											};

											if (
												transaction.collectionrequested === undefined ||
												transaction.collectionrequested.length <= 0
											) {
												transaction = new Object({
													checkPoints: new Object({
														collectionrequested: new Object({
															qrCode: [ value ]
														})
													})
												});
											} else {
												transaction.collectionrequested.qrCode.push(value);
											}
										});
									});
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
					for (i = 0; i < input.length; i++) {
						var exist = await res.scheduling.find((x) => x._id == input[i]._id);

						if (exist === undefined) {
							//input.departments[i].isChanged = false;
							await res.scheduling.push(input[i]);
							await res.update(res).then(console.log('ok push scheduling'));
						} else {
							exist.set(input[i]);
							await res.update(res).then(console.log('ok set scheduling'));
						}
						res = await Corporation.findById(_id);

						/* gerando checkPoint */
						var checkpoint = await CheckPoint.findOne();
						var element = await new Promise((resolve, reject) => {
							for (x = 0; x < input[i].qrCode.length; x++) {
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

							CheckPoint.findOne(function(err, check) {
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
						var transaction = await TransactionHistory.findOne();
						var element = await new Promise((resolve, reject) => {
							for (x = 0; x < input[i].qrCode.length; x++) {
								transaction.checkPoints.collectionrequested.qrCode.push(input[i].qrCode[x]);
							}

							TransactionHistory.findOne(function(err, trans) {
								if (!trans) console.log('ERE009');
								else {
									trans.checkPoints.collectionrequested = transaction.checkPoints.collectionrequested;
									trans.update(trans).then((x) => {
										resolve();
									});
								}
							});
						});
						res = await Corporation.findById(_id);
					}
				}

				await session.commitTransaction();
				await session.endSession();
				console.log('resolved');

				var res = await Corporation.findById(_id);
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
				var res = await Corporation.findById(_id);
				if (res.entries === undefined || res.entries === null) {
					returnElement = await new Promise((resolve, reject) => {
						Corporation.findById(_id, function(err, corp) {
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
					var checkpoint = await CheckPoint.find();
					var isNew = false;
					res = await Corporation.findById(_id);
					var checkpoin = await new Promise(async (resolve, reject) => {
						if (
							res.entries.sale !== null &&
							res.entries.sale !== undefined &&
							res.entries.sale.length > 0
						) {
							res.entries.sale.forEach((sale) => {
								if (checkpoint === undefined || checkpoint === null || checkpoint.length <= 0) {
									var value = {
										code: sale.qrCode.code,
										material: sale.qrCode.material
									};

									checkpoint['collectionperformed'] = new Object({
										qrCode: [ value ]
									});
									isNew = true;
								} else {
									res.entries.sale.forEach((sale) => {
										var value = {
											code: sale.qrCode.code,
											material: sale.qrCode.material
										};

										if (
											checkpoint.collectionperformed === undefined ||
											checkpoint.collectionperformed.length <= 0
										) {
											checkpoint['collectionperformed'] = new Object({
												qrCode: [ value ]
											});
										} else {
											checkpoint.collectionperformed.qrCode.push(value);
										}
									});
								}
							});
						} else if (
							res.entries.purchase !== null &&
							res.entries.purchase !== undefined &&
							res.entries.purchase.length > 0
						) {
							res.entries.purchase.forEach((purchase) => {
								if (checkpoint === undefined || checkpoint === null || checkpoint.length <= 0) {
									var value = {
										code: purchase.qrCode.code,
										material: purchase.qrCode.material
									};

									checkpoint['collectionperformed'] = new Object({
										qrCode: [ value ]
									});
									isNew = true;
								} else {
									res.entries.purchase.forEach((purchase) => {
										var value = {
											code: purchase.qrCode.code,
											material: purchase.qrCode.material
										};

										if (
											checkpoint.collectionperformed === undefined ||
											checkpoint.collectionperformed.length <= 0
										) {
											checkpoint['collectionperformed'] = new Object({
												qrCode: [ value ]
											});
										} else {
											checkpoint.collectionperformed.qrCode.push(value);
										}
									});
								}
							});
						}
						if (isNew) {
							var returned = await CheckPoint.create(checkpoint);
						} else {
							CheckPoint.findOne(function(err, check) {
								if (!check) {
									console.log('ERE009');
								} else {
									if (check === undefined || check.length <= 0) {
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
					var transaction = await TransactionHistory.findOne();
					var isNew = false;
					res = await Corporation.findById(_id);
					var history = await new Promise(async (resolve, reject) => {
						if (
							res.entries.sale !== null &&
							res.entries.sale !== undefined &&
							res.entries.sale.length > 0
						) {
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
									res.entries.sale.forEach((sale) => {
										var value = {
											date: new Date(),
											code: sale.qrCode.code,
											material: sale.qrCode.material
										};

										if (
											transaction.checkPoints.collectionperformed === undefined ||
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
									});
								}
							});
						} else if (
							res.entries.purchase !== null &&
							res.entries.purchase !== undefined &&
							res.entries.purchase.length > 0
						) {
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
									res.entries.purchase.forEach((purchase) => {
										var value = {
											date: new Date(),
											code: purchase.qrCode.code,
											material: purchase.qrCode.material
										};

										if (
											transaction.checkPoints.collectionperformed === undefined ||
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
									});
								}
							});
						}
						if (isNew) {
							var returned = await TransactionHistory.create(transaction);
						} else {
							TransactionHistory.findOne(function(err, trans) {
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
							res = await Corporation.findById(_id);

							/* gerando checkPoint */
							var checkpoint = await CheckPoint.findOne();
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
								CheckPoint.findOne(function(err, check) {
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
							res = await Corporation.findById(_id);
							var transaction = await TransactionHistory.findOne();
							var element = await new Promise((resolve, reject) => {
								if (input.sale !== undefined && input.sale.length > 0) {
									transaction.checkPoints.collectionperformed.qrCode.push(input.sale[i].qrCode);
								}
								TransactionHistory.findOne(function(err, trans) {
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
							res = await Corporation.findById(_id);
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
							res = await Corporation.findById(_id);

							/* gerando checkPoint */
							var checkpoint = await CheckPoint.findOne();
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

								CheckPoint.findOne(function(err, check) {
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
							res = await Corporation.findById(_id);
							var transaction = await TransactionHistory.findOne();
							var element = await new Promise((resolve, reject) => {
								if (input.purchase !== undefined && input.purchase.length > 0) {
									transaction.checkPoints.collectionperformed.qrCode.push(input.purchase[i].qrCode);
								}

								TransactionHistory.findOne(function(err, trans) {
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
							res = await Corporation.findById(_id);
						}
					}
				}
				await session.commitTransaction();
				await session.endSession();
				console.log('resolved');

				var res = await Corporation.findById(_id);
				return res.entries;
			} catch (error) {
				await session.abortTransaction();
				await session.endSession();
				console.log(error);
				console.log('aborting');
				return new Error('ERE009');
			}
		}
	}
};
