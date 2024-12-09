import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import {
    addPersonIntoFireStore,
    checkRecordExistsByField,
    getAllFireStoreDocs,
} from './firebase'

export interface IDataBaseMediator {
    addPerson(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus>
    getPersons(): Promise<QueryDocumentSnapshot<DocumentData, DocumentData>[]>
}

export type TDatabaseResultStatus = {
    statusCode: number
    details: string
    status: boolean
    userId: string
}

export class DataBaseMediator implements IDataBaseMediator {
    async addPerson(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus> {
        const result = await checkRecordExistsByField(username, password)

        if (result.length) {
            return {
                statusCode: 400,
                details: 'user already exists',
                status: false,
                userId: '',
            }
        }

        const docRef = await addPersonIntoFireStore(username, password)

        const { id } = docRef

        return {
            statusCode: 200,
            details: 'user created',
            status: true,
            userId: id,
        }
    }

    async getPersons() {
        return await getAllFireStoreDocs('persons')
    }

    constructor() {}
}
