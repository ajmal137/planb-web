// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA_-lmc34O1D3swKTEgiXMkS8dBSOT95bU",
    authDomain: "accounts-78ab0.firebaseapp.com",
    projectId: "accounts-78ab0",
    storageBucket: "accounts-78ab0.appspot.com",
    messagingSenderId: "85589847991",
    appId: "1:85589847991:web:9dc50b2e43f7d133b28232",
    measurementId: "G-P1T8PF1T4Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);