import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import {
    addPersonIntoFireStore,
    checkRecordExistsByField,
    getAllFireStoreDocs,
} from './firebase'

export interface IDataBaseConnector {
    addPersonAsync(
        username: string,
        password: string
    ): Promise<{
        status: boolean
        details: string
        id: string
    }>
    getPersons(): Promise<QueryDocumentSnapshot<DocumentData, DocumentData>[]>
}

export type TDatabaseResultStatus = {
    statusCode: number
    details: string
    // userId: string
}

export class DataBaseConnector implements IDataBaseConnector {
    async addPersonAsync(
        username: string,
        password: string
    ): Promise<{
        status: boolean
        details: string
        id: string
    }> {
        const result = await checkRecordExistsByField(username, password)

        if (result.length) {
            return {
                status: false,
                details: 'user already exists',
                id: '',
            }
        }

        const docRef = await addPersonIntoFireStore(username, password)

        const { id } = docRef

        return {
            status: true,
            details: 'user created',
            id,
        }
    }

    async getPersons() {
        return await getAllFireStoreDocs('persons')
    }

    constructor() {}
}
