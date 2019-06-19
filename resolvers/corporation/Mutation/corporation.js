Corporation = require('../../../models/corporation.model');
module.exports = resolvers = {
    Query: {
        async getCorporation(root, {
            _id
        }) {
            return await Corporation.findById(_id);
        },
        async getCorporationByUser(root, {
            _id
        }) {
            var res = await Corporation.findOne({ 'users._id': _id }
            )
            if (!res) {
                return null;
            } else {
                return res;
            }
        },
        async allCorporations() {
            return await Corporation.find();
        },
        async signIn(root, {
            email, password
        }) {
            var res = await Corporation.findOne(
                {
                    $and: [
                        { 'users.email': email },
                        { 'users.password': password },
                    ],
                }
            )
            if (!res) {
                return null;
            } else {
                res.users = res.users.filter(x => x.email === email && x.password === password);
                return res;
            }
        },
    },
    Mutation: {
        async createCorporation(root, {
            input
        }) {
            var res = await Corporation.findOne({ 'users.email': input.users[0].email })
            if (res) {
                throw new Error('WRE005');
            } else {
                return await Corporation.create(input);
            }
        },
        async updateCorporation(root, {
            _id,
            input
        }) {
            return await Corporation.findOneAndUpdate(_id, { input }, { new: true })
        },
        async deleteCorporation(root, {
            _id
        }) {
            return await Product.findOneAndRemove({
                _id
            });
        }
    }
};