mongoose = require('mongoose');
graphlHTTP = require('express-graphql');
const express = require('express');
const { importSchema } = require('graphql-import');
const bodyParser = require('body-parser');
const cors = require('cors');

const resolverCorporation = require('./resolvers/indexCorporation');
const resolverCollector = require('./resolvers/indexCollector');
const resolverLogin = require('./resolvers/indexLogin');
const resolverCheckPoint = require('./resolvers/indexCheckPoint');
const resolverTransactionHistory = require('./resolvers/indexTransactionHistory');
const { makeExecutableSchema } = require('graphql-tools');
const schemaPathCorporation = './schemas/indexCorporation.graphql';
const schemaPathCollector = './schemas/indexCollector.graphql';
const schemaPathCheckPoint = './schemas/indexCheckPoint.graphql';
const schemaPathTransactionHistory = './schemas/indexTransactionHistory.graphql';
const schemaPathLogin = './schemas/indexLogin.graphql';

const schemaLogin = makeExecutableSchema({
	typeDefs: importSchema(schemaPathLogin),
	resolvers: resolverLogin
});

const schemaCorporation = makeExecutableSchema({
	typeDefs: importSchema(schemaPathCorporation),
	resolvers: resolverCorporation
});

const schemaCollector = makeExecutableSchema({
	typeDefs: importSchema(schemaPathCollector),
	resolvers: resolverCollector
});

const schemaCheckPoint = makeExecutableSchema({
	typeDefs: importSchema(schemaPathCheckPoint),
	resolvers: resolverCheckPoint
});

const schemaTransactionHistory = makeExecutableSchema({
	typeDefs: importSchema(schemaPathTransactionHistory),
	resolvers: resolverTransactionHistory
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
	'/login',
	bodyParser.text({ type: 'application/graphql' }),
	bodyParser.json(),
	cors(),
	graphlHTTP({
		schema: schemaLogin,
		graphiql: true
	})
);

app.use(
	'/corporation',
	bodyParser.text({ type: 'application/graphql' }),
	bodyParser.json(),
	cors(),
	graphlHTTP({
		schema: schemaCorporation,
		graphiql: true
	})
);

app.use(
	'/collector',
	bodyParser.text({ type: 'application/graphql' }),
	bodyParser.json(),
	cors(),
	graphlHTTP({
		schema: schemaCollector,
		graphiql: true
	})
);

app.use(
	'/checkpoint',
	bodyParser.text({ type: 'application/graphql' }),
	bodyParser.json(),
	cors(),
	graphlHTTP({
		schema: schemaCheckPoint,
		graphiql: true
	})
);

app.use(
	'/transactionhistory',
	bodyParser.text({ type: 'application/graphql' }),
	bodyParser.json(),
	cors(),
	graphlHTTP({
		schema: schemaTransactionHistory,
		graphiql: true
	})
);

app.listen(PORT, () => {
	console.log(`Server is listening on PORT ${PORT}`);
});

exports.mongoose = mongoose;
