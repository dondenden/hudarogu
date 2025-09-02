// Firebase v12 SDK の読み込み
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Firebase設定（新しいプロジェクトでも差し替え可能）
const firebaseConfig = {
  apiKey: "AIzaSyCNbHkPWSQArwCg2LvoqsdJ_8yHbbP6sPs",
  authDomain: "donsuke-karuta.firebaseapp.com",
  projectId: "donsuke-karuta",
  storageBucket: "donsuke-karuta.firebasestorage.app",
  messagingSenderId: "949515279352",
  appId: "1:949515279352:web:3a62ffbb7f56e36e52d40d",
  measurementId: "G-90L24BHDTJ"
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// HTML要素
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const schoolInput = document.getElementById("school_name");
const schoolIdContainer = document.getElementById("schoolIdContainer");
const schoolIdInput = document.getElementById("school_id");
const confirmBtn = document.getElementById("confirmBtn");

// ログイン
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error(error);
    alert("ログインに失敗しました");
  }
});

// ログアウト
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// 認証状態監視
onAuthStateChanged(auth, (user) => {
  if (user) {
    userInfo.textContent = `${user.displayName} さんでログイン中`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    schoolInput.disabled = false;
  } else {
    userInfo.textContent = "ログインしていません";
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    schoolInput.disabled = true;
    schoolIdContainer.style.display = "none";
  }
});

// 学校名入力 → 存在確認
schoolInput.addEventListener("change", async () => {
  const schoolName = schoolInput.value.trim();
  if (!schoolName) return alert("学校名を入力してください");

  const schoolRef = collection(db, schoolName);
  const snapshot = await getDocs(schoolRef);

  if (!snapshot.empty) {
    schoolIdContainer.style.display = "block";
  } else {
    alert("その学校は登録されていません");
    schoolIdContainer.style.display = "none";
  }
});

// ID確認して次のページへ
confirmBtn.addEventListener("click", async () => {
  const schoolName = schoolInput.value.trim();
  const inputId = schoolIdInput.value.trim();

  if (!schoolName || !inputId) return alert("学校名と学校IDを入力してください");

  const initSnap = await getDoc(doc(db, schoolName, "_init"));
  if (initSnap.exists() && initSnap.data().schoolId === inputId) {
    window.location.href =
      `https://dondenden.github.io/kanadon-karuta/implement/student_main.html?school=${encodeURIComponent(schoolName)}`;
  } else {
    alert("学校IDが間違っています");
  }
});