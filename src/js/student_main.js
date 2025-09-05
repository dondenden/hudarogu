const currentParams = window.location.search; // 現在のURLパラメータを取得

document.getElementById("record").addEventListener("click", () => {
    // teacher_hub にパラメータを引き継ぐ
    window.location.href = `https://dondenden.github.io/hudarogu/src/student_matche${currentParams}`;
});

document.getElementById("watch").addEventListener("click", () => {
    // student_hub にパラメータを引き継ぐ
    window.location.href = `https://dondenden.github.io/hudarogu/src/student_hub${currentParams}`;
});