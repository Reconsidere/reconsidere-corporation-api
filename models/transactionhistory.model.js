mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionHistorySchema = new Schema({
	checkPoints: {
		wastegenerated: {
			qrCode: [
				{
					date: { type: Date, required: true, immutable: true },
					code: { type: String, required: true, immutable: true },
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

module.exports = mongoose.model('transactionhistory', TransactionHistorySchema);
