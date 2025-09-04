import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
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
    // 🔍 学校名で検索
    const q = query(collection(db, "schools"), where("schoolName", "==", schoolName));
    const snap = await getDocs(q);

    if (snap.empty) {
      // 学校が存在しなければ新規登録
      await addDoc(collection(db, "schools"), {
        schoolName: schoolName,
        password: schoolPassword,
        createdAt: serverTimestamp(),
      });
      alert(`学校「${schoolName}」を新規登録しました！`);
    } else {
      // 既存 → パスワード確認
      let isValid = false;
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.password === schoolPassword) {
          isValid = true;
        }
      });

      if (isValid) {
        alert(`学校「${schoolName}」にログインしました！`);
        // ✅ この後、遷移や別処理を追加してOK
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