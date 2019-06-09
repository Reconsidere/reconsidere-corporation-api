mongoose = require('mongoose');
graphlHTTP = require('express-graphql');
schema = require('./schemas/schema');
const express = require('express');


// (path = require('path')),
//     (bodyParser = require('body-parser')),
//     (cors = require('cors'));
// var corporations = express.Router();
// const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(cors());

const app = express();
const PORT = 32546;
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/eowyn-reconsidere-corporation');
app.get('/', (req, res) => {
    res.json({
        msg: 'Welcome to GraphQL'
    })
});
app.use('/graphql', graphlHTTP({
    schema: schema,
    graphiql: true
}));
app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
})