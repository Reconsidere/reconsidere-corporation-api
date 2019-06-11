Corporation = require('../../../models/corporation.model');
module.exports = resolvers = {
    Query: {
        async getCorporation(root, {
            _id
        }) {
            return await Corporation.findById(_id);
        },
        async allCorporations() {
            return await Corporation.find();
        }
    },
    Mutation: {
        async createCorporation(root, {
            input
        }) {
            return await Corporation.create(input);
        },
        async updateCorporation(root, {
            _id,
            input
        }) {
            return await Corporation.findOneAndUpdate({
                _id
            }, input, {
                    new: true
                })
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