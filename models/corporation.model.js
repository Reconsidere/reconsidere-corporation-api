mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CorporationSchema = new Schema({
    company: String,
    cnpj: String,
    tradingName: String,
    active: Boolean,
    class: String,
    phone: Number,
    email: String,
    classification: String,
    cellPhone: Number,
    creationDate: Date,
    activationDate: Date,
    verificationDate: Date,
    location: {
        country: String,
        state: String,
        latitude: Number,
        longitude: Number,
        cep: String,
        publicPlace: String,
        neighborhood: String,
        number: Number,
        county: String,
        complement: String
    },
    units: [
        {
            name: String,
            location: {
                country: String,
                state: String,
                latitude: Number,
                longitude: Number,
                cep: String,
                publicPlace: String,
                neighborhood: String,
                number: Number,
                county: String,
                complement: String
            }
        }
    ],
    users: [
        {
            name: String,
            email: String,
            profile: {
                name: String,
                access: [String]
            },
            password: String,
            active: Boolean
        }
    ],
    providers: [{
        providerId: String
    }]

});

module.exports = mongoose.model('corporation', CorporationSchema);