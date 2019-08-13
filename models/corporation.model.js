mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Material = new Schema({
	type: String,
	name: String,
	weight: Number,
	quantity: Number,
	active: Boolean,
	unity: String
});

const QrCode = new Schema({
	code: String,
	material: Material
});

const ResiduesRegisterSchema = new Schema({
	departments: [
		{
			isChanged: Boolean,
			name: String,
			description: String,
			active: Boolean,
			qrCode: [ QrCode ]
		}
	]
});

var CorporationSchema = new Schema({
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
				access: [ String ]
			},
			password: String,
			active: Boolean
		}
	],
	providers: [
		{
			providerId: String
		}
	],
	departments: [
		{
			name: String,
			description: String,
			active: Boolean,
			isChanged: Boolean
		}
	],
	
	residuesRegister: ResiduesRegisterSchema,
	scheduling: [
		{
			hour: Date,
			date: Date,
			active: Boolean,
			collector: {
				_id: String,
				company: String,
				cnpj: String,
				tradingName: String,
				active: Boolean,
				phone: Number,
				cellPhone: Number,
				class: String,
				email: String,
				classification: String
			},
			qrCode: [QrCode]
		}
	]
});

module.exports = mongoose.model('corporation', CorporationSchema);
