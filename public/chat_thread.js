document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const threadId = urlParams.get("id");
    const threadTitle = document.getElementById("threadTitle");
    const postsDiv = document.getElementById("posts");
    const postForm = document.getElementById("postForm");
    const nameInput = document.getElementById("name");
    const messageInput = document.getElementById("message");

    // スレッド情報を取得
    function loadThread() {
        fetch(`/api/threads/${threadId}`)
            .then(res => res.json())
            .then(thread => {
                threadTitle.textContent = thread.title;
                postsDiv.innerHTML = "";
                thread.posts.forEach((post, index) => {
                    const p = document.createElement("p");
                    p.innerHTML = formatPost(index + 1, post);
                    postsDiv.appendChild(p);
                });
            });
    }

    // 投稿
    postForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = nameInput.value.trim() || "名無しさん";
        const message = messageInput.value.trim();

        if (message === "") return;

        const id = generateID(name);  // 名前からIDを生成

        fetch(`/api/threads/${threadId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, message, id })
        })
        .then(() => {
            messageInput.value = "";
            loadThread();
        });
    });

    loadThread();
});

/**
 * 2ch風の投稿フォーマットを作成
 * @param {number} index 投稿番号
 * @param {object} post 投稿データ
 * @returns {string} フォーマット済みの投稿
 */
function formatPost(index, post) {
    const timestamp = new Date(post.timestamp);
    const formattedDate = timestamp.toLocaleString("ja-JP", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        weekday: "short"
    });

    return `<b>${index} 名前：${post.name} ★ ：${formattedDate} ID:${post.id}</b><br>${post.message}`;
}

/**
 * ユーザーごとに固定されたIDを生成
 * @param {string} name 投稿者の名前
 * @returns {string} 5桁の固定ID
 */
function generateID(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) % 100000;  // 31を掛けるのは簡単なハッシュ関数の例
    }
    return hash.toString(36).toUpperCase();  // 36進数に変換して英数字5桁のIDにする
}
