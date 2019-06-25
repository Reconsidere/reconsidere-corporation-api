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
				res.departments;
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
				console.log(_id);
				console.log(input);
				input.forEach((department) => {
					if (department._id) {
						Corporation.findOneAndUpdate(
							{ _id: _id, 'departments._id': department._id },
							{
								$set: {
									'departments.$': department
								}
							}
						);
					} else {
						var res = Corporation.findById(_id);
						res.departments.push(depart);
						res.save();
					}
				});
				var res = Corporation.findById(_id);
				return res.departments;
			} catch (error) {
				throw new Error('ERE009');
			}
		}
	}
};
