// 10221306
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyAHb1pT_SgqolYZdpOsmQdLK-OMjNVpVYA",
  authDomain: "hudarogu-71a4f.firebaseapp.com",
  projectId: "hudarogu-71a4f",
  storageBucket: "hudarogu-71a4f.appspot.com",
  messagingSenderId: "453627568918",
  appId: "1:453627568918:web:85f634cfa2d0ca358e2637",
  measurementId: "G-EVDBZ70E5C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM取得
const schoolSelect = document.getElementById("schoolSelect");
const passwordWrapper = document.getElementById("passwordWrapper");
const schoolPasswordInput = document.getElementById("schoolPassword");
const toggleSchoolPasswordBtn = document.getElementById("toggleSchoolPassword");
const studentWrapper = document.getElementById("studentWrapper");
const studentNameInput = document.getElementById("studentName");
const studentPasswordWrapper = document.getElementById("studentPasswordWrapper");
const studentPasswordLabel = document.getElementById("studentPasswordLabel");
const loginButton = document.getElementById("loginButton");

// 🔹 学校リストを取得
async function loadSchools() {
  // Firestore の schoolList コレクションから学校一覧を取得
  const schoolListRef = collection(db, "schoolList");
  const snap = await getDocs(schoolListRef);

  snap.forEach((docSnap) => {
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = docSnap.id;
    schoolSelect.appendChild(option);
  });
}

// 🔹 パスワード表示切替
toggleSchoolPasswordBtn.addEventListener("click", () => {
  if (schoolPasswordInput.type === "password") {
    schoolPasswordInput.type = "text";
    toggleSchoolPasswordBtn.textContent = "🙈";
  } else {
    schoolPasswordInput.type = "password";
    toggleSchoolPasswordBtn.textContent = "👁️";
  }
});

// 🔹 学校選択時の処理
schoolSelect.addEventListener("change", () => {
  passwordWrapper.style.display = "none";
  studentWrapper.style.display = "none";
  studentPasswordWrapper.style.display = "none";
  schoolPasswordInput.value = "";
  loginButton.disabled = true;

  if (!schoolSelect.value) return;
  passwordWrapper.style.display = "block";
});

// 🔹 学校パスワード確認（東桜学館/DC/schoolDC/info）
schoolPasswordInput.addEventListener("blur", async () => {
  const selectedSchool = schoolSelect.value;
  const enteredPassword = schoolPasswordInput.value.trim();
  if (!selectedSchool || !enteredPassword) return;

  // パスワード参照先: 東桜学館/DC/schoolDC/info
  const schoolDocRef = doc(db, selectedSchool, "DC", "schoolDC", "info");
  const schoolSnap = await getDoc(schoolDocRef);

  if (!schoolSnap.exists()) {
    alert("この学校は登録されていません。");
    return;
  }

  const data = schoolSnap.data();
  if (data.password !== enteredPassword) {
    alert("学校パスワードが間違っています。");
    return;
  }

  studentWrapper.style.display = "block";
  loginButton.disabled = false;
});

// 🔹 生徒名入力時にパスワード入力欄を表示
studentNameInput.addEventListener("blur", () => {
  if (studentNameInput.value.trim()) {
    studentPasswordWrapper.style.display = "block";
    studentPasswordLabel.innerHTML = `
      パスワード作成:
      <input type="password" id="studentPassword" required>
    `;
  }
});

// 🔹 生徒ログイン（常に新規作成）
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedSchool = schoolSelect.value.trim();  // 学校名（例: 東桜学館）
  const studentName = studentNameInput.value.trim();
  const studentPassword = document.getElementById("studentPassword")?.value.trim();

  if (!selectedSchool || !studentName || !studentPassword) {
    alert("すべての項目を入力してください");
    return;
  }

  try {
    // 🔹 保存先：東桜学館/DC/studentDC/生徒名
    const studentDocRef = doc(db, selectedSchool, "DC", "studentDC", studentName);

    await setDoc(studentDocRef, {
      password: studentPassword,
      createdAt: serverTimestamp()
    });

    alert(`生徒「${studentName}」を登録しました！`);
    window.location.href = `student_main.html?school=${encodeURIComponent(selectedSchool)}&student=${encodeURIComponent(studentName)}`;
  } catch (error) {
    console.error("アカウント作成エラー:", error);
    alert("生徒アカウントの作成に失敗しました。");
  }
});

// 🔹 戻るボタン
document.getElementById("backButton").addEventListener("click", () => {
  window.location.href = "index.html";
});

// 🔹 初期ロード
loadSchools();