Corporation = require('../../../models/corporation.model');
module.exports = unit = {
    Query: {
        async allUnits(root, {
            _id
        }) {
            var res = await Corporation.findById(_id);
            if (res) {
                return res.units;
            } else {
                return null;
            }
        },
    },

};