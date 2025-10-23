// 10211524 完全修正版（studentDC/studentmember に保存）

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase 設定
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

// URLパラメータから学校名を取得
const params = new URLSearchParams(window.location.search);
const schoolName = params.get("school");
if (!schoolName) {
  alert("学校名が指定されていません。ログインし直してください。");
  window.location.href = "index.html";
}

// HTML参照
const form = document.getElementById("nameForm");
const list = document.getElementById("nameList");
const backButton = document.getElementById("backButton");

// 🔹 生徒一覧表示（studentDC/studentmember から）
async function loadNames() {
  list.innerHTML = "";

  try {
    // ✅ 生徒一覧の参照先：東桜学館/DC/studentDC/studentmember
    const studentsColRef = collection(db, schoolName, "DC", "studentDC", "studentmember");
    const studentsSnap = await getDocs(studentsColRef);

    if (studentsSnap.empty) {
      const li = document.createElement("li");
      li.textContent = "まだ生徒は登録されていません。";
      list.appendChild(li);
      return;
    }

    studentsSnap.forEach(docSnap => {
      const li = document.createElement("li");
      li.textContent = docSnap.id;
      list.appendChild(li);
    });

  } catch (error) {
    console.error("読み込みエラー:", error);
    alert("生徒一覧の取得に失敗しました: " + error.message);
  }
}

// 🔹 名前登録フォーム送信処理
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
    // ✅ 保存先：東桜学館/DC/studentDC/studentmember/生徒名
    const studentDocRef = doc(db, schoolName, "DC", "studentDC", "studentmember", studentName);
    await setDoc(studentDocRef, {
      createdAt: serverTimestamp()
    });

    document.getElementById("name").value = "";
    await loadNames();
    alert(`生徒「${studentName}」を登録しました！`);

  } catch (error) {
    console.error("登録エラー:", error);
    alert("登録に失敗しました: " + error.message);
  }
});

// 🔹 戻るボタン
backButton.addEventListener("click", () => {
  window.location.href = "index.html";
});

// 🔹 初回ロード
loadNames();