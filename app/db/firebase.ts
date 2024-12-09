// Import the functions you need from the SDKs you need
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
} from 'firebase/firestore'
import { snapshot } from 'node:test'

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

export async function addPersonIntoFireStore(
    username: string,
    password: string
) {
    const docRef = await addDoc(collection(db, 'persons'), {
        username,
        password,
        unixDate: Date.now(),
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

export async function checkRecordExistsByField(
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

export async function getAllFireStoreDocs(collectionName: string) {
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

// Пример использования
// checkRecordExistsByField("name", "John Doe");

// Пример использования
// checkRecordExists("yourRecordId");

// Пример использования
// checkRecordExists("yourRecordId");
