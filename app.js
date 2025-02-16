const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "data.json");

// data.json がない場合、自動で作成する関数
function initializeDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ threads: [] }, null, 2));
    }
}

// サーバー起動時に data.json をチェック
initializeDataFile();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// `.html` を省略してアクセス可能にするルーティング
app.get("/:page", (req, res, next) => {
    let filePath = path.join(__dirname, "public", req.params.page + ".html");

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            next(); // ファイルがない場合は次の処理へ
        } else {
            res.sendFile(filePath);
        }
    });
});

// `apps` ディレクトリ内の `.html` 省略対応
app.get("/apps/:page", (req, res, next) => {
    let filePath = path.join(__dirname, "public", "apps", req.params.page + ".html");

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            next(); // ファイルがない場合は次の処理へ
        } else {
            res.sendFile(filePath);
        }
    });
});

// クライアントのIPアドレスを取得
function getClientIP(req) {
    return (
        req.headers["x-forwarded-for"]?.split(",")[0] || // プロキシ対応
        req.connection.remoteAddress || 
        req.socket.remoteAddress || 
        "unknown"
    );
}

// IPアドレスを基に ID を生成
function generateID(ip) {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const hash = crypto.createHash("md5").update(ip + today).digest("hex"); // MD5 ハッシュ
    return hash.substring(0, 8).toUpperCase(); // 8桁の英数字
}

// スレッド一覧を取得
app.get("/api/threads", (req, res) => {
    initializeDataFile(); // data.json がない場合に作成
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    res.json(data.threads);
});

// スレッドを作成
app.post("/api/threads", (req, res) => {
    initializeDataFile();
    const { title } = req.body;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

    const newThread = {
        id: Date.now().toString(),
        title,
        posts: []
    };

    data.threads.push(newThread);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json(newThread);
});

// 指定されたスレッドのレス一覧を取得
app.get("/api/threads/:id", (req, res) => {
    initializeDataFile();
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    const thread = data.threads.find(t => t.id === id);

    if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
    }

    res.json(thread);
});

// 指定されたスレッドにレスを投稿
app.post("/api/threads/:id", (req, res) => {
    initializeDataFile();
    const { id } = req.params;
    const { name, message } = req.body;
    const ip = getClientIP(req);
    const fixedID = generateID(ip);

    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    const thread = data.threads.find(t => t.id === id);

    if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
    }

    const newPost = { name, message, timestamp: new Date().toISOString(), id: fixedID };
    thread.posts.push(newPost);

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json(newPost);
});

// 404エラーハンドラー
app.use((req, res) => {
    res.status(404).send("404 - Not Found");
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
