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

// URLパラメータから学校名を取得
const params = new URLSearchParams(window.location.search);
const schoolName = params.get("school");
if (!schoolName) {
  alert("学校名が指定されていません。URLに ?school=学校名 を付けてアクセスしてください。");
  throw new Error("学校名が未指定です");
}

// HTML要素参照
const form = document.getElementById("nameForm");
const list = document.getElementById("nameList");

// 🔹 学校ごとの名前一覧を表示
async function loadNames() {
  list.innerHTML = "";
  const snap = await getDocs(collection(db, schoolName));
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.textContent = `${data.name} `;

    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", async () => {
      if (confirm(`${data.name} を削除しますか？`)) {
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
  const name = document.getElementById("name").value.trim();
  if (!name) return;

  try {
    await addDoc(collection(db, schoolName), {
      name: name,
      createdAt: serverTimestamp(),
    });
    form.reset();
    await loadNames();
  } catch (error) {
    console.error("Error adding document: ", error);
  }
});

// 初回表示時に名前一覧読み込み
loadNames();

// 🔹 学校コレクション削除フォーム
const deleteForm = document.getElementById("deleteForm");

async function deleteCollection(targetSchool) {
  const colRef = collection(db, targetSchool);
  const snap = await getDocs(colRef);

  if (snap.empty) {
    alert(`学校「${targetSchool}」は存在しません。`);
    return;
  }

  if (!confirm(`本当に学校「${targetSchool}」を削除しますか？\nこの操作は元に戻せません。`)) return;

  try {
    for (const docSnap of snap.docs) {
      await deleteDoc(doc(db, targetSchool, docSnap.id));
    }
    alert(`学校「${targetSchool}」を削除しました。`);
  } catch (error) {
    console.error("Error deleting collection: ", error);
    alert("削除中にエラーが発生しました。");
  }
}

deleteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const targetSchool = document.getElementById("deleteSchoolName").value.trim();
  if (!targetSchool) return;

  await deleteCollection(targetSchool);
  deleteForm.reset();
});