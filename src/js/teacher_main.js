import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

// 🔹 生徒一覧表示（passwordDocを除外）
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
    if (docId === "passwordDoc") return;
    const li = document.createElement("li");
    li.textContent = docId;
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
    // Firestore に保存（パスワードは扱わない旧仕様）
    await setDoc(doc(db, schoolName, studentName), {
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