Corporation = require('../../../models/corporation.model');
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
			var res = await Corporation.findById(_id);
			var returnAwaits;
			if (
				res.residuesRegister === undefined ||
				res.residuesRegister === null ||
				res.residuesRegister.departments === undefined ||
				res.residuesRegister.departments.length <= 0
			) {
				returnAwaits = await new Promise((resolve, reject) => {
					Corporation.findById(_id, function(err, corp) {
						if (!corp) console.log('ERE009');
						else {
							corp.residuesRegister = input;
							input.departments.forEach((department) => {
								department.isChanged = false;
								corp.residuesRegister.departments.qrCode = department.qrCode;
								department.qrCode.forEach((qrCode) => {
									corp.residuesRegister.departments.qrCode.material = qrCode.material;
								});
							});
							corp.residuesRegister = input;
							corp
								.update(corp)
								.then((corp) => {
									console.log('save new');
									resolve(corp.residuesRegister);
								})
								.catch((err) => {
									reject();
									throw new Error('ERE009');
								});
						}
					});
				});
			} else {
				for (i = 0; i < input.departments.length; i++) {
					var exist = await res.residuesRegister.departments.find((x) => x._id == input.departments[i]._id);
					if (exist === undefined || exist.length <= 0) {
						input.departments[i].isChanged = false;
						await res.residuesRegister.departments.push(input.departments[i]);
						await res.update(res).then(console.log('ok push in department'));
						res = await Corporation.findById(_id);
					} else {
						//verificar se o changed é true se for, verificar em em qual departamento estava o qrcode e excluir ele e inserir novo
						//caso usuario tenha mudado o departamento e voltado para o msm fazer com que que so de um set nos dados
						// if(input.departments[i].isChanged){

						// }

						for (q = 0; q < input.departments[i].qrCode.length; q++) {
							res = await Corporation.findById(_id);
							if (
								input.departments[i].qrCode[q]._id !== undefined &&
								input.departments[i].qrCode[q]._id !== null
							) {
								res.residuesRegister.departments.forEach((department) => {
									department.qrCode.forEach((qrCode) => {
										if (qrCode.code === input.departments[i].qrCode[q].code) {
											department.isChanged = false;
											qrCode.set(input.departments[i].qrCode[q]);
										}
									});
								});
								await res.update(res).then(console.log('ok set'));
								res = await Corporation.findById(_id);
							} else {
								res.residuesRegister.departments.forEach((department) => {
									department.isChanged = false;
									if (input.departments[i]._id == department._id) {
										department.qrCode.push(input.departments[i].qrCode[q]);
									}
								});
								await res.update(res).then(console.log('ok push to exist department'));
								res = await Corporation.findById(_id);
							}
						}
					}
				}
			}
			if (returnAwaits) {
				return returnAwaits;
			} else {
				console.log('resolved');
				var res = await Corporation.findById(_id);
				return res.residuesRegister;
			}
		},
		async createorUpdateCheckPoints(root, { _id, input }) {}
	}
};
