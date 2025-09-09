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

const studentWrapper = document.getElementById("studentWrapper");
const studentNameInput = document.getElementById("studentName");
const studentPasswordWrapper = document.getElementById("studentPasswordWrapper");
const studentPasswordLabel = document.getElementById("studentPasswordLabel");

// 学校名入力後にパスワード欄表示
schoolNameInput.addEventListener("blur", async () => {
  const schoolName = schoolNameInput.value.trim();
  if (!schoolName) return;

  const passwordDocRef = doc(db, schoolName, "passwordDoc");
  const passwordSnap = await getDoc(passwordDocRef);

  passwordWrapper.style.display = "block";
  studentWrapper.style.display = "block";

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

  const toggleBtn = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("schoolPassword");
  toggleBtn.addEventListener("click", () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    toggleBtn.textContent = passwordInput.type === "password" ? "👁️" : "🙈";
  });
});

// 生徒名入力後にチェック
studentNameInput.addEventListener("blur", async () => {
  const schoolName = schoolNameInput.value.trim();
  const studentName = studentNameInput.value.trim();
  if (!schoolName || !studentName) return;

  const studentDocRef = doc(db, schoolName, studentName);
  const studentSnap = await getDoc(studentDocRef);

  studentPasswordWrapper.style.display = "block";

  if (studentSnap.exists()) {
    studentPasswordLabel.innerHTML = `
      生徒パスワード入力:
      <input type="password" id="studentPassword" required>
      <button type="button" id="toggleStudentPassword">👁️</button>
    `;
  } else {
    studentPasswordLabel.innerHTML = `
      生徒パスワード作成:
      <input type="password" id="studentPassword" required>
      <button type="button" id="toggleStudentPassword">👁️</button>
    `;
  }

  const toggleBtn = document.getElementById("toggleStudentPassword");
  const passwordInput = document.getElementById("studentPassword");
  toggleBtn.addEventListener("click", () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    toggleBtn.textContent = passwordInput.type === "password" ? "👁️" : "🙈";
  });
});

// フォーム送信処理
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const schoolName = schoolNameInput.value.trim();
  const schoolPassword = document.getElementById("schoolPassword")?.value.trim();
  const studentName = studentNameInput.value.trim();
  const studentPassword = document.getElementById("studentPassword")?.value.trim();

  if (!schoolName || !schoolPassword) return;

  try {
    // 学校パスワード確認
    const passwordDocRef = doc(db, schoolName, "passwordDoc");
    const passwordSnap = await getDoc(passwordDocRef);

    if (!passwordSnap.exists()) {
      // 新規学校
      await setDoc(passwordDocRef, {
        password: schoolPassword,
        createdAt: serverTimestamp()
      });
      alert(`学校「${schoolName}」を新規登録しました！`);
    } else {
      if (passwordSnap.data().password !== schoolPassword) {
        alert("学校パスワードが間違っています。");
        return;
      }
    }

    // 生徒登録
    if (studentName) {
      const studentDocRef = doc(db, schoolName, studentName);
      const studentSnap = await getDoc(studentDocRef);

      if (!studentSnap.exists()) {
        await setDoc(studentDocRef, {
          password: studentPassword,
          createdAt: serverTimestamp()
        });
        alert(`生徒「${studentName}」を新規登録しました！`);
      } else {
        if (studentSnap.data().password !== studentPassword) {
          alert("生徒パスワードが間違っています。");
          return;
        }
        alert(`生徒「${studentName}」でログインしました！`);
      }
    }

    window.location.href = `https://dondenden.github.io/hudarogu/teacher_main.html?school=${encodeURIComponent(schoolName)}`;

  } catch (error) {
    console.error("Error: ", error);
    alert("エラーが発生しました: " + error.message);
  }
});

// 戻るボタン
backButton.addEventListener("click", () => {
  window.location.href = 'index.html';
});