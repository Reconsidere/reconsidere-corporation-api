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
			isEnable: Boolean,
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
			isEnable:Boolean
		}
	],
	checkPoints: {
		wastegenerated: [
			{
				qrCode: [
					{
						code: String,
						description: String,
						material: {
							type: String,
							name: String,
							weight: Number,
							quantity: Number,
							active: Boolean,
							unity: String
						}
					}
				]
			}
		],
		collectionrequested: [
			{
				qrCode: [
					{
						code: String,
						description: String,
						material: {
							type: String,
							name: String,
							weight: Number,
							quantity: Number,
							active: Boolean,
							unity: String
						}
					}
				]
			}
		],
		collectionperformed: [
			{
				qrCode: [
					{
						code: String,
						description: String,
						material: {
							type: String,
							name: String,
							weight: Number,
							quantity: Number,
							active: Boolean,
							unity: String
						}
					}
				]
			}
		],

		arrivedcollector: [
			{
				qrCode: [
					{
						code: String,
						description: String,
						material: {
							type: String,
							name: String,
							weight: Number,
							quantity: Number,
							active: Boolean,
							unity: String
						}
					}
				]
			}
		],
		insorting: [
			{
				qrCode: [
					{
						code: String,
						description: String,
						material: {
							type: String,
							name: String,
							weight: Number,
							quantity: Number,
							active: Boolean,
							unity: String
						}
					}
				]
			}
		],
		completedestination: [
			{
				qrCode: [
					{
						code: String,
						description: String,
						material: {
							type: String,
							name: String,
							weight: Number,
							quantity: Number,
							active: Boolean,
							unity: String
						}
					}
				]
			}
		]
	},
	residuesRegister: ResiduesRegisterSchema
});

module.exports = mongoose.model('corporation', CorporationSchema);
