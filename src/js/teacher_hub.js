import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ✅ Firebase の設定（teacher_main.js と同じものを反映）
const firebaseConfig = {
  apiKey: "AIzaSyAHb1pT_SgqolYZdpOsmQdLK-OMjNVpVYA",
  authDomain: "hudarogu-71a4f.firebaseapp.com",
  projectId: "hudarogu-71a4f",
  storageBucket: "hudarogu-71a4f.firebasestorage.app",
  messagingSenderId: "453627568918",
  appId: "1:453627568918:web:85f634cfa2d0ca358e2637",
  measurementId: "G-EVDBZ70E5C",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HTML要素参照
const form = document.getElementById("schoolForm");
const list = document.getElementById("recordList");

// 🔹 学校名ごとの記録を表示する関数
async function loadRecords(schoolName) {
  list.innerHTML = "";

  const snap = await getDocs(collection(db, schoolName));
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.textContent = data.name;
    list.appendChild(li);
  });
}

// フォーム処理
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const schoolName = document.getElementById("schoolName").value.trim();
  const studentName = document.getElementById("studentName").value.trim();
  if (!schoolName || !studentName) return;

  try {
    // ✅ 入力された学校名をコレクション名として使用
    await addDoc(collection(db, schoolName), {
      name: studentName,
      createdAt: serverTimestamp(),
    });
    form.reset();
    await loadRecords(schoolName);
  } catch (error) {
    console.error("Error adding document: ", error);
  }
});