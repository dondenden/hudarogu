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
const schoolNameInput = document.getElementById("schoolName");
const passwordInput = document.getElementById("schoolPassword");
const passwordLabel = document.getElementById("passwordLabel");

// 🔹 学校名が入力されたら存在チェック
schoolNameInput.addEventListener("blur", async () => {
  const schoolName = schoolNameInput.value.trim();
  if (!schoolName) return;

  const snap = await getDocs(collection(db, schoolName));
  if (snap.empty) {
    // 新規学校
    passwordLabel.innerHTML = 'パスワード作成: <input type="password" id="schoolPassword" required>';
  } else {
    // 既存学校
    passwordLabel.innerHTML = 'パスワード入力: <input type="password" id="schoolPassword" required>';
  }
});

// 🔹 フォーム送信処理
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const schoolName = schoolNameInput.value.trim();
  const schoolPassword = document.getElementById("schoolPassword").value.trim();
  if (!schoolName || !schoolPassword) return;

  try {
    const schoolCol = collection(db, schoolName);
    const snap = await getDocs(schoolCol);

    if (snap.empty) {
      // 新規登録
      await addDoc(schoolCol, {
        password: schoolPassword,
        createdAt: serverTimestamp(),
      });
      alert(`学校「${schoolName}」を新規登録しました！`);
    } else {
      // パスワードチェック
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
    passwordLabel.innerHTML = 'パスワード: <input type="password" id="schoolPassword" required>';
  } catch (error) {
    console.error("Error: ", error);
    alert("エラーが発生しました。");
  }
});