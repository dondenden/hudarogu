import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

// 🔹 DOM取得
const schoolSelect = document.getElementById("schoolSelect");
const loginForm = document.getElementById("loginForm");
const passwordWrapper = document.getElementById("passwordWrapper");
const schoolPasswordInput = document.getElementById("schoolPassword");
const togglePasswordBtn = document.getElementById("togglePassword");
const loginButton = document.getElementById("loginButton");
const studentNameInput = document.getElementById("studentName");

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

  // ✅ ログインボタン有効化（生徒は自分で入力）
  loginButton.disabled = false;
});

// 🔹 ログイン処理（生徒作成）
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const selectedSchool = schoolSelect.value;
  const studentName = studentNameInput.value.trim();

  if (!selectedSchool || !studentName) {
    alert("学校と名前を入力してください");
    return;
  }

  // 🔹 Firebaseに生徒名を保存
  const studentsRef = doc(db, selectedSchool, "students");
  await setDoc(studentsRef, { [studentName]: true }, { merge: true });

  // ✅ ログイン扱いで次ページへ
  window.location.href = `student_main.html?school=${encodeURIComponent(selectedSchool)}&student=${encodeURIComponent(studentName)}`;
});

// 🔹 戻る
document.getElementById("backButton").addEventListener("click", () => {
  window.location.href = 'index.html';
});

// 初期ロード
loadSchools();