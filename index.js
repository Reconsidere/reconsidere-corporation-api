mongoose = require('mongoose');
graphlHTTP = require('express-graphql');
const express = require('express');
const { importSchema } = require('graphql-import');
const bodyParser = require('body-parser');
const cors = require('cors');

const resolverCorporation = require('./resolvers/indexCorporation');
const resolverLogin = require('./resolvers/indexLogin');
const resolverCheckPoint = require('./resolvers/indexCheckPoint');
const resolverTransactionHistory = require('./resolvers/indexTransactionHistory');
const { makeExecutableSchema } = require('graphql-tools');
const schemaPathCorporation = './schemas/indexCorporation.graphql';
const schemaPathCheckPoint = './schemas/indexCheckPoint.graphql';

const schema = makeExecutableSchema({
	typeDefs: importSchema(schemaPathCorporation),
	resolvers: [ resolverCorporation, resolverLogin ]
});

const schemaCheckPoint = makeExecutableSchema({
	typeDefs: importSchema(schemaPathCheckPoint),
	resolvers: resolverCheckPoint
});
const app = express();
const PORT = 32546;
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/eowyn-reconsidere-corporation');

app.get('/', (req, res) => {
	res.json({
		msg: 'Welcome to GraphQL'
	});
});
app.use(
	[ '/corporation', '/login', '/checkpoint', '/transactionhistory' ],
	bodyParser.text({ type: 'application/graphql' }),
	bodyParser.json(),
	cors(),
	graphlHTTP({
		schema: [ schema , schemaCheckPoint],
		graphiql: true
	})
);

app.listen(PORT, () => {
	console.log(`Server is listening on PORT ${PORT}`);
});
