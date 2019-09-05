mongoose = require('mongoose');
graphlHTTP = require('express-graphql');
const express = require('express');
const { importSchema } = require('graphql-import');
const bodyParser = require('body-parser');
const cors = require('cors');
const { graphqlUploadExpress } = require('graphql-upload');

const { makeExecutableSchema } = require('graphql-tools');
const resolverCollector = require('./resolvers/indexCollector');
const resolverPicture = require('./resolvers/indexPicture');
const resolverCorporation = require('./resolvers/indexCorporation');
const resolverProvider = require('./resolvers/indexProvider');
const resolverLogin = require('./resolvers/indexLogin');
const resolverCheckPoint = require('./resolvers/indexCheckPoint');
const resolverTransactionHistory = require('./resolvers/indexTransactionHistory');
const schemaPathCollector = './schemas/indexCollector.graphql';
const schemaPathPicture = './schemas/indexPicture.graphql';
const schemaPathCorporation = './schemas/indexCorporation.graphql';
const schemaPathProvider = './schemas/indexProvider.graphql';
const schemaPathCheckPoint = './schemas/indexCheckPoint.graphql';
const schemaPathTransactionHistory = './schemas/indexTransactionHistory.graphql';
const schemaPathLogin = './schemas/indexLogin.graphql';

const schemaLogin = makeExecutableSchema({
	typeDefs: importSchema(schemaPathLogin),
	resolvers: resolverLogin
});

const schemaCollector = makeExecutableSchema({
	typeDefs: importSchema(schemaPathCollector),
	resolvers: resolverCollector
});

const schemaCorporation = makeExecutableSchema({
	typeDefs: importSchema(schemaPathCorporation),
	resolvers: resolverCorporation
});

const schemaProvider = makeExecutableSchema({
	typeDefs: importSchema(schemaPathProvider),
	resolvers: resolverProvider
});

const schemaCheckPoint = makeExecutableSchema({
	typeDefs: importSchema(schemaPathCheckPoint),
	resolvers: resolverCheckPoint
});

const schemaTransactionHistory = makeExecutableSchema({
	typeDefs: importSchema(schemaPathTransactionHistory),
	resolvers: resolverTransactionHistory
});

const schemaPicture = makeExecutableSchema({
	typeDefs: importSchema(schemaPathPicture),
	resolvers: resolverPicture
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

app.use(express.static('/reconsidere-corp/images'));

var jsonParser = bodyParser.json({ limit: '10mb', type: 'application/json' });
var urlencodedParser = bodyParser.urlencoded({
	extended: true,
	limit: '10mb',
	type: 'application/x-www-form-urlencoding'
});

app.use(
	'/reconsidere/images',
	jsonParser,
	urlencodedParser,
	cors(),
	graphlHTTP({
		schema: schemaPicture,
		graphiql: true
	})
);

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
	'/provider',
	bodyParser.text({ type: 'application/graphql' }),
	bodyParser.json(),
	cors(),
	graphlHTTP({
		schema: schemaProvider,
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
