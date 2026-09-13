const firebaseConfig = {
  apiKey: "AIzaSyAo1HHj5YnoA4zFQmXaYLKxbQQOxA7vcFo",
  authDomain: "udaanfin-ai.firebaseapp.com",
  projectId: "udaanfin-ai",
  storageBucket: "udaanfin-ai.firebasestorage.app",
  messagingSenderId: "1042865685468",
  appId: "1:1042865685468:web:380966fbe598092e76c519"
  measurementId: "G-7PPPL7TJ44"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();