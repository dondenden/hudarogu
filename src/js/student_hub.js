import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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
const auth = getAuth(app);

// 🔹 DOM 取得
const schoolSelect = document.getElementById("schoolSelect");
const studentSelect = document.getElementById("studentSelect");
const loginForm = document.getElementById("loginForm");
const passwordWrapper = document.getElementById("passwordWrapper");
const schoolPasswordInput = document.getElementById("schoolPassword");
const togglePasswordBtn = document.getElementById("togglePassword");
const loginButton = document.getElementById("loginButton");

// 🔹 生徒パスワード欄作成
let studentPasswordInput;
let studentPasswordWrapper;

function createStudentPasswordField() {
  studentPasswordWrapper = document.createElement("div");
  studentPasswordWrapper.style.display = "none";
  studentPasswordWrapper.id = "studentPasswordWrapper";

  const label = document.createElement("label");
  label.textContent = "生徒パスワード: ";

  studentPasswordInput = document.createElement("input");
  studentPasswordInput.type = "password";
  studentPasswordInput.id = "studentPassword";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.textContent = "👁️";
  toggleBtn.addEventListener("click", () => {
    if (studentPasswordInput.type === "password") {
      studentPasswordInput.type = "text";
      toggleBtn.textContent = "🙈";
    } else {
      studentPasswordInput.type = "password";
      toggleBtn.textContent = "👁️";
    }
  });

  label.appendChild(studentPasswordInput);
  label.appendChild(toggleBtn);
  studentPasswordWrapper.appendChild(label);
  loginForm.insertBefore(studentPasswordWrapper, loginButton);
}

createStudentPasswordField();

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
  studentPasswordWrapper.style.display = "none";
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
    alert("学校パスワードが間違っています");
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
  studentPasswordWrapper.style.display = "block";
});

// 🔹 ログイン処理
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const selectedSchool = schoolSelect.value;
  const selectedStudent = studentSelect.value;
  const enteredStudentPassword = studentPasswordInput.value.trim();

  if (!selectedSchool || !selectedStudent || !enteredStudentPassword) {
    alert("すべて入力してください");
    return;
  }

  try {
    const studentSnap = await getDoc(doc(db, selectedSchool, selectedStudent));
    const email = studentSnap.data().email;

    await signInWithEmailAndPassword(auth, email, enteredStudentPassword);

    window.location.href = `student_main.html?school=${selectedSchool}&student=${selectedStudent}`;
  } catch (error) {
    console.error(error);
    alert("生徒パスワードが間違っています");
  }
});

// 🔹 戻る
document.getElementById("backButton").addEventListener("click", () => {
  window.location.href = 'index.html';
});

// 初期ロード
loadSchools();