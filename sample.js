import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase の設定
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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

// Firestore からデータを取得して表示
async function loadNames() {
  const nameList = document.getElementById("nameList");
  nameList.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "players"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.textContent = data.name + " ";

    // 削除ボタン
    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", async () => {
      if (confirm(`${data.name} を削除しますか？`)) {
        await deleteDoc(doc(db, "players", docSnap.id));
        loadNames();
      }
    });

    li.appendChild(delBtn);
    nameList.appendChild(li);
  });
}

// ページ読み込み時にデータ表示
loadNames();