// URLパラメータ取得
const params = new URLSearchParams(window.location.search);
const schoolName = params.get("school");
const studentName = params.get("student");

if (!schoolName || !studentName) {
  alert("ログイン情報がありません。ログインし直してください。");
  window.location.href = 'index.html';
}

const currentParams = window.location.search; // 現在のURLパラメータを保持

document.getElementById("name").textContent = `${schoolName}の${studentName}さんのメインフォーム`;

document.getElementById("record").addEventListener("click", () => {
    // 記録ページにパラメータを引き継ぐ
    window.location.href = `https://dondenden.github.io/hudarogu/src/student_match_record.html${currentParams}`;
});

document.getElementById("watch").addEventListener("click", () => {
    // 閲覧ページにパラメータを引き継ぐ
    window.location.href = `https://dondenden.github.io/hudarogu/src/student_match_view.html${currentParams}`;
});