// Import the functions you need from the SDKs you need
import { initializeApp ,getApp, getApps} from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase

// const analytics = getAnalytics(app);



// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_OhSf8txLN8UbGBfMyRimP6z6aB0Cjp4",
  authDomain: "prepwise-e4c01.firebaseapp.com",
  projectId: "prepwise-e4c01",
  storageBucket: "prepwise-e4c01.firebasestorage.app",
  messagingSenderId: "88867744433",
  appId: "1:88867744433:web:9704eb33cfa6216bb75090",
  measurementId: "G-XEMP74HYTF"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

