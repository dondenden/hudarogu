import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

const params = new URLSearchParams(window.location.search);
const schoolName = params.get("school");
const studentName = params.get("student");

if (!schoolName || !studentName) {
  alert("ログイン情報がありません。");
  window.location.href = 'index.html';
}

document.addEventListener("DOMContentLoaded", async () => {
  const studentInfo = document.getElementById("studentInfo");
  const overallStats = document.getElementById("overallStats");
  const studentStatsList = document.getElementById("studentStatsList");
  const matchList = document.getElementById("matchList");

  studentInfo.textContent = `${schoolName}の${studentName}さん`;

  // 試合履歴と統計をロード
  const studentSnap = await getDocs(collection(db, schoolName));

  let totalMatches = 0;
  let totalWins = 0;
  let totalScoreDiffWin = 0;
  let totalScoreDiffLose = 0;

  const studentStats = [];

  for (const docSnap of studentSnap.docs) {
    const name = docSnap.id;
    if (name === "passwordDoc") continue;

    const matchesSnap = await getDocs(collection(db, schoolName, name, "matches"));
    if (matchesSnap.empty) continue;

    let wins = 0;
    let losses = 0;
    let scoreWinSum = 0;
    let scoreLoseSum = 0;

    matchesSnap.forEach(matchDoc => {
      const data = matchDoc.data();
      if (data.result === "勝") {
        wins++;
        scoreWinSum += data.score;
      } else if (data.result === "負") {
        losses++;
        scoreLoseSum += data.score;
      }

      // 生徒の試合履歴を表示
      if (name === studentName) {
        const li = document.createElement("li");
        li.textContent = `${data.date} | ${data.opponent} | ${data.result} | 枚差: ${data.score}`;
        matchList.appendChild(li);
      }
    });

    studentStats.push({
      name,
      winRate: wins / (wins + losses) * 100,
      avgWinScore: wins ? scoreWinSum / wins : 0,
      avgLoseScore: losses ? scoreLoseSum / losses : 0
    });

    totalMatches += wins + losses;
    totalWins += wins;
    totalScoreDiffWin += scoreWinSum;
    totalScoreDiffLose += scoreLoseSum;
  }

  overallStats.textContent = `全体勝率: ${totalMatches ? ((totalWins / totalMatches) * 100).toFixed(2) : 0}% | 平均勝ち枚差: ${totalWins ? (totalScoreDiffWin / totalWins).toFixed(2) : 0} | 平均負け枚差: ${totalMatches - totalWins ? (totalScoreDiffLose / (totalMatches - totalWins)).toFixed(2) : 0}`;

  studentStats.forEach(stat => {
    const li = document.createElement("li");
    li.textContent = `${stat.name} | 勝率: ${stat.winRate.toFixed(2)}% | 平均勝ち枚差: ${stat.avgWinScore.toFixed(2)} | 平均負け枚差: ${stat.avgLoseScore.toFixed(2)}`;
    studentStatsList.appendChild(li);
  });
});