Corporation = require('../../../models/corporation.model');
Collector = require('../../../models/collector.model');
module.exports = login = {
	Query: {
		async signIn(root, { email, password }) {
			try {
				var res = await Corporation.findOne({
					$and: [ { 'users.email': email }, { 'users.password': password } ]
				});
				if (!res) {
				} else {
					res.users = res.users.filter((x) => x.email === email && x.password === password);
					return res;
				}

				res = await Collector.findOne({
					$and: [ { 'users.email': email }, { 'users.password': password } ]
				});
				if (!res) {
					return null;
				} else {
					res.users = res.users.filter((x) => x.email === email && x.password === password);
					return res;
				}
			} catch (error) {
				return null;
			}
		}
	}
};
