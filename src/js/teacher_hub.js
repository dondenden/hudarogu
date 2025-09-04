import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
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

const form = document.getElementById("schoolForm");
const schoolNameInput = document.getElementById("schoolName");
const passwordWrapper = document.getElementById("passwordWrapper");
const passwordLabel = document.getElementById("passwordLabel");

// 学校名入力後にパスワード欄表示
schoolNameInput.addEventListener("blur", async () => {
  const schoolName = schoolNameInput.value.trim();
  if (!schoolName) return;

  const passwordDocRef = doc(db, schoolName, "passwordDoc");
  const passwordSnap = await getDoc(passwordDocRef);

  passwordWrapper.style.display = "block";

  if (!passwordSnap.exists()) {
    passwordLabel.innerHTML = `
      パスワード作成:
      <input type="password" id="schoolPassword" required>
      <button type="button" id="togglePassword">👁️</button>
    `;
  } else {
    passwordLabel.innerHTML = `
      パスワード入力:
      <input type="password" id="schoolPassword" required>
      <button type="button" id="togglePassword">👁️</button>
    `;
  }

  // パスワード表示切替
  const toggleBtn = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("schoolPassword");
  toggleBtn.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleBtn.textContent = "🙈";
    } else {
      passwordInput.type = "password";
      toggleBtn.textContent = "👁️";
    }
  });
});

// フォーム送信処理
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const schoolName = schoolNameInput.value.trim();
  const schoolPassword = document.getElementById("schoolPassword")?.value.trim();
  if (!schoolName || !schoolPassword) return;

  try {
    const passwordDocRef = doc(db, schoolName, "passwordDoc");
    const passwordSnap = await getDoc(passwordDocRef);

    if (!passwordSnap.exists()) {
      // 新規登録
      await setDoc(passwordDocRef, {
        password: schoolPassword,
        createdAt: serverTimestamp()
      });
      alert(`学校「${schoolName}」を新規登録しました！`);
    } else {
      // パスワードチェック
      const data = passwordSnap.data();
      if (data.password !== schoolPassword) {
        alert("パスワードが間違っています。");
        return;
      }
    }

    // 成功したら名前登録画面へ遷移
    window.location.href = `https://dondenden.github.io/hudarogu/src/teacher_main.html?school=${encodeURIComponent(schoolName)}`;
  } catch (error) {
    console.error("Error: ", error);
    alert("エラーが発生しました。");
  }
});