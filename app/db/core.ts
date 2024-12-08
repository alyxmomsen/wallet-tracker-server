import { addPersonIntoFireStore, checkRecordExistsByField } from './firebase'

export interface IDataBaseMediator<T> {
    addPerson(username: string, password: string): T
}

export type TDatabaseResultStatus = {
    statusCode: number
    details: string
    status: boolean
    userId: string
}

export class DataBaseMediator
    implements IDataBaseMediator<Promise<TDatabaseResultStatus>>
{
    async addPerson(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus> {
        const result = await checkRecordExistsByField(username, password)

        if (result) {
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

    constructor() {}
}
