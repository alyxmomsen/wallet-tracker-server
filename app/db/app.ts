import { DocumentData, DocumentReference } from 'firebase/firestore'
import { addPersonIntoFireStore } from './firebase'

export class DataBaseDriver {
    addPersonBehavior: IAddPersonBehavior<
        Promise<DocumentReference<DocumentData, DocumentData>>
    >

    async addPerson(username: string, password: string) {
        return await this.addPersonBehavior.execute(username, password)
    }

    constructor() {
        this.addPersonBehavior = new FireBaseAddPersonBehavior()
    }
}

export abstract class IAddPersonBehavior<T> {
    abstract execute(username: string, password: string): T

    constructor() {}
}

export class FireBaseAddPersonBehavior extends IAddPersonBehavior<
    Promise<DocumentReference<DocumentData, DocumentData>>
> {
    async execute(
        username: string,
        password: string
    ): Promise<DocumentReference<DocumentData, DocumentData>> {
        const docRef = await addPersonIntoFireStore(username, password)

        return docRef
    }
}
