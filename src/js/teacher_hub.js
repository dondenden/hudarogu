// ✅ teacher_hub.js（schoolList + schoolDC/info対応版）

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  serverTimestamp,
  collection
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyAHb1pT_SgqolYZdpOsmQdLK-OMjNVpVYA",
  authDomain: "hudarogu-71a4f.firebaseapp.com",
  projectId: "hudarogu-71a4f",
  storageBucket: "hudarogu-71a4f.appspot.com",
  messagingSenderId: "453627568918",
  appId: "1:453627568918:web:85f634cfa2d0ca358e2637",
  measurementId: "G-EVDBZ70E5C",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HTML要素取得
const form = document.getElementById("schoolForm");
const schoolNameInput = document.getElementById("schoolName");
const passwordWrapper = document.getElementById("passwordWrapper");
const passwordLabel = document.getElementById("passwordLabel");
const backButton = document.getElementById("backButton");

// 🔹 学校名入力後にパスワード欄を表示
schoolNameInput.addEventListener("blur", async () => {
  const schoolName = schoolNameInput.value.trim();
  if (!schoolName) return;

  // パスワード参照：各学校コレクション/DC/schoolDC/info
  const passwordDocRef = doc(db, schoolName, "DC", "schoolDC", "info");
  const passwordSnap = await getDoc(passwordDocRef);

  // パスワード欄を表示
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

// 🔹 フォーム送信処理（登録 or ログイン）
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const schoolName = schoolNameInput.value.trim();
  const schoolPassword = document.getElementById("schoolPassword")?.value.trim();
  if (!schoolName || !schoolPassword) return;

  try {
    // schoolList に学校名が存在するかチェック
    const schoolListRef = collection(db, "schoolList");
    const schoolDocs = await getDocs(schoolListRef);
    const schoolExists = schoolDocs.docs.some(doc => doc.id === schoolName);

    if (!schoolExists) {
      // 🔸 schoolList に新規学校追加
      await setDoc(doc(db, "schoolList", schoolName), { createdAt: serverTimestamp() });
    }

    // ✅ Firestore構造: 各学校名/DC/schoolDC/info
    const infoDocRef = doc(db, schoolName, "DC", "schoolDC", "info");
    const infoSnap = await getDoc(infoDocRef);

    if (!infoSnap.exists()) {
      // 🔸 新規登録
      const data = {
        password: schoolPassword,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // schoolDC コレクションに info ドキュメント作成
      const schoolDCCollection = collection(db, schoolName, "DC", "schoolDC");
      const infoDoc = doc(schoolDCCollection, "info");
      await setDoc(infoDoc, data);

      alert(`学校「${schoolName}」を新規登録しました！`);
    } else {
      // 🔸 既存ログイン
      const data = infoSnap.data();
      if (data.password !== schoolPassword) {
        alert("パスワードが間違っています。");
        return;
      }

      // 更新時刻を更新
      await setDoc(infoDocRef, { updatedAt: serverTimestamp() }, { merge: true });

      alert(`学校「${schoolName}」でログインしました！`);
    }

    // 🔸 成功後に遷移
    window.location.href = `teacher_main.html?school=${encodeURIComponent(schoolName)}`;
  } catch (error) {
    console.error("Error:", error);
    alert("エラーが発生しました: " + error.message);
  }
});

// 🔹 戻るボタン処理
backButton.addEventListener("click", () => {
  window.location.href = "index.html";
});