document.addEventListener("DOMContentLoaded", function () {
    const threadList = document.getElementById("threadList");
    const createThreadForm = document.getElementById("createThreadForm");
    const threadTitleInput = document.getElementById("threadTitle");

    // スレッド一覧を取得
    function loadThreads() {
        fetch("/api/threads")
            .then(res => res.json())
            .then(threads => {
                threadList.innerHTML = "";
                threads.forEach(thread => {
                    const li = document.createElement("li");
                    const link = document.createElement("a");
                    link.href = `/chat_thread.html?id=${thread.id}`;
                    link.textContent = thread.title;
                    li.appendChild(link);
                    threadList.appendChild(li);
                });
            });
    }

    // スレッドを作成
    createThreadForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const title = threadTitleInput.value.trim();

        if (title === "") return;

        fetch("/api/threads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title })
        })
        .then(() => {
            threadTitleInput.value = "";
            loadThreads();
        });
    });

    loadThreads();
});
