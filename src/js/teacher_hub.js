import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ✅ Firebase の設定
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

const form = document.getElementById("schoolForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const schoolName = document.getElementById("schoolName").value.trim();
  const schoolPassword = document.getElementById("schoolPassword").value.trim();
  if (!schoolName || !schoolPassword) return;

  try {
    // 🔍 学校名をコレクション名として使用
    const schoolCol = collection(db, schoolName);

    // 既存パスワード確認（= そのコレクションに "password" ドキュメントがあるか確認）
    const snap = await getDocs(schoolCol);

    if (snap.empty) {
      // 学校コレクションが存在しない → 新規登録
      await addDoc(schoolCol, {
        password: schoolPassword,
        createdAt: serverTimestamp(),
      });
      alert(`学校「${schoolName}」を新規登録しました！`);
    } else {
      // 既存コレクション → パスワード一致確認
      let isValid = false;
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.password === schoolPassword) {
          isValid = true;
        }
      });

      if (isValid) {
        alert(`学校「${schoolName}」にログインしました！`);
      } else {
        alert("パスワードが間違っています。");
      }
    }

    form.reset();
  } catch (error) {
    console.error("Error: ", error);
    alert("エラーが発生しました。");
  }
});