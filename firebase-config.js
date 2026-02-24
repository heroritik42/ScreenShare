// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyAZGnaB5pyNSRsNT8_H4DcoaLQbSziJRbs",
  authDomain: "screenshare-d854f.firebaseapp.com",
  projectId: "screenshare-d854f",
  storageBucket: "screenshare-d854f.firebasestorage.app",
  messagingSenderId: "346409081959",
  appId: "1:346409081959:web:72adae6ed6340a879e88c2",
  measurementId: "G-P07M2MS57L"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();