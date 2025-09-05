import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
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

// 🔹 URLパラメータから学校名取得
const params = new URLSearchParams(window.location.search);
const schoolName = params.get("school");
if (!schoolName) {
  alert("学校名が指定されていません。ログインし直してください");
  window.location.href = 'https://dondenden.github.io/hudarogu/src/index.html';
}

// 🔹 HTML参照
const form = document.getElementById("nameForm");
const list = document.getElementById("nameList");
const backButton = document.getElementById("backButton");

// 🔹 名前一覧表示（passwordDocを除外）
async function loadNames() {
  list.innerHTML = "";
  const snap = await getDocs(collection(db, schoolName));

  if (snap.empty) {
    const li = document.createElement("li");
    li.textContent = "まだ名前は登録されていません";
    list.appendChild(li);
    return;
  }

  snap.forEach(docSnap => {
    const docId = docSnap.id;

    // 🔹 パスワード用ドキュメントは表示しない
    if (docId === "passwordDoc") return;

    const li = document.createElement("li");
    li.textContent = docId;

    list.appendChild(li);
  });
}

// 🔹 名前登録フォーム
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("name");
  const name = nameInput.value.trim();
  if (!name) return;

  // Firestoreに使えない文字のチェック
  const invalidChars = /[\/#?\[\]]/;
  if (invalidChars.test(name)) {
    alert("名前に使えない文字が含まれています。\n使用できない文字: / # ? [ ]");
    return;
  }

  try {
    await setDoc(doc(db, schoolName, name), {
      createdAt: serverTimestamp()
    });
    nameInput.value = "";
    await loadNames();
  } catch (error) {
    console.error("Error setting document: ", error);
    alert("名前の登録中にエラーが発生しました。");
  }
});

// 🔹 戻るボタン処理
backButton.addEventListener("click", () => {
  window.location.href = 'https://dondenden.github.io/hudarogu/src/index.html';
});

// 🔹 初回表示
loadNames();