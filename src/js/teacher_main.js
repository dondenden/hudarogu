import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase の設定
const firebaseConfig = {
    apiKey: "AIzaSyAHb1pT_SgqolYZdpOsmQdLK-OMjNVpVYA",
    authDomain: "hudarogu-71a4f.firebaseapp.com",
    projectId: "hudarogu-71a4f",
    storageBucket: "hudarogu-71a4f.firebasestorage.app",
    messagingSenderId: "453627568918",
    appId: "1:453627568918:web:85f634cfa2d0ca358e2637",
    measurementId: "G-EVDBZ70E5C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// フォーム処理
const form = document.getElementById("nameForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;

  try {
    await addDoc(collection(db, "players"), {
      name: name,
      createdAt: new Date()
    });
    form.reset();
    loadNames();
  } catch (error) {
    console.error("Error adding document: ", error);
  }
});