document.addEventListener('DOMContentLoaded', function () {
    fetch(`${window.location.origin}/nav.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('nav').innerHTML = html;
        })
        .catch(error => {
            console.error('ナビゲーションバーの読み込みに失敗しました:', error);
        });

    // ボタンのイベントリスナーを設定
    const button = document.querySelector('button');
});
