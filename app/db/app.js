'use strict'
// import { OrdinaryPerson } from "../core/person/Person";
// import { MyDataBase } from "./core";
Object.defineProperty(exports, '__esModule', { value: true })
exports.FireBaseAddPersonBehavior =
    exports.IAddPersonBehavior =
    exports.DataBaseDriver =
        void 0
const firebase_1 = require('./firebase')
// const db = new MyDataBase();
// const perosns = [
// db.addPerson(new OrdinaryPerson('Alex Ganz' , 0)),
// db.addPerson(new OrdinaryPerson('Alex Von Stierlitz' , 0)),
// db.addPerson(new OrdinaryPerson('Meine Kleine Pumpkin' , 0)),
// db.addPerson(new OrdinaryPerson('Gleb Lenin' , 0)),
// db.addPerson(new OrdinaryPerson('Kotok Kotok', 0)),
// ]
// console.log({ perosns });
class DataBaseDriver {
    async addPerson(username, password) {
        return await this.addPersonBehavior.execute(username, password)
    }
    constructor() {
        this.addPersonBehavior = new FireBaseAddPersonBehavior()
    }
}
exports.DataBaseDriver = DataBaseDriver
class IAddPersonBehavior {
    constructor() {}
}
exports.IAddPersonBehavior = IAddPersonBehavior
class FireBaseAddPersonBehavior extends IAddPersonBehavior {
    async execute(username, password) {
        const docRef = await (0, firebase_1.addPerson)(username, password)
        return docRef
    }
}
exports.FireBaseAddPersonBehavior = FireBaseAddPersonBehavior
