import { checkRecordExistsByField } from '../../../db/firebase'
import { IPerson, OrdinaryPerson } from '../person/Person'

export interface IPersonFactory {
    create(username: string, userId: string): IPerson
}

export abstract class PersonFactory implements IPersonFactory {
    create(username: string, userId: string) {
        return new OrdinaryPerson(username, 0, userId)
    }
}

export class UserPersonFactory extends PersonFactory {
    constructor() {
        super()
    }
}
