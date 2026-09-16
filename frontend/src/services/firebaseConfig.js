import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBDiowZzgB9k0v_bsUH6HIKiVWpxlcenqk",
    authDomain: "ecotrack-cbd8f.firebaseapp.com",
    projectId: "ecotrack-cbd8f",
    storageBucket: "ecotrack-cbd8f.firebasestorage.app",
    messagingSenderId: "921863372394",
    appId: "1:921863372394:web:01345da3c3945cac189413",
    measurementId: "G-D9HF8YQPGJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth, app };