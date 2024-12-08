'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.PlayerPersonFactory = exports.PersonFactory = void 0
const Person_1 = require('../person/Person')
const AbstractFactory_1 = require('./AbstractFactory')
class PersonFactory extends AbstractFactory_1.Factory {
    constructor() {
        super()
    }
}
exports.PersonFactory = PersonFactory
class PlayerPersonFactory extends PersonFactory {
    create(name, walletInitValue) {
        return new Person_1.OrdinaryPerson(name, walletInitValue)
    }
}
exports.PlayerPersonFactory = PlayerPersonFactory
