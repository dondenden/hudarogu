// Firebase SDK の読み込み
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyAHb1pT_SgqolYZdpOsmQdLK-OMjNVpVYA",
  authDomain: "hudarogu-71a4f.firebaseapp.com",
  projectId: "hudarogu-71a4f",
  storageBucket: "hudarogu-71a4f.appspot.com",
  messagingSenderId: "453627568918",
  appId: "1:453627568918:web:85f634cfa2d0ca358e2637"
};

// 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM要素の取得
const testBtn = document.getElementById("testBtn");
const output = document.getElementById("output");

// Firestore に書き込み
testBtn.addEventListener("click", async () => {
  try {
    await setDoc(doc(db, "testCollection", "testDoc"), {
      message: "接続成功！",
      timestamp: Date.now()
    });
    output.textContent = "✅ Firestore にデータを保存しました！";
  } catch (error) {
    output.textContent = `❌ 書き込みエラー: ${error.message}`;
    console.error("書き込みエラー:", error);
  }
});

// Firestore のリアルタイム監視
onSnapshot(doc(db, "testCollection", "testDoc"), (docSnap) => {
  if (docSnap.exists()) {
    output.textContent = JSON.stringify(docSnap.data(), null, 2);
  } else {
    output.textContent = "ドキュメントが存在しません";
  }
});