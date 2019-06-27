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
			qrCode: [
				{
					code: String,
					material: {
						type: String,
						name: String,
						weight: Number,
						quantity: Number,
						active: Boolean
					}
				}
			]
		}
	],
	checkPoints: [
		{
			wastegenerated: [
				{
					qrCode: [
						{
							code: String,
							material: {
								type: String,
								name: String,
								weight: Number,
								quantity: Number,
								active: Boolean
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
							material: {
								type: String,
								name: String,
								weight: Number,
								quantity: Number,
								active: Boolean
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
							material: {
								type: String,
								name: String,
								weight: Number,
								quantity: Number,
								active: Boolean
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
							material: {
								type: String,
								name: String,
								weight: Number,
								quantity: Number,
								active: Boolean
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
							material: {
								type: String,
								name: String,
								weight: Number,
								quantity: Number,
								active: Boolean
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
							material: {
								type: String,
								name: String,
								weight: Number,
								quantity: Number,
								active: Boolean
							}
						}
					]
				}
			]
		}
	]
});

module.exports = mongoose.model('corporation', CorporationSchema);
