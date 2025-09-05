import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
const currentParams = window.location.search;

if (!schoolName || !studentName) {
  alert("ログイン情報がありません。");
  window.location.href = 'index.html';
}

// HTML要素参照
const studentInfo = document.getElementById("studentInfo");
const matchList = document.getElementById("matchList");
const overallStats = document.getElementById("overallStats");
const perOpponentStats = document.getElementById("perOpponentStats");
const backButton = document.getElementById("backButton");

studentInfo.textContent = `${schoolName}の${studentName}さん`;

// データ読み込み
async function loadMatches() {
  const matchesSnap = await getDocs(query(
    collection(db, schoolName, studentName, "matches"),
    orderBy("createdAt", "desc")
  ));

  const matches = [];
  matchesSnap.forEach(doc => matches.push(doc.data()));

  const total = matches.length;
  const wins = matches.filter(m => m.result === "勝ち").length;

  // 全体平均枚差
  const avgScore = total ? (matches.reduce((sum,m)=>sum+m.score,0)/total).toFixed(1) : 0;

  overallStats.textContent = total
    ? `全体勝率: ${(wins / total * 100).toFixed(1)}% (${wins}/${total}), 平均枚差: ${avgScore}`
    : "試合データがありません";

  // 対戦相手別集計
  const opponentMap = {};
  matches.forEach(m => {
    if (!opponentMap[m.opponent]) opponentMap[m.opponent] = [];
    opponentMap[m.opponent].push(m);
  });

  perOpponentStats.innerHTML = "";
  for (const [opponent, games] of Object.entries(opponentMap)) {
    const winGames = games.filter(g => g.result === "勝ち");
    const loseGames = games.filter(g => g.result === "負け");

    const winCount = winGames.length;
    const totalGames = games.length;

    const avgWinScore = winGames.length ? (winGames.reduce((sum,g)=>sum+g.score,0)/winGames.length).toFixed(1) : "-";
    const avgLoseScore = loseGames.length ? (loseGames.reduce((sum,g)=>sum+g.score,0)/loseGames.length).toFixed(1) : "-";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${opponent}</td>
      <td>${totalGames}</td>
      <td>${(winCount/totalGames*100).toFixed(1)}%</td>
      <td>${avgWinScore}</td>
      <td>${avgLoseScore}</td>
    `;
    perOpponentStats.appendChild(tr);
  }

  // 試合履歴（最新順）
  matchList.innerHTML = "";
  matches.forEach(m => {
    const dateStr = m.date || "日付不明";
    const li = document.createElement("li");
    li.textContent = `${dateStr} - 対戦相手: ${m.opponent}, 枚差: ${m.score}, 結果: ${m.result}`;
    matchList.appendChild(li);
  });
}

// 戻るボタン
backButton.addEventListener("click", () => {
  window.location.href = `https://dondenden.github.io/hudarogu/src/student_main.html${currentParams}`;
});

// 初期ロード
loadMatches();