mongoose = require('mongoose');
graphlHTTP = require('express-graphql');
const express = require('express');
const { importSchema } = require('graphql-import')


const resolvers = require('./resolvers');
const { makeExecutableSchema } = require('graphql-tools');
const schemaPath = './schemas/index.graphql';

const schema = makeExecutableSchema({
    typeDefs: importSchema(schemaPath),
    resolvers
});


const app = express();
const PORT = 32546;
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/eowyn-reconsidere-corporation');
app.get('/', (req, res) => {
    res.json({
        msg: 'Welcome to GraphQL'
    })
});
app.use('/corporation', graphlHTTP({
    schema: schema,
    graphiql: true
}));
app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
})