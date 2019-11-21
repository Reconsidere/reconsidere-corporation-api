mongoose = require('mongoose');
const Schema = mongoose.Schema;

//a empresa que cria um pedido de residuo gera um id para o checkpoint
//se não existe nenhum com esse _id cria um novo
//se for a empresa que tem o id pode ver tudo que tem na lista

//se for o coletor verificar se ele esta no pedido de cada empresa e carregar as que ele faz parte

const CheckPointSchema = new Schema({
	_idCorporation: String,
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
