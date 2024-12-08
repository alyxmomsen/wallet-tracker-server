'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.MyDataBase = void 0
class MyDataBase {
    addPerson(person) {
        let maxIdValue = 0
        const mapiterator = this.persons.keys()
        for (const key of mapiterator) {
            if (maxIdValue < key) {
                maxIdValue = key
            }
        }
        const newId = maxIdValue + 1
        this.persons.set(newId, person)
        // console.log(newId);
        return newId
    }
    addUsername(userId, name) {
        this.userNames.set(userId, name)
    }
    addUserPassword(userId, password) {
        this.userPasswords.set(userId, password)
    }
    constructor() {
        this.persons = new Map()
        this.userNames = new Map()
        this.userPasswords = new Map()
    }
}
exports.MyDataBase = MyDataBase
