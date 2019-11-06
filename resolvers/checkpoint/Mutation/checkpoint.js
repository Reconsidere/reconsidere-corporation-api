CheckPoint = require('../../../models/checkpoint.model');

module.exports = checkpoint = {
	Query: {
		//verificar se não achar o id na criação deve ser do tipo coletor se o id do coletor fizer parte 
		//do check point carregar
		async allCheckPoint(root, { _idCorporation }) {
			return await CheckPoint.findOne({ _idCorporation: _idCorporation });
		}
	},
	Mutation: {
	}
};
