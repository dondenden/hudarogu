import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

// URLパラメータ取得
const params = new URLSearchParams(window.location.search);
const schoolName = params.get("school");
const studentName = params.get("student");

// パラメータ確認
if (!schoolName || !studentName) {
  alert("ログイン情報がありません。");
  window.location.href = 'index.html';
}

// DOM取得
document.addEventListener("DOMContentLoaded", async () => {
  const studentInfo = document.getElementById("studentInfo");
  const matchForm = document.getElementById("matchForm");
  const opponentSelect = document.getElementById("opponentSelect");
  const scoreInput = document.getElementById("score");
  const matchDateInput = document.getElementById("matchDate");
  const backButton = document.getElementById("backButton");

  studentInfo.textContent = `${schoolName}の${studentName}さん`;

  // 🔹 対戦相手リスト読み込み（members コレクションから）
  async function loadOpponents() {
    opponentSelect.innerHTML = '<option value="">-- 対戦相手を選択 --</option>';

    try {
      // ✅ 生徒一覧取得
      const membersRef = collection(db, schoolName, "DC", "studentDC", "studentmember", "members");
      const membersSnap = await getDocs(membersRef);

      membersSnap.forEach((docSnap) => {
        const name = docSnap.id;
        if (name !== studentName) {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          opponentSelect.appendChild(option);
        }
      });

    } catch (error) {
      console.error("対戦相手リスト読み込みエラー:", error);
      alert("生徒リストの読み込みに失敗しました。");
    }
  }

  // 🔹 試合結果保存
  matchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const opponent = opponentSelect.value;
    const score = scoreInput.value;
    const date = matchDateInput.value;
    const result = matchForm.result.value;

    if (!opponent || score === "" || !date || !result) {
      alert("全ての項目を入力してください。");
      return;
    }

    try {
      // ✅ 保存先を studentDC に変更
      const matchRef = collection(db, schoolName, "DC", "studentDC", studentName, "matches");

      await addDoc(matchRef, {
        opponent,
        score: Number(score),
        date,
        result,
        createdAt: serverTimestamp()
      });

      alert("試合結果を保存しました！");
      matchForm.reset();

      // 学生メインページへ戻る
      window.location.href = `student_main.html?school=${encodeURIComponent(schoolName)}&student=${encodeURIComponent(studentName)}`;

    } catch (error) {
      console.error("保存エラー:", error);
      alert("試合データの保存に失敗しました。");
    }
  });

  // 🔹 戻るボタン
  backButton.addEventListener("click", () => {
    window.location.href = `student_main.html?school=${encodeURIComponent(schoolName)}&student=${encodeURIComponent(studentName)}`;
  });

  // 初期化
  await loadOpponents();
});