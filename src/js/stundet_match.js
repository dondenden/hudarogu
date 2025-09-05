import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

if (!schoolName || !studentName) {
  alert("ログイン情報がありません。");
  window.location.href = 'index.html';
}

document.addEventListener("DOMContentLoaded", async () => {
  const studentInfo = document.getElementById("studentInfo");
  const matchForm = document.getElementById("matchForm");
  const opponentSelect = document.getElementById("opponentSelect");
  const scoreInput = document.getElementById("score");

  studentInfo.textContent = `${schoolName}の${studentName}さん`;

  // 対戦相手ロード
  async function loadOpponents() {
    opponentSelect.innerHTML = '<option value="">-- 対戦相手を選択 --</option>';
    const snap = await getDocs(collection(db, schoolName));
    snap.forEach(docSnap => {
      const name = docSnap.id;
      if (name === "passwordDoc" || name === studentName) return;
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      opponentSelect.appendChild(option);
    });
  }

  // 試合結果保存
  matchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const opponent = opponentSelect.value;
    const score = scoreInput.value;
    if (!opponent || score === "") return;

    try {
      await addDoc(collection(db, schoolName, studentName, "matches"), {
        opponent,
        score: Number(score),
        createdAt: serverTimestamp()
      });
      alert("試合結果を保存しました！");
      matchForm.reset();
    } catch (error) {
      console.error("保存エラー:", error);
      alert("保存に失敗しました");
    }
  });

  await loadOpponents();
});