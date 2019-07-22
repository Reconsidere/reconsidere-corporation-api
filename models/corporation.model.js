mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionHistory = new Schema({
	checkPoints: {
		wastegenerated: {
			qrCode: [
				{
					date: { type: Date, required: true, immutable: true },
					code: { type: String, required: true, immutable: true },
					description: { type: String, required: true, immutable: true },
					material: {
						type: { type: String, required: true, immutable: true },
						name: { type: String, required: true, immutable: true },
						weight: { type: Number, required: true, immutable: true },
						quantity: { type: Number, required: true, immutable: true },
						active: { type: Boolean, required: true, immutable: true },
						unity: { type: String, required: true, immutable: true }
					}
				}
			]
		},
		collectionrequested: {
			qrCode: [
				{
					date: { type: Date, required: true, immutable: true },
					code: { type: String, required: true, immutable: true },
					description: { type: String, required: true, immutable: true },
					material: {
						type: { type: String, required: true, immutable: true },
						name: { type: String, required: true, immutable: true },
						weight: { type: Number, required: true, immutable: true },
						quantity: { type: Number, required: true, immutable: true },
						active: { type: Boolean, required: true, immutable: true },
						unity: { type: String, required: true, immutable: true }
					}
				}
			]
		},
		collectionperformed: {
			qrCode: [
				{
					date: { type: Date, required: true, immutable: true },
					code: { type: String, required: true, immutable: true },
					description: { type: String, required: true, immutable: true },
					material: {
						type: { type: String, required: true, immutable: true },
						name: { type: String, required: true, immutable: true },
						weight: { type: Number, required: true, immutable: true },
						quantity: { type: Number, required: true, immutable: true },
						active: { type: Boolean, required: true, immutable: true },
						unity: { type: String, required: true, immutable: true }
					}
				}
			]
		},
		arrivedcollector: {
			qrCode: [
				{
					date: { type: Date, required: true, immutable: true },
					code: { type: String, required: true, immutable: true },
					description: { type: String, required: true, immutable: true },
					material: {
						type: { type: String, required: true, immutable: true },
						name: { type: String, required: true, immutable: true },
						weight: { type: Number, required: true, immutable: true },
						quantity: { type: Number, required: true, immutable: true },
						active: { type: Boolean, required: true, immutable: true },
						unity: { type: String, required: true, immutable: true }
					}
				}
			]
		},
		insorting: {
			qrCode: [
				{
					date: { type: Date, required: true, immutable: true },
					code: { type: String, required: true, immutable: true },
					description: { type: String, required: true, immutable: true },
					material: {
						type: { type: String, required: true, immutable: true },
						name: { type: String, required: true, immutable: true },
						weight: { type: Number, required: true, immutable: true },
						quantity: { type: Number, required: true, immutable: true },
						active: { type: Boolean, required: true, immutable: true },
						unity: { type: String, required: true, immutable: true }
					}
				}
			]
		},
		completedestination: {
			qrCode: [
				{
					date: { type: Date, required: true, immutable: true },
					code: { type: String, required: true, immutable: true },
					description: { type: String, required: true, immutable: true },
					material: {
						type: { type: String, required: true, immutable: true },
						name: { type: String, required: true, immutable: true },
						weight: { type: Number, required: true, immutable: true },
						quantity: { type: Number, required: true, immutable: true },
						active: { type: Boolean, required: true, immutable: true },
						unity: { type: String, required: true, immutable: true }
					}
				}
			]
		}
	}
});

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
	checkPoints: {
		wastegenerated: {
			qrCode: [
				{
					code: String,
					material: {
						type: { type: String },
						name: String,
						weight: Number,
						quantity: Number,
						active: Boolean,
						unity: String
					}
				}
			]
		},
		collectionrequested: {
			qrCode: [
				{
					code: String,
					material: {
						type: { type: String },
						name: String,
						weight: Number,
						quantity: Number,
						active: Boolean,
						unity: String
					}
				}
			]
		},
		collectionperformed: {
			qrCode: [
				{
					code: String,
					material: {
						type: { type: String },
						name: String,
						weight: Number,
						quantity: Number,
						active: Boolean,
						unity: String
					}
				}
			]
		},
		arrivedcollector: {
			qrCode: [
				{
					code: String,
					material: {
						type: { type: String },
						name: String,
						weight: Number,
						quantity: Number,
						active: Boolean,
						unity: String
					}
				}
			]
		},
		insorting: {
			qrCode: [
				{
					code: String,
					material: {
						type: { type: String },
						name: String,
						weight: Number,
						quantity: Number,
						active: Boolean,
						unity: String
					}
				}
			]
		},
		completedestination: {
			qrCode: [
				{
					code: String,
					material: {
						type: { type: String },
						name: String,
						weight: Number,
						quantity: Number,
						active: Boolean,
						unity: String
					}
				}
			]
		}
	},
	transactionHistory: TransactionHistory,
	residuesRegister: ResiduesRegisterSchema
});

module.exports = mongoose.model('corporation', CorporationSchema);
