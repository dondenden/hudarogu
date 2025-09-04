import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
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

// 🔹 名前一覧表示
async function loadNames() {
  list.innerHTML = "";
  const snap = await getDocs(collection(db, schoolName));
  const nameDocs = snap.docs.filter(docSnap => docSnap.data().type === "name");

  if (nameDocs.length === 0) {
    const li = document.createElement("li");
    li.textContent = "まだ名前は登録されていません";
    list.appendChild(li);
    return;
  }

  nameDocs.forEach(docSnap => {
    const data = docSnap.data();
    const name = data.name || "（名前不明）";

    const li = document.createElement("li");
    li.textContent = `${name} `;

    // 🔹 名前削除ボタン
    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", async () => {
      if (confirm(`${name} を削除しますか？`)) {
        await deleteDoc(doc(db, schoolName, docSnap.id));
        await loadNames();
      }
    });

    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// 🔹 名前登録フォーム
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("name");
  const name = nameInput.value.trim();
  if (!name) return;
  
  const invalidChars = /[\/#?\[\]]/;
  if (invalidChars.test(name)) {
    alert("名前に使えない文字が含まれています。\n使用できない文字: / # ? [ ]");
    return; // 登録中止
  }

  try {
    await addDoc(collection(db, schoolName), {
      name: name,
      type: "name",
      createdAt: serverTimestamp()
    });
    nameInput.value = "";
    await loadNames();
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("名前の登録中にエラーが発生しました。");
  }
});

// 🔹 戻るボタン処理
backButton.addEventListener("click", () => {
  window.location.href = 'https://dondenden.github.io/hudarogu/src/index.html';
});

// 🔹 初回表示
loadNames();