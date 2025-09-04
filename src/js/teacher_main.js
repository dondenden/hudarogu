import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase の設定
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
const form = document.getElementById("nameForm");
const list = document.getElementById("nameList");

// ✅ 名前一覧を表示する関数
async function loadNames() {
  list.innerHTML = "";

  const snap = await getDocs(collection(db, "players"));
  snap.forEach((docSnap) => {
    const data = docSnap.data();

    const li = document.createElement("li");
    li.textContent = `${data.name} `;

    // 削除ボタン
    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", async () => {
      if (confirm(`${data.name} を削除しますか？`)) {
        await deleteDoc(doc(db, "players", docSnap.id));
        await loadNames();
      }
    });

    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// フォーム処理
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  if (!name) return;

  try {
    await addDoc(collection(db, "players"), {
      name: name,
      createdAt: serverTimestamp(),
    });
    form.reset();
    await loadNames(); // ← ここで定義済みの loadNames が呼べる
  } catch (error) {
    console.error("Error adding document: ", error);
  }
});

// ページ初期表示時に一覧を読み込み
loadNames();