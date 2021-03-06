mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Documents = new Schema({
	type: { type: String },
	name: String,
	archive: String,
	daysNotification: Number,
	date: Date,
	expire: Boolean
});

const Material = new Schema({
	type: { type: String },
	name: String,
	weight: Number,
	quantity: Number,
	active: Boolean,
	unity: String
});

const QrCode = new Schema({
	code: String,
	date: Date,
	material: Material
});

const ResidueArrived = new Schema({
	date: Date,
	name: String,
	cost: Number,
	typeEntrie: String,
	quantity: Number,
	weight: Number,
	amount: Number,
	qrCode: QrCode,
	observation: String,
	confirmedByCorporation: String,
	confirmedByCollector: String
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

const Entries = new Schema({
	purchase: [
		{
			date: Date,
			name: String,
			cost: Number,
			typeEntrie: String,
			quantity: Number,
			weight: Number,
			amount: Number,
			qrCode: QrCode
		}
	],
	sale: [
		{
			date: Date,
			name: String,
			cost: Number,
			typeEntrie: String,
			quantity: Number,
			weight: Number,
			amount: Number,
			qrCode: QrCode,
			_idColector: String
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
	picture: String,
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
			unitsId: String
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
	myProviders: [
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
			qrCode: [ QrCode ]
		}
	],
	entries: Entries,
	residuesArrived: [ ResidueArrived ],
	documents: [ Documents ]
});

module.exports = mongoose.model('corporation', CorporationSchema);
