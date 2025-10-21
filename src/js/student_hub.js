import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

// 🔹 学校リスト読み込み
async function loadSchools() {
  console.log("学校リストを読み込み開始");
  const schoolListRef = collection(db, "schoolList");
  const schoolListSnap = await getDocs(schoolListRef);

  schoolListSnap.forEach((docSnap) => {
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = docSnap.id;
    schoolSelect.appendChild(option);
  });
}

// 🔹 学校パスワード表示切替
toggleSchoolPasswordBtn.addEventListener("click", () => {
  if (schoolPasswordInput.type === "password") {
    schoolPasswordInput.type = "text";
    toggleSchoolPasswordBtn.textContent = "🙈";
  } else {
    schoolPasswordInput.type = "password";
    toggleSchoolPasswordBtn.textContent = "👁️";
  }
});

// 🔹 学校選択
schoolSelect.addEventListener("change", () => {
  loginButton.disabled = true;
  passwordWrapper.style.display = "none";
  schoolPasswordInput.value = "";
  studentWrapper.style.display = "none";
  studentPasswordWrapper.style.display = "none";

  if (!schoolSelect.value) return;
  passwordWrapper.style.display = "block";
});

// 🔹 学校パスワード確認
schoolPasswordInput.addEventListener("blur", async () => {
  const selectedSchool = schoolSelect.value;
  const enteredPassword = schoolPasswordInput.value.trim();
  if (!selectedSchool || !enteredPassword) return;

  // 🔸 schoolList の中の学校情報を確認
  const schoolDocRef = doc(db, "schoolList", selectedSchool);
  const schoolSnap = await getDoc(schoolDocRef);

  if (!schoolSnap.exists()) {
    alert("この学校は登録されていません。");
    return;
  }

  const schoolData = schoolSnap.data();
  if (schoolData.password !== enteredPassword) {
    alert("学校パスワードが間違っています");
    return;
  }

  console.log("学校ログイン成功");
  studentWrapper.style.display = "block";
});

// 🔹 生徒名入力 → パスワード欄切替
studentNameInput.addEventListener("blur", async () => {
  const selectedSchool = schoolSelect.value;
  const studentName = studentNameInput.value.trim();

  if (!selectedSchool || !studentName) return;

  // 🔸 生徒サブコレクション確認（学校名コレクション）
  const studentDocRef = doc(db, selectedSchool, "students", studentName);
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
});

// 🔹 ログイン処理
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedSchool = schoolSelect.value;
  const studentName = studentNameInput.value.trim();
  const studentPassword = document.getElementById("studentPassword")?.value.trim();

  if (!selectedSchool || !studentName || !studentPassword) return;

  try {
    const studentDocRef = doc(db, selectedSchool, "students", studentName);
    const studentSnap = await getDoc(studentDocRef);

    if (!studentSnap.exists()) {
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
      console.log("既存生徒ログイン成功:", studentName);
    }

    // 成功 → メインページへ
    window.location.href = `student_main.html?school=${encodeURIComponent(selectedSchool)}&student=${encodeURIComponent(studentName)}`;
  } catch (error) {
    console.error("ログインエラー:", error);
    alert("ログインに失敗しました");
  }
});

// 🔹 戻る
document.getElementById("backButton").addEventListener("click", () => {
  window.location.href = 'index.html';
});

// 🔹 初期ロード
loadSchools();