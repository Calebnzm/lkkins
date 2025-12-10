import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyA80CPRvmL55NJx-scIipz2BT1M1pQn9VE",
authDomain: "lkkins-landing.firebaseapp.com",
projectId: "lkkins-landing",
storageBucket: "lkkins-landing.firebasestorage.app",
messagingSenderId: "817918837790",
appId: "1:817918837790:web:91973a4f906e468a2c5a0f",
measurementId: "G-J3VEJX5CDL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
