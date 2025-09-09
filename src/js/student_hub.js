import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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
const auth = getAuth(app);

const schoolSelect = document.getElementById("schoolSelect");
const studentSelect = document.getElementById("studentSelect");
const loginForm = document.getElementById("loginForm");
const passwordWrapper = document.getElementById("passwordWrapper");
const schoolPasswordInput = document.getElementById("schoolPassword");
const togglePasswordBtn = document.getElementById("togglePassword");
const loginButton = document.getElementById("loginButton");

// 学校ロード
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
  passwordWrapper.style.display = "block";
});

// パスワード入力後、生徒一覧ロード
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

  // Firestore から生徒名＋メールをロード
  const snap = await getDocs(collection(db, selectedSchool));
  studentSelect.innerHTML = '<option value="">-- 生徒を選択してください --</option>';
  snap.forEach(docSnap => {
    if (docSnap.id === "passwordDoc") return;
    const option = document.createElement("option");
    option.value = docSnap.id;  // doc ID は生徒名
    option.textContent = docSnap.id;
    studentSelect.appendChild(option);
  });

  studentSelect.disabled = false;
  loginButton.disabled = false;
});

// ログインフォーム送信
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const selectedSchool = schoolSelect.value;
  const selectedStudent = studentSelect.value;
  const enteredPassword = schoolPasswordInput.value.trim();

  if (!selectedSchool || !selectedStudent || !enteredPassword) return;

  try {
    // Firestore から生徒のメール取得
    const studentDocRef = doc(db, selectedSchool, selectedStudent);
    const studentSnap = await getDoc(studentDocRef);
    if (!studentSnap.exists()) throw new Error("生徒情報が見つかりません");

    const email = studentSnap.data().email; // 教員が登録時に保存しておく
    await signInWithEmailAndPassword(auth, email, enteredPassword);

    // ログイン成功
    window.location.href = `student_main.html?school=${selectedSchool}&student=${selectedStudent}`;
  } catch (error) {
    console.error(error);
    alert("ログイン失敗: メールまたはパスワードが間違っています");
  }
});

// 戻る
document.getElementById("backButton").addEventListener("click", () => {
  window.location.href = 'https://dondenden.github.io/hudarogu/index.html';
});

loadSchools();