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

// Firebase 設定
const firebaseConfig = {}; // 省略

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// URLパラメータから学校名取得
const params = new URLSearchParams(window.location.search);
const schoolName = params.get("school");
if (!schoolName) throw new Error("学校名が未指定です");

// HTML参照
const form = document.getElementById("nameForm");
const list = document.getElementById("nameList");
const deleteForm = document.getElementById("deleteForm");
const backButton = document.getElementById("backButton"); // ← ここが必要

// 名前一覧表示
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

// 名前登録フォーム
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("name");
  const name = nameInput.value.trim();
  if (!name) return;

  await addDoc(collection(db, schoolName), {
    name: name,
    type: "name",
    createdAt: serverTimestamp()
  });
  nameInput.value = "";
  await loadNames();
});

// 学校コレクション削除
async function deleteCollection(targetSchool) {} // 既存のまま

deleteForm.addEventListener("submit", async (e) => {}); // 既存のまま

// 戻るボタン処理
backButton.addEventListener("click", () => {
  window.location.href = 'https://dondenden.github.io/hudarogu/src/index';
});

// 初回表示
loadNames();