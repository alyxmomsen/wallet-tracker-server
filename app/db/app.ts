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
import { TDBUserData, TUserData } from '../web-server/express'

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
    getAllPersons(): Promise<Omit<TUserData, 'wallet'>[]>
    getRequiremntsByUserId(userId: string): Promise<TRequrementsDataBaseType[]>
    getPersonById(id: string): Promise<Omit<TUserData, 'wallet'> | null>
    getDataAsync(): Promise<any>
    getPersonWalletByUserId(id: string): Promise<TWalletData[]>
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

export type TWalletData = {
    walletId: string
    balance: number
    title: string
    description: string
}

export type TWalletDBData = {
    userId: string
    balance: number
    title: string
    description: string
}

export class FirebaseConnector implements IDataBaseConnector {
    async getPersonWalletByUserId(id: string): Promise<TWalletData[]> {
        const qwery = query(
            collection(db, 'wallets'),
            where('userId', '==', id)
        )

        const docSnapshots = await getDocs(qwery)

        if (docSnapshots.empty) {
            return []
        }

        const walletsPool: TWalletData[] = []

        docSnapshots.forEach((walletDocSnap) => {
            // elem.exists();

            if (walletDocSnap.exists()) {
                const walletId = walletDocSnap.id

                const { userId, balance, description, title } =
                    walletDocSnap.data() as TWalletDBData

                walletsPool.push({
                    balance,
                    walletId,
                    description,
                    title,
                })
            }
        })

        return walletsPool
    }

    getDataAsync(): Promise<any> {
        return Promise.resolve()
    }

    async getPersonById(id: string): Promise<Omit<TUserData, 'wallet'> | null> {
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

    async getAllPersons(): Promise<Omit<TUserData, 'wallet'>[]> {
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
): Promise<Omit<TUserData, 'wallet'> | null> {
    // 'jW7vjyole5yNxtis70BH'

    const docRef = doc(db, 'persons', id)

    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
        return null
    }

    const userId = docSnap.id

    const { username } = docSnap.data() as TDBUserData

    return {
        userName: username,
        id: userId,
    }
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

async function getAllFireStoreDocs(
    collectionName: string
): Promise<Omit<TUserData, 'wallet'>[]> {
    const qwery = query(
        collection(db, 'persons')
        // where('username', '==', username),
        // where('password', '==', password),
        // limit(1)
    )

    const querySnapshot = await getDocs(qwery)

    if (querySnapshot.empty) {
        return []
    }

    const users: Omit<TUserData, 'wallet'>[] = []

    querySnapshot.forEach((elem) => {
        if (elem.exists()) {
            const id = elem.id
            const { username } = elem.data() as TDBUserData

            users.push({
                userName: username,
                id,
            })
        }
    })

    return users
}
