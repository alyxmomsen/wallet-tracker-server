'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.addPerson = addPerson
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
