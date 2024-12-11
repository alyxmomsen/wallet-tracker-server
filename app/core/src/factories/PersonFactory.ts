import { IDataBaseConnector } from '../../../db/app'
import { IPerson, OrdinaryPerson } from '../person/Person'

export interface IPersonFactory {
    createAsync(
        username: string,
        password: string,
        objectsPull: IPerson[],
        dBConnector: IDataBaseConnector
    ): Promise<IPerson | null>
    // create(username:string , password);
}

export abstract class PersonFactory implements IPersonFactory {
    async createAsync(
        username: string,
        password: string,
        objectsPull: IPerson[],
        dBConnector: IDataBaseConnector
    ): Promise<IPerson | null> {
        // middleware

        dBConnector.addPersonAsync(username, password)

        // creating

        const user = new OrdinaryPerson(username, 0, '')

        return null
    }
}

export class UserPersonFactory extends PersonFactory {
    constructor() {
        super()
    }
}
