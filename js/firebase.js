import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCFc-r8B5LwFNFPaqDFFenW_US_9bqwKXo",
    authDomain: "vickyweb-ca2e3.firebaseapp.com",
    projectId: "vickyweb-ca2e3",
    storageBucket: "vickyweb-ca2e3.firebasestorage.app",
    messagingSenderId: "248658492383",
    appId: "1:248658492383:web:6053727ff8a27afc03e26a",
    measurementId: "G-HZC7T21DYZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);