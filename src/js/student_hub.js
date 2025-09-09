import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔹 Firebase 設定
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

// 🔹 DOM 取得
const schoolSelect = document.getElementById("schoolSelect");
const studentSelect = document.getElementById("studentSelect");
const loginForm = document.getElementById("loginForm");
const passwordWrapper = document.getElementById("passwordWrapper");
const schoolPasswordInput = document.getElementById("schoolPassword");
const togglePasswordBtn = document.getElementById("togglePassword");
const loginButton = document.getElementById("loginButton");

// 🔹 学校リストロード
async function loadSchools() {
  const snap = await getDocs(collection(db, "schoolList"));
  snap.forEach(docSnap => {
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = docSnap.id;
    schoolSelect.appendChild(option);
  });
}

// 🔹 学校パスワード表示切替
togglePasswordBtn.addEventListener("click", () => {
  if (schoolPasswordInput.type === "password") {
    schoolPasswordInput.type = "text";
    togglePasswordBtn.textContent = "🙈";
  } else {
    schoolPasswordInput.type = "password";
    togglePasswordBtn.textContent = "👁️";
  }
});

// 🔹 学校選択
schoolSelect.addEventListener("change", () => {
  studentSelect.innerHTML = '<option value="">-- 生徒を選択してください --</option>';
  studentSelect.disabled = true;
  loginButton.disabled = true;
  passwordWrapper.style.display = "none";
  schoolPasswordInput.value = "";
  if (!schoolSelect.value) return;
  passwordWrapper.style.display = "block";
});

// 🔹 学校パスワード確認
schoolPasswordInput.addEventListener("blur", async () => {
  const selectedSchool = schoolSelect.value;
  const enteredPassword = schoolPasswordInput.value.trim();
  if (!selectedSchool || !enteredPassword) return;

  const passwordDocRef = doc(db, selectedSchool, "passwordDoc");
  const passwordSnap = await getDoc(passwordDocRef);
  if (!passwordSnap.exists() || passwordSnap.data().password !== enteredPassword) {
    alert("パスワードが間違っています");
    return;
  }

  // ✅ 生徒一覧ロード
  const snap = await getDocs(collection(db, selectedSchool));
  studentSelect.innerHTML = '<option value="">-- 生徒を選択してください --</option>';
  snap.forEach(docSnap => {
    if (docSnap.id === "passwordDoc") return;
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = docSnap.id;
    studentSelect.appendChild(option);
  });
  studentSelect.disabled = false;
  loginButton.disabled = false;
});

// 🔹 ログイン処理（Firestore 上の平文パスワードを使用）
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const selectedSchool = schoolSelect.value;
  const selectedStudent = studentSelect.value;

  if (!selectedSchool || !selectedStudent) {
    alert("学校と生徒を選択してください");
    return;
  }

  // ここでは学生のパスワードは使わず、選択された生徒で直接ログイン扱い
  window.location.href = `student_main.html?school=${encodeURIComponent(selectedSchool)}&student=${encodeURIComponent(selectedStudent)}`;
});

// 🔹 戻る
document.getElementById("backButton").addEventListener("click", () => {
  window.location.href = 'index.html';
});

// 初期ロード
loadSchools();