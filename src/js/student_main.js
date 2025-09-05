window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const schoolName = params.get("school");
  const studentName = params.get("student");

  if (!schoolName || !studentName) {
    alert("ログイン情報がありません。ログインし直してください。");
    window.location.href = 'index.html';
    return;
  }

  const currentParams = window.location.search;

  // h1 に表示
  const h1 = document.getElementById("studentHeader");
  h1.textContent = `${schoolName}の${studentName}さんのメインフォーム`;

  const recordBtn = document.getElementById("record");
  const watchBtn = document.getElementById("watch");

  recordBtn.addEventListener("click", () => {
      window.location.href = `https://dondenden.github.io/hudarogu/student_match.html${currentParams}`;
  });

  watchBtn.addEventListener("click", () => {
      window.location.href = `https://dondenden.github.io/hudarogu/student_record${currentParams}`;
  });

  // 🔹 戻るボタン処理
  backButton.addEventListener("click", () => {
    window.location.href = 'https://dondenden.github.io/hudarogu/index.html';
  });
})