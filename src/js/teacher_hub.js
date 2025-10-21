import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔹 Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyAHb1pT_SgqolYZdpOsmQdLK-OMjNVpVYA",
  authDomain: "hudarogu-71a4f.firebaseapp.com",
  projectId: "hudarogu-71a4f",
  storageBucket: "hudarogu-71a4f.appspot.com",
  messagingSenderId: "453627568918",
  appId: "1:453627568918:web:85f634cfa2d0ca358e2637",
  measurementId: "G-EVDBZ70E5C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// URLパラメータから学校名取得
const params = new URLSearchParams(window.location.search);
const schoolName = params.get("school");
if (!schoolName) {
  alert("学校名が指定されていません。ログインし直してください");
  window.location.href = 'index.html';
}

// HTML参照
const form = document.getElementById("nameForm");
const list = document.getElementById("nameList");
const backButton = document.getElementById("backButton");

// 🔹 生徒一覧表示
async function loadNames() {
  list.innerHTML = "";

  // ✅ HUB構造対応：「schoolList」を削除し、学校名コレクション直下の students サブコレクションを参照
  const studentsColRef = collection(db, schoolName, "students");
  const studentsSnap = await getDocs(studentsColRef);

  if (studentsSnap.empty) {
    const li = document.createElement("li");
    li.textContent = "まだ名前は登録されていません";
    list.appendChild(li);
    return;
  }

  // 生徒名をリスト表示
  studentsSnap.forEach(docSnap => {
    const li = document.createElement("li");
    li.textContent = docSnap.id;
    list.appendChild(li);
  });
}

// 🔹 名前登録フォーム
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const studentName = document.getElementById("name").value.trim();
  if (!studentName) return;

  const invalidChars = /[\/#?\[\]]/;
  if (invalidChars.test(studentName)) {
    alert("名前に使えない文字が含まれています。\n使用できない文字: / # ? [ ]");
    return;
  }

  try {
    // ✅ HUB構造対応：「schoolList」を削除
    const studentDocRef = doc(db, schoolName, "students", studentName);
    await setDoc(studentDocRef, {
      createdAt: serverTimestamp()
    });

    document.getElementById("name").value = "";
    await loadNames();

  } catch (error) {
    console.error("登録エラー:", error);
    alert("登録に失敗しました: " + error.message);
  }
});

// 戻るボタン
backButton.addEventListener("click", () => {
  window.location.href = 'index.html';
});

// 初回表示
loadNames();