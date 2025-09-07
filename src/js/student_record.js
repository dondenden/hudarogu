import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase 設定
const firebaseConfig = {
  apiKey:"AIzaSyAHb1pT_SgqolYZdpOsmQdLK-OMjNVpVYA",
  authDomain:"hudarogu-71a4f.firebaseapp.com",
  projectId:"hudarogu-71a4f",
  storageBucket:"hudarogu-71a4f.appspot.com",
  messagingSenderId:"453627568918",
  appId:"1:453627568918:web:85f634cfa2d0ca358e2637",
  measurementId:"G-EVDBZ70E5C"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// URLパラメータ取得
const params = new URLSearchParams(window.location.search);
const schoolName = params.get("school");
const studentName = params.get("student");
const currentParams = window.location.search;
if(!schoolName || !studentName){
    alert("ログイン情報がありません。");
    window.location.href='index.html';
}

// HTML要素参照
const studentInfo=document.getElementById("studentInfo");
const matchList=document.getElementById("matchList");
const toggleHistoryBtn=document.getElementById("toggleHistory");
const matchHistoryDiv=document.getElementById("matchHistory");
const backButton=document.getElementById("backButton");

const totalMatchesCard=document.getElementById("totalMatches");
const winRateCard=document.getElementById("winRateCard");
const avgScoreCard=document.getElementById("avgScoreCard");

const winRateChartCanvas=document.getElementById("winRateChart");
const dailyAvgChartCanvas=document.getElementById("dailyAvgChart");
const opponentChartCanvas=document.getElementById("opponentChart");
const scoreChartCanvas=document.getElementById("scoreChart");

studentInfo.textContent=`${schoolName}の${studentName}さん`;

// 履歴表示切替
toggleHistoryBtn.addEventListener("click",()=>{
    if(matchHistoryDiv.style.display==="none"){
        matchHistoryDiv.style.display="block"; 
        toggleHistoryBtn.textContent="履歴を隠す";
    } else {
        matchHistoryDiv.style.display="none"; 
        toggleHistoryBtn.textContent="履歴を見る";
    }
});

// 円グラフ中央テキストプラグイン
const centerTextPlugin = {
    id: 'centerText',
    beforeDraw(chart){
        if(chart.config.options.plugins.centerText.display){
            const {ctx, chartArea:{width, height}} = chart;
            const text = chart.config.options.plugins.centerText.text;
            ctx.save();
            const fontSize = Math.min(width, height)/3; // 自動リサイズ
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = chart.config.options.plugins.centerText.color || '#1f2937';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, width/2, height/2);
            ctx.restore();
        }
    }
};
Chart.register(centerTextPlugin);

// データ読み込み
async function loadMatches(){
    const matchesSnap=await getDocs(query(collection(db,schoolName,studentName,"matches"),orderBy("createdAt","desc")));
    const matches=[]; matchesSnap.forEach(doc=>matches.push(doc.data()));

    const total=matches.length;
    const wins=matches.filter(m=>m.result==="勝ち").length;
    const avgScore=total?(matches.reduce((s,m)=>s+Number(m.score),0)/total).toFixed(1):0;

    totalMatchesCard.querySelector("p").textContent = total;
    avgScoreCard.querySelector("p").textContent = avgScore;

    const winRatePercent = total?((wins/total)*100).toFixed(1):0;

    // 勝率円グラフ
    new Chart(winRateChartCanvas,{
        type:'doughnut',
        data:{
            labels:['勝ち','負け'],
            datasets:[{data:[wins,total-wins], backgroundColor:['#10b981','#ef4444'] }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            cutout:'70%',
            plugins:{
                legend:{display:false},
                centerText:{display:true, text:`${winRatePercent}%`, color:'#1f2937'}
            }
        }
    });

    // 履歴作成 & 日付ごとの平均枚差
    matchList.innerHTML="";
    const dailyMap={};
    matches.forEach(m=>{
        if(!dailyMap[m.date]) dailyMap[m.date]=[];
        dailyMap[m.date].push(Number(m.score));

        const tr=document.createElement("tr");
        const cls=m.result==='勝ち'?'win':'lose';
        tr.innerHTML=`<td>${m.date||'日付不明'}</td><td>${m.opponent}</td><td>${m.score}</td><td class="${cls}">${m.result}</td>`;
        matchList.appendChild(tr);
    });

    const dailyLabels=Object.keys(dailyMap).sort();
    const dailyAvg=dailyLabels.map(d=> (dailyMap[d].reduce((s,v)=>s+v,0)/dailyMap[d].length).toFixed(1));

    new Chart(dailyAvgChartCanvas,{
        type:'line',
        data:{labels:dailyLabels,datasets:[{label:'平均枚差',data:dailyAvg,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.2)',tension:0.3,fill:true}]},
        options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}, maintainAspectRatio:false}
    });

    // 対戦相手グラフ
    const opponentMap={};
    matches.forEach(m=>{ if(!opponentMap[m.opponent]) opponentMap[m.opponent]=[]; opponentMap[m.opponent].push(m); });
    createOpponentCharts(opponentMap);
}

// 対戦相手グラフ描画
function createOpponentCharts(opponentMap){
    const opponentLabels=Object.keys(opponentMap);
    const opponentWinRates=opponentLabels.map(o=>{
        const games=opponentMap[o];
        const winCount=games.filter(g=>g.result==='勝ち').length;
        return ((winCount/games.length)*100).toFixed(1);
    });
    new Chart(opponentChartCanvas,{
        type:'bar',
        data:{labels:opponentLabels,datasets:[{label:'勝率 (%)',data:opponentWinRates,backgroundColor:'#10b981'}]},
        options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,max:100}}}
    });

    const avgWinScores=opponentLabels.map(o=>{
        const wins=opponentMap[o].filter(g=>g.result==='勝ち');
        return wins.length?(wins.reduce((s,g)=>s+Number(g.score),0)/wins.length).toFixed(1):0;
    });
    const avgLoseScores=opponentLabels.map(o=>{
        const loses=opponentMap[o].filter(g=>g.result==='負け');
        return loses.length?(loses.reduce((s,g)=>s+Number(g.score),0)/loses.length).toFixed(1):0;
    });
    new Chart(scoreChartCanvas,{
        type:'bar',
        data:{labels:opponentLabels,datasets:[
            {label:'勝ち平均枚差',data:avgWinScores,backgroundColor:'#3b82f6'},
            {label:'負け平均枚差',data:avgLoseScores,backgroundColor:'#ef4444'}
        ]},
        options:{responsive:true,plugins:{legend:{position:'top'}}}
    });
}

backButton.addEventListener("click",()=>{ window.location.href=`https://dondenden.github.io/hudarogu/student_main.html${currentParams}` });
loadMatches();