const { makeExecutableSchema } = require('graphql-tools');
resolvers = require('../resolvers/resolvers');
const typeDefs = `
scalar Date
scalar Number

type Location {
    country: String
    state: String
    latitude: Number
    longitude: Number
    cep: String
    publicPlace: String
    neighborhood: String
    number: Number
    county: String
    complement: String
}

type Units {
        name: String
        location:[Location]
    }

    type Profile {
        name: String
        access: [String]
    }

   type Users {
    name: String,
    email: String,
    profile: Profile
    password: String,
    active: Boolean
        }

type Corporation {
  _id: ID!
  company: String
  cnpj: String
  tradingName: String
  active: Boolean
  class: String
  phone: Number
  email: String
  classification: String
  cellPhone: Number
  creationDate: Date
  activationDate: Date
  verificationDate: Date
  location:[Location]
  units:[Units]
  users:[Users]
 }
type Query {
  getCorporation(_id: ID!): Corporation
  allCorporations: [Corporation]
 }

 #corporation

 input CorporationInput {
    company: String
    cnpj: String
    tradingName: String
    active: Boolean
    class: String
    phone: Number
    email: String
    classification: String
    cellPhone: Number
    creationDate: Date
    activationDate: Date
    verificationDate: Date
    location:[Location]
    units:[Units]
    users:[Users]
   }


  type Mutation {
    #corporation
    createCorporation(input: CorporationInput) : Corporation
    updateCorporation(_id: ID!, input: CorporationInput): Corporation   
    deleteCorporation(_id: ID!) : Corporation
}
`;
const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});
module.exports = schema;