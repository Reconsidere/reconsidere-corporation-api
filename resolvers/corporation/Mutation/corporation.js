Corporation = require('../../../models/corporation.model');
Blockchain = require('../../../blockchain/blockchain');

module.exports = corporation = {
	Query: {
		async getCorporation(root, { _id }) {
			return await Corporation.findById(_id);
		},
		async getCorporationByUser(root, { _id }) {
			var res = await Corporation.findOne({ 'users._id': _id });
			if (!res) {
				return null;
			} else {
				return res;
			}
		},
		async allCorporations() {
			return await Corporation.find();
		},
		async signIn(root, { email, password }) {
			var res = await Corporation.findOne({
				$and: [ { 'users.email': email }, { 'users.password': password } ]
			});
			if (!res) {
				return null;
			} else {
				res.users = res.users.filter((x) => x.email === email && x.password === password);
				return res;
			}
		},

		async allUnits(root, { _id }) {
			var res = await Corporation.findById(_id);
			if (res) {
				return res.units;
			} else {
				return null;
			}
		},

		async allDepartments(root, { _id }) {
			var res = await Corporation.findById(_id);
			if (res) {
				return res.departments;
			} else {
				return null;
			}
		},
		async allCheckPoints(root, { _id }) {
			var res = await Corporation.findById(_id);
			if (res) {
				return res.checkPoints;
			} else {
				return null;
			}
		},
		async allResiduesRegister(root, { _id }) {
			var res = await Corporation.findById(_id);
			if (res) {
				return res.residuesRegister;
			} else {
				return null;
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
			return await Product.findOneAndRemove({
				_id
			});
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
			const session = await Corporation.startSession();
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
					res = await Corporation.findById(_id);
					var element = await new Promise((resolve, reject) => {
						res.residuesRegister.departments.forEach((department) => {
							department.qrCode.forEach((qrCode) => {
								res.checkPoints.wastegenerated.qrCode.push(qrCode);
							});
						});
						Corporation.findById(_id, function(err, corp) {
							if (!corp) console.log('ERE009');
							else {
								corp.checkPoints.wastegenerated = res.checkPoints.wastegenerated;
								corp.update(corp).then((x) => {
									resolve(corp);
								});
							}
						});
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
							var element = await new Promise((resolve, reject) => {
								res.residuesRegister.departments.forEach((department) => {
									department.qrCode.forEach((qrCode) => {
										if (input.departments[i].name === department.name) {
											res.checkPoints.wastegenerated.qrCode.push(qrCode);
										}
									});
								});
								Corporation.findById(_id, function(err, corp) {
									if (!corp) console.log('ERE009');
									else {
										corp.checkPoints.wastegenerated = res.checkPoints.wastegenerated;
										corp.update(corp).then((x) => {
											resolve(corp);
										});
									}
								});
							});
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
										var element = await new Promise((resolve, reject) => {
											res.checkPoints.wastegenerated.qrCode.forEach((qrCode, index) => {
												if (qrCode.code == input.departments[i].qrCode[q].code) {
													qrCode.set(input.departments[i].qrCode[q]);
												}
											});
											Corporation.findById(_id, function(err, corp) {
												if (!corp) console.log('ERE009');
												else {
													corp.checkPoints.wastegenerated = res.checkPoints.wastegenerated;
													corp.update(corp).then((x) => {
														resolve(corp);
													});
												}
											});
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
									var isPushed = false;
									var element = await new Promise((resolve, reject) => {
										res.checkPoints.wastegenerated.qrCode.forEach((qrCode, index) => {
											if (!isPushed) {
												res.checkPoints.wastegenerated.qrCode.push(
													input.departments[i].qrCode[q]
												);
												isPushed = true;
											}
										});
										Corporation.findById(_id, function(err, corp) {
											if (!corp) console.log('ERE009');
											else {
												corp.checkPoints.wastegenerated = res.checkPoints.wastegenerated;
												corp.update(corp).then((x) => {
													resolve(corp);
												});
											}
										});
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
				console.log('aborting');
				console.log(error);
				await session.abortTransaction();
				await session.endSession();
				return new Error('ERE009');
			}
		},
		async createorUpdateCheckPoints(root, { _id, input }) {}
	}
};
