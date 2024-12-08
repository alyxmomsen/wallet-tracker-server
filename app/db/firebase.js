'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.addPerson = addPerson
exports.checkRecordExistsByField = checkRecordExistsByField
// Import the functions you need from the SDKs you need
const app_1 = require('firebase/app')
const firestore_1 = require('firebase/firestore')
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
const app = (0, app_1.initializeApp)(firebaseConfig)
const db = (0, firestore_1.getFirestore)(app)
async function addPerson(username, password) {
    const docRef = await (0, firestore_1.addDoc)(
        (0, firestore_1.collection)(db, 'persons'),
        {
            username,
            password,
        }
    )
    console.log('end the function', docRef)
    return docRef
}
async function checkRecordExists(recordId) {
    const docRef = (0, firestore_1.doc)(db, 'yourCollection', recordId) // Замените "yourCollection" на имя вашей коллекции
    const docSnap = await (0, firestore_1.getDoc)(docRef)
    if (docSnap.exists()) {
        console.log('Запись существует!')
        // Здесь вы можете получить данные из записи, если нужно
        const data = docSnap.data()
    } else {
        console.log('Запись не существует.')
    }
}
async function checkRecordExistsByField(username, password) {
    const q = (0, firestore_1.query)(
        (0, firestore_1.collection)(db, 'persons'),
        (0, firestore_1.where)('username', '==', username),
        (0, firestore_1.where)('password', '==', password),
        (0, firestore_1.limit)(1)
    )
    const querySnapshot = await (0, firestore_1.getDocs)(q)
    if (querySnapshot.empty) {
        console.log('Запись не существует.')
        return null
    } else {
        console.log('Запись существует!')
        // Здесь вы можете получить данные из записи, если нужно
        const data = querySnapshot.docs[0].data()
        return data
    }
}
// Пример использования
// checkRecordExistsByField("name", "John Doe");
// Пример использования
// checkRecordExists("yourRecordId");
// Пример использования
// checkRecordExists("yourRecordId");
