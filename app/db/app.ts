/* firebase start */

import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    doc,
    setDoc,
    addDoc,
    collection,
    getDoc,
    where,
    limit,
    query,
    getDocs,
    DocumentData,
    QuerySnapshot,
    QueryDocumentSnapshot,
    DocumentReference,
} from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyBacWS3A2ChSu2Cw5KOHvOqw86dQUoXZwU',
    authDomain: 'wallet-flow-app.firebaseapp.com',
    projectId: 'wallet-flow-app',
    storageBucket: 'wallet-flow-app.firebasestorage.app',
    messagingSenderId: '253726601298',
    appId: '1:253726601298:web:d36a403d9dc859accb6f8b',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

/* firebase end */

/* data base connector */

export type TDatabaseResultStatus = {
    status: boolean
    message: string
    userData: {
        id: string
    } | null
}

export interface IDataBaseConnector {
    getPersonByFields(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus>
    addPersonAsync(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus>
    getPersons(): Promise<QueryDocumentSnapshot<DocumentData, DocumentData>[]>
    getRequiremntsByUserId(userId: string): Promise<TRequrementsDataBaseType[]>
    getPersonById(id: string): Promise<DocumentData | null>
}

export type TDataBaseUser = {
    createdUnixDate: number
    password: string
    username: string
    userId: string
}

export type TRequrementsDataBaseType = {
    dateToExecute: number
    description: string
    title: string
    userId: string
    value: number
    cashFlowDirectionCode: number
}

export class FirebaseConnector implements IDataBaseConnector {
    async getPersonById(id: string): Promise<DocumentData | null> {
        return await getPersonsByIdFireBase(id)
    }

    async getPersonByFields(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus> {
        const qwery = query(
            collection(db, 'persons'),
            where('username', '==', username),
            where('password', '==', password)
        )

        const snapshots = await getDocs(qwery)

        if (snapshots.empty) {
            return {
                message: 'no users like this',
                status: false,
                userData: null,
            }
        }

        if (snapshots.size > 1) {
            return {
                message: 'too match , internal error',
                status: false,
                userData: null,
            }
        }

        const data = (await snapshots.docs[0].data()) as Omit<
            TDataBaseUser,
            'userId'
        >

        const { createdUnixDate, password: pass, username: name } = data

        const userId = snapshots.docs[0].id

        const returnData: TDatabaseResultStatus = {
            message: 'iser is founded',
            status: true,
            userData: {
                id: userId,
            },
        }

        return returnData
    }

    async checkRecordExistsByField(username: string, password: string) {
        const result = await checkRecordExistsByField(username, password)
        return result.length > 0
    }

    async addPersonAsync(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus> {
        const result = await checkRecordExistsByField(username, password)

        if (result.length) {
            return {
                status: false,
                message: 'user already exists',
                userData: null,
            }
        }

        const docRef = await addPersonIntoFireStore(username, password)

        const { id } = docRef

        return {
            status: true,
            message: 'user created',
            userData: {
                id,
            },
        }
    }

    async getPersons() {
        return await getAllFireStoreDocs('persons')
    }

    async getRequiremntsByUserId(
        userId: string
    ): Promise<TRequrementsDataBaseType[]> {
        return await getUserRequirementsByUserId(userId)
    }

    constructor() {}
}

async function getUserRequirementsByUserId(
    id: string
): Promise<TRequrementsDataBaseType[]> {
    const userIdFildName = 'userId'

    const qwery = query(
        collection(db, 'requirements'),
        where(userIdFildName, '==', id)
        // where('password', '==', password),
        // limit(1)
    )

    const docsSnapshot = await getDocs(qwery)

    if (docsSnapshot.empty) {
        return []
    }

    const requirements = docsSnapshot.docs.map(
        (elem) => elem.data() as TRequrementsDataBaseType
    )

    return requirements
}

async function getPersonsByIdFireBase(
    id: string
): Promise<DocumentData | null> {
    // 'jW7vjyole5yNxtis70BH'

    const docRef = doc(db, 'persons', id)

    const docSnap = await getDoc(docRef)

    const data = docSnap.data()

    console.log({ data })

    return data || null
}

async function addPersonIntoFireStore(username: string, password: string) {
    const docRef = await addDoc(collection(db, 'persons'), {
        username,
        password,
        createdUnixDate: Date.now(),
    })
    console.log('end the function')

    return docRef
}

async function checkRecordExists(recordId: string) {
    const docRef = doc(db, 'yourCollection', recordId) // Замените "yourCollection" на имя вашей коллекции
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        console.log('Запись существует!')
        // Здесь вы можете получить данные из записи, если нужно
        const data = docSnap.data()
    } else {
        console.log('Запись не существует.')
    }
}

async function checkRecordExistsByField(
    username: string,
    password: string
): Promise<QueryDocumentSnapshot<DocumentData, DocumentData>[]> {
    const qwery = query(
        collection(db, 'persons'),
        where('username', '==', username),
        where('password', '==', password),
        limit(1)
    )

    const querySnapshot = await getDocs(qwery)

    if (querySnapshot.empty) {
        console.log('Запись не существует.')
        return []
    } else {
        console.log('Запись существует!')
        // Здесь вы можете получить данные из записи, если нужно
        const docs = querySnapshot.docs
        // querySnapshot.
        // docs.forEach(e => e.)
        return docs
    }
}

async function getAllFireStoreDocs(collectionName: string) {
    const qwery = query(
        collection(db, 'persons')
        // where('username', '==', username),
        // where('password', '==', password),
        // limit(1)
    )

    const querySnapshot = await getDocs(qwery)

    if (!querySnapshot.empty) {
        console.log(querySnapshot.docs.length)
    }
    return querySnapshot.docs
}
