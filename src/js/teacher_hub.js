//10211558
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
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

// HTML参照
const form = document.getElementById("schoolForm");
const schoolNameInput = document.getElementById("schoolName");
const passwordWrapper = document.getElementById("passwordWrapper");
const passwordLabel = document.getElementById("passwordLabel");
const backButton = document.getElementById("backButton");

// 学校名入力後にパスワード欄表示
schoolNameInput.addEventListener("blur", async () => {
  const schoolName = schoolNameInput.value.trim();
  if (!schoolName) return;

  const passwordDocRef = doc(db, "schoolList", schoolName);
  const passwordSnap = await getDoc(passwordDocRef);

  // パスワード欄を表示
  passwordWrapper.style.display = "block";

  if (!passwordSnap.exists()) {
    // 新規登録用
    passwordLabel.innerHTML = `
      パスワード作成:
      <input type="password" id="schoolPassword" required>
      <button type="button" id="togglePassword">👁️</button>
    `;
  } else {
    // 既存学校用
    passwordLabel.innerHTML = `
      パスワード入力:
      <input type="password" id="schoolPassword" required>
      <button type="button" id="togglePassword">👁️</button>
    `;
  }

  // パスワード表示/非表示切替
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
    // 🔹 Firestore参照
    const schoolListDocRef = doc(db, "schoolList", schoolName);
    const passwordSnap = await getDoc(schoolListDocRef);

    if (!passwordSnap.exists()) {
      // 🔸 新規登録
      const data = {
        password: schoolPassword,        // パスワードも保存！
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(schoolListDocRef, data);

      // 🔸 学校独自のサブコレクションも作成（例：schoolList/学校名/students）
      const passwordDocRef = doc(db, "schoolList", schoolName, "meta", "passwordDoc");
      await setDoc(passwordDocRef, data);

      alert(`学校「${schoolName}」を新規登録しました！`);
    } else {
      // 🔸 既存ログイン（パスワード照合）
      const data = passwordSnap.data();
      if (data.password !== schoolPassword) {
        alert("パスワードが間違っています。");
        return;
      }

      // ログイン成功 → 更新時刻を更新
      await setDoc(
        schoolListDocRef,
        { updatedAt: serverTimestamp() },
        { merge: true }
      );
    }

    // 🔸 成功時に teacher_main.html に遷移
    window.location.href = `https://dondenden.github.io/hudarogu/teacher_main.html?school=${encodeURIComponent(schoolName)}`;
  } catch (error) {
    console.error("Error: ", error);
    alert("エラーが発生しました: " + error.message);
  }
});

// 戻るボタン処理
backButton.addEventListener("click", () => {
  window.location.href = 'https://dondenden.github.io/hudarogu/index.html';
});