// src/js/student_hub.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔹 Firebase設定
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
const passwordWrapper = document.getElementById("passwordWrapper");
const schoolPasswordInput = document.getElementById("schoolPassword");
const toggleSchoolPasswordBtn = document.getElementById("toggleSchoolPassword");
const studentWrapper = document.getElementById("studentWrapper");
const studentNameInput = document.getElementById("studentName");
const studentPasswordWrapper = document.getElementById("studentPasswordWrapper");
const studentPasswordLabel = document.getElementById("studentPasswordLabel");
const loginButton = document.getElementById("loginButton");

// =========================
// 学校リスト取得
// =========================
const loadSchools = async () => {
  try {
    const snap = await getDocs(collection(db, "schoolList"));
    snap.forEach(docSnap => {
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = docSnap.id;
      schoolSelect.appendChild(option);
    });
  } catch (err) {
    console.error("学校リスト取得エラー:", err);
  }
};

// =========================
// 学校パスワード表示切替
// =========================
toggleSchoolPasswordBtn.addEventListener("click", () => {
  if (schoolPasswordInput.type === "password") {
    schoolPasswordInput.type = "text";
    toggleSchoolPasswordBtn.textContent = "🙈";
  } else {
    schoolPasswordInput.type = "password";
    toggleSchoolPasswordBtn.textContent = "👁️";
  }
});

// =========================
// 学校選択時
// =========================
schoolSelect.addEventListener("change", () => {
  loginButton.disabled = true;
  passwordWrapper.style.display = "none";
  schoolPasswordInput.value = "";
  studentWrapper.style.display = "none";
  studentPasswordWrapper.style.display = "none";
  if (!schoolSelect.value) return;
  passwordWrapper.style.display = "block";
});

// =========================
// 学校パスワード確認
// =========================
schoolPasswordInput.addEventListener("blur", async () => {
  const selectedSchool = schoolSelect.value;
  const enteredPassword = schoolPasswordInput.value.trim();
  if (!selectedSchool || !enteredPassword) return;

  try {
    const passwordDocRef = doc(db, selectedSchool, "passwordDoc");
    const passwordSnap = await getDoc(passwordDocRef);

    if (!passwordSnap.exists() || passwordSnap.data().password !== enteredPassword) {
      alert("学校パスワードが間違っています");
      studentWrapper.style.display = "none";
      loginButton.disabled = true;
      return;
    }

    // 学校ログイン成功 → 生徒入力欄表示
    studentWrapper.style.display = "block";
    studentPasswordWrapper.style.display = "none";
    loginButton.disabled = true;

  } catch (err) {
    console.error("学校パスワード確認エラー:", err);
  }
});

// =========================
// 生徒名入力時
// =========================
studentNameInput.addEventListener("blur", async () => {
  const selectedSchool = schoolSelect.value;
  const studentName = studentNameInput.value.trim();
  if (!selectedSchool || !studentName) return;

  // 教師が登録した生徒か確認
  const schoolListDocRef = doc(db, "schoolList", selectedSchool);
  const schoolListSnap = await getDoc(schoolListDocRef);
  if (!schoolListSnap.exists() || !schoolListSnap.data()[studentName]) {
    alert("この生徒名は登録されていません。教師に追加してもらってください。");
    studentPasswordWrapper.style.display = "none";
    loginButton.disabled = true;
    return;
  }

  // 生徒用ドキュメント確認
  const studentDocRef = doc(db, selectedSchool, studentName);
  const studentSnap = await getDoc(studentDocRef);

  studentPasswordWrapper.style.display = "block";

  if (studentSnap.exists()) {
    studentPasswordLabel.innerHTML = `
      パスワード入力:
      <input type="password" id="studentPassword" required>
    `;
  } else {
    studentPasswordLabel.innerHTML = `
      パスワード作成:
      <input type="password" id="studentPassword" required>
    `;
  }

  loginButton.disabled = false;
});

// =========================
// ログイン処理
// =========================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedSchool = schoolSelect.value;
  const studentName = studentNameInput.value.trim();
  const studentPassword = document.getElementById("studentPassword")?.value.trim();
  if (!selectedSchool || !studentName || !studentPassword) return;

  try {
    const studentDocRef = doc(db, selectedSchool, studentName);
    const studentSnap = await getDoc(studentDocRef);

    if (!studentSnap.exists()) {
      // 新規登録
      await setDoc(studentDocRef, {
        password: studentPassword,
        createdAt: serverTimestamp()
      });
      alert(`生徒「${studentName}」を新規登録しました！`);
    } else {
      const data = studentSnap.data();
      if (data.password !== studentPassword) {
        alert("生徒パスワードが間違っています");
        return;
      }
    }

    window.location.href = `student_main.html?school=${encodeURIComponent(selectedSchool)}&student=${encodeURIComponent(studentName)}`;

  } catch (err) {
    console.error("ログインエラー:", err);
    alert("ログインに失敗しました");
  }
});

// =========================
// 戻る
// =========================
document.getElementById("backButton").addEventListener("click", () => {
  window.location.href = 'index.html';
});

// =========================
// 初期ロード
// =========================
loadSchools();