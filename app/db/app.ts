// import { OrdinaryPerson } from "../core/person/Person";
// import { MyDataBase } from "./core";

import { DocumentData, DocumentReference } from 'firebase/firestore'
import { addPersonIntoFireStore } from './firebase'

// const db = new MyDataBase();

// const perosns = [
// db.addPerson(new OrdinaryPerson('Alex Ganz' , 0)),
// db.addPerson(new OrdinaryPerson('Alex Von Stierlitz' , 0)),
// db.addPerson(new OrdinaryPerson('Meine Kleine Pumpkin' , 0)),
// db.addPerson(new OrdinaryPerson('Gleb Lenin' , 0)),
// db.addPerson(new OrdinaryPerson('Kotok Kotok', 0)),
// ]

// console.log({ perosns });

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
