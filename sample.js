// Firebase SDK のインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase の設定（自分の設定を貼り付ける）
const firebaseConfig = {
    apiKey: "AIzaSyAHb1pT_SgqolYZdpOsmQdLK-OMjNVpVYA",
    authDomain: "hudarogu-71a4f.firebaseapp.com",
    projectId: "hudarogu-71a4f",
    storageBucket: "hudarogu-71a4f.firebasestorage.app",
    messagingSenderId: "453627568918",
    appId: "1:453627568918:web:85f634cfa2d0ca358e2637",
    measurementId: "G-EVDBZ70E5C"
};


// Firebase 初期化
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
    alert("名前を保存しました！");
    form.reset();
    loadNames(); // 保存後に一覧を更新
  } catch (error) {
    console.error("Error adding document: ", error);
  }
});

// Firestore からデータを取得して表示
async function loadNames() {
  const nameList = document.getElementById("nameList");
  nameList.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "players"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = data.name;
    nameList.appendChild(li);
  });
}

// ページ読み込み時にデータ表示
loadNames();