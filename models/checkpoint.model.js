mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CheckPointSchema = new Schema({
	wastegenerated: {
		qrCode: [
			{
				code: String,
				date: Date,
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
				date: Date,
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
				date: Date,
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
				date: Date,
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
				date: Date,
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
				date: Date,
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
});


module.exports = mongoose.model('checkpoint', CheckPointSchema);
