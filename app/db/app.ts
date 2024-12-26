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
    updateDoc,
} from 'firebase/firestore'
import { TDBUserData, TUserData } from '../web-server/express'
import { IRequirementStatsType } from '../core/src/types/commonTypes'
import { SimpleLogger } from '../utils/SimpleLogger'
import { IUserStats } from '../core/src/person/Person'

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

export type TDatabaseResultStatus<T> = {
    status: boolean
    message: string
    userData: T | null
}

export interface IDataBaseConnector {
    addUserRequirement(
        data: Omit<
            IRequirementStatsType,
            'isExecuted' | 'id' | 'deleted' | 'userId'
        >,
        userId: string
    ): Promise<IRequirementStatsType | null>
    getPersonByFields(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus<Pick<IUserStats, 'id'>>>
    addPersonAsync(
        username: string,
        password: string
    ): Promise<
        TDatabaseResultStatus<
            Omit<IUserStats, 'password' | 'requirements' | 'wallet'>
        >
    >
    getAllPersons(): Promise<Omit<TUserData, 'wallet'>[]>
    getRequiremntsByUserId(userId: string): Promise<IRequirementStatsType[]>
    getPersonById(id: string): Promise<Omit<TUserData, 'wallet'> | null>
    getDataAsync(): Promise<any>
    getPersonWalletByUserId(id: string): Promise<TWalletData[]>
    updateUserData(userSubj: Omit<IUserStats, 'requirements'>): Promise<void>
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
    async updateUserData(
        userSubj: Omit<IUserStats, 'requirements'>
    ): Promise<void> {
        const docRef = doc(db, 'persons', userSubj.id)

        await updateDoc(docRef, {
            name: userSubj.id,
            wallet: userSubj.wallet,
        } as Omit<IUserStats, 'id' | 'requirements'>)
    }

    async updateUserTransactions(data: IRequirementStatsType[]) {}

    async addUserRequirement(
        fields: Omit<
            IRequirementStatsType,
            'isExecuted' | 'id' | 'deleted' | 'userId'
        >,
        userId: string
    ): Promise<IRequirementStatsType | null> {
        console.log('>>> try to add insert the requrement into DB')

        const newRequirementFields = await addUserRequirementIntoFireStore(
            { ...fields, deleted: false },
            userId
        )

        console.log(`>>> result: `, newRequirementFields)

        return newRequirementFields
    }
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
    ): Promise<TDatabaseResultStatus<Pick<IUserStats, 'id'>>> {
        const qwery = query(
            collection(db, 'persons'),
            where('name', '==', username),
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
            IUserStats,
            'id' | 'requirements' | 'wallet'
        >

        const { createdTimeStamp, name } = data

        const userId = snapshots.docs[0].id

        const returnData: TDatabaseResultStatus<Pick<IUserStats, 'id'>> = {
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
    ): Promise<
        TDatabaseResultStatus<
            Omit<IUserStats, 'password' | 'requirements' | 'wallet'>
        >
    > {
        const result = await checkRecordExistsByField(username, password)

        if (result.length) {
            return {
                status: false,
                message: 'user already exists',
                userData: null,
            }
        }

        const docRef = await createPersonInFireStore(username, password)

        const { id } = docRef

        const docSnap = getDoc(docRef)

        const useData = (await docSnap).data() as Omit<
            IUserStats,
            'id' | 'requirements' | 'wallet'
        >

        return {
            status: true,
            message: 'user created',
            userData: {
                id,
                createdTimeStamp: useData.createdTimeStamp,
                name: useData.name,
                updatedTimeStamp: useData.updatedTimeStamp,
            },
        }
    }

    async getAllPersons(): Promise<Omit<TUserData, 'wallet'>[]> {
        return await getAllFireStorePersonDocs('persons')
    }

    async getRequiremntsByUserId(
        userId: string
    ): Promise<IRequirementStatsType[]> {
        return await getUserRequirementsByUserId(userId)
    }

    constructor() {}
}

async function getUserRequirementsByUserId(
    id: string
): Promise<IRequirementStatsType[]> {
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

    const requirements = docsSnapshot.docs.map((elem) => {
        const id = elem.id
        const requirementFields = elem.data() as Omit<
            IRequirementStatsType,
            'id'
        >
        return { ...requirementFields, id }
    })

    return requirements
}

async function getPersonsByIdFireBase(
    id: string
): Promise<Omit<IUserStats, 'wallet' | 'requirements' | 'password'> | null> {
    const docRef = doc(db, 'persons', id)

    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
        return null
    }

    const userId = docSnap.id

    const { name, createdTimeStamp, updatedTimeStamp } = docSnap.data() as Omit<
        TUserData,
        'id' | 'wallet' | 'requirements'
    >

    return {
        name,
        id: userId,
        createdTimeStamp,
        updatedTimeStamp,
    }
}

async function createPersonInFireStore(username: string, password: string) {
    const docRef = await addDoc(collection(db, 'persons'), {
        name: username,
        password,
        createdTimeStamp: Date.now(),
        updatedTimeStamp: Date.now(),
    } as Omit<IUserStats, 'id' | 'requirements' | 'wallet'>)

    return docRef
}

async function addUserRequirementIntoFireStore(
    fields: Omit<IRequirementStatsType, 'id' | 'isExecuted' | 'userId'>,
    userId: string
): Promise<IRequirementStatsType | null> {
    const log = new SimpleLogger(
        'add user into firestore function'
    ).createLogger()

    log('function start')

    log('arguments')

    for (const prop in fields) {
        log(prop)
    }

    const docRef = await addDoc(collection(db, 'requirements'), {
        ...fields,
    })

    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
        return null
    }
    const documentId = docSnap.id
    const requirementFields = docSnap.data() as Omit<
        IRequirementStatsType,
        'id'
    >

    return { ...requirementFields, id: documentId }
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

async function getAllFireStorePersonDocs(
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

    const users: Omit<IUserStats, 'wallet' | 'requirements' | 'password'>[] = []

    querySnapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
            const id = docSnap.id
            const { name, createdTimeStamp, updatedTimeStamp } =
                docSnap.data() as Omit<
                    IUserStats,
                    'id' | 'wallet' | 'requirements' | 'password'
                >

            users.push({
                name,
                id,
                createdTimeStamp,
                updatedTimeStamp,
            })
        }
    })

    return users
}
