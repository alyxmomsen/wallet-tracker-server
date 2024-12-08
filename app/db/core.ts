import { IPerson, OrdinaryPerson } from '../core/src/person/Person'

export class MyDataBase {
    protected persons: Map<number, IPerson>
    protected userNames: Map<number, string>
    protected userPasswords: Map<number, string>

    addPerson(person: IPerson) {
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

    addUsername(userId: number, name: string) {
        this.userNames.set(userId, name)
    }

    addUserPassword(userId: number, password: string) {
        this.userPasswords.set(userId, password)
    }

    constructor() {
        this.persons = new Map<number, IPerson>()
        this.userNames = new Map<number, string>()
        this.userPasswords = new Map<number, string>()
    }
}
