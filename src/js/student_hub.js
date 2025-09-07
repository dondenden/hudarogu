import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase 設定
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

const schoolSelect = document.getElementById("schoolSelect");
const studentSelect = document.getElementById("studentSelect");
const loginForm = document.getElementById("loginForm");
const passwordWrapper = document.getElementById("passwordWrapper");
const schoolPasswordInput = document.getElementById("schoolPassword");
const togglePasswordBtn = document.getElementById("togglePassword");
const loginButton = document.getElementById("loginButton");

// 学校名ロード (schoolList コレクションから)
async function loadSchools() {
  const snap = await getDocs(collection(db, "schoolList"));
  snap.forEach(docSnap => {
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = docSnap.id;
    schoolSelect.appendChild(option);
  });
}

// パスワード表示切替
togglePasswordBtn.addEventListener("click", () => {
  if (schoolPasswordInput.type === "password") {
    schoolPasswordInput.type = "text";
    togglePasswordBtn.textContent = "🙈";
  } else {
    schoolPasswordInput.type = "password";
    togglePasswordBtn.textContent = "👁️";
  }
});

// 学校選択時の処理
schoolSelect.addEventListener("change", () => {
  studentSelect.innerHTML = '<option value="">-- 生徒を選択してください --</option>';
  studentSelect.disabled = true;
  loginButton.disabled = true;
  passwordWrapper.style.display = "none";
  schoolPasswordInput.value = "";

  if (!schoolSelect.value) return;

  // パスワード欄だけ表示
  passwordWrapper.style.display = "block";
});

// パスワード入力が終わったときの処理
schoolPasswordInput.addEventListener("blur", async () => {
  const selectedSchool = schoolSelect.value;
  const enteredPassword = schoolPasswordInput.value.trim();

  if (!selectedSchool || !enteredPassword) return;

  // パスワードチェック
  const passwordDocRef = doc(db, selectedSchool, "passwordDoc");
  const passwordSnap = await getDoc(passwordDocRef);

  if (!passwordSnap.exists() || passwordSnap.data().password !== enteredPassword) {
    alert("パスワードが間違っています");
    return;
  }

  // ✅ パスワードが合ったら生徒名をロード
  const snap = await getDocs(collection(db, selectedSchool));
  studentSelect.innerHTML = '<option value="">-- 生徒を選択してください --</option>';
  snap.forEach(docSnap => {
    if (docSnap.id === "passwordDoc") return; // passwordDocは除外
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = docSnap.id;
    studentSelect.appendChild(option);
  });

  studentSelect.disabled = false;
  loginButton.disabled = false;
});

// フォーム送信
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const selectedSchool = schoolSelect.value;
  const selectedStudent = studentSelect.value;

  if (!selectedSchool) {
    alert("学校を選択してください");
    return;
  }
  if (!selectedStudent) {
    alert("生徒を選択してください");
    return;
  }

  // ログイン成功
  window.location.href = `student_main.html?school=${selectedSchool}&student=${selectedStudent}`;
});

// 戻る
backBtn.addEventListener("click", () => {
  window.location.href = 'https://dondenden.github.io/hudarogu/index.html';
});

loadSchools();