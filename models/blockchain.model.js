mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blockchain = new Schema({
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
	}
});
