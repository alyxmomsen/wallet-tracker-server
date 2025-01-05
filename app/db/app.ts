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
import { IRequirementStatsType, IUserStats, TDatabaseResultStatus, TUserData, TUserStats__1, TWalletData } from '../core/src/types/commonTypes'
import { SimpleLogger } from '../utils/SimpleLogger'


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



export interface IDataBaseConnector {
    addUserRequirement(
        data: Omit<IRequirementStatsType, 'id' | 'deleted' | 'executed'>
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
    getAllPersonsOnly(): Promise<TUserStats__1[]>
    getRequiremntsByUserId(userId: string): Promise<IRequirementStatsType[]>
    getPersonById(id: string): Promise<Omit<TUserData, 'wallet'> | null>
    getDataAsync(): Promise<any>
    getPersonWalletByUserId(id: string): Promise<TWalletData[]>
    updateUserOnly(userSubj: Omit<IUserStats, 'requirements'|'password'>): Promise<void>
    updateRequirements(userId:string ,requriremnts:Omit<IRequirementStatsType , 'userId'>[]):Promise<any>
}

export class FirebaseConnector implements IDataBaseConnector {
    async updateRequirements(userId: string, requriremnts: Omit<IRequirementStatsType, 'userId'>[]): Promise<any> {
        requriremnts.forEach(async (elem) => {

            const docRef = doc(db, 'requirements', elem.id);
            
            const fields: Omit<IRequirementStatsType  ,'userId'> = {
                createdTimeStamp: elem.createdTimeStamp,
                dateToExecute: elem.dateToExecute,
                deleted: elem.deleted,
                description: elem.description,
                executed: elem.executed,
                id: elem.id,
                title: elem.title, 
                transactionTypeCode: elem.transactionTypeCode,
                updatedTimeStamp: Date.now(),
                value:elem.value  ,
            }

            const response = await updateDoc(docRef, {
                ...fields
            });


        });
    }

    async updateUserOnly(
        userSubj: Omit<IUserStats, 'requirements'  |  'password'>
    ): Promise<void> {
        const docRef = doc(db, 'persons', userSubj.id)

        await updateDoc(docRef, {
            name: userSubj.name,
            wallet: userSubj.wallet,
        } as Omit<IUserStats, 'id' | 'requirements'>)
    }

    async updateUserTransactions(data: IRequirementStatsType[]) {}

    async addUserRequirement(
        data: Omit<IRequirementStatsType, 'id' | 'deleted'>
    ): Promise<IRequirementStatsType | null> {
        const log = new SimpleLogger('FIREBASE CONNECTOR').createLogger()

        log('started')

        const newRequirementFields = await addUserRequirementIntoFireStore(
            { ...data, deleted: false },
            data.userId
        )

        if (newRequirementFields === null) {
            log('add user requirent into firestor function ::: FAIL')
            return newRequirementFields
        }

        log('add user requirent into firestor function ::: SUCCESS')
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

                const { balance, description, title } =
                    walletDocSnap.data() as TWalletData

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

    async getAllPersonsOnly(): Promise<Omit<TUserData, 'wallet'>[]> {
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
        'add user into firestore function',
        false
    ).createLogger()

    log('function start')

    log('arguments')

    for (const prop in fields) {
        log(prop)
    }

    const {
        createdTimeStamp,
        dateToExecute,
        deleted,
        description,
        executed,
        title,
        transactionTypeCode,
        updatedTimeStamp,
        value,
    } = fields

    const docRef = await addDoc(collection(db, 'requirements'), {
        createdTimeStamp: Date.now(),
        dateToExecute,
        deleted: false,
        description,
        executed: false,
        title,
        transactionTypeCode,
        updatedTimeStamp: Date.now(),
        value,
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
