const http = require("http");

const rooms = [
  { id: "general", name: "General", unreadCount: 0 },
  { id: "project", name: "Project", unreadCount: 2 },
  { id: "support", name: "Support", unreadCount: 0 }
];

const messages = [
  {
    id: 1,
    roomId: "general",
    sender: "Aarav",
    text: "This chat feels much better with sentiment labels.",
    sentiment: "positive",
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString()
  },
  {
    id: 2,
    roomId: "general",
    sender: "Mira",
    text: "Yes, and the fallback behavior is important too.",
    sentiment: "neutral",
    createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString()
  },
  {
    id: 3,
    roomId: "project",
    sender: "Dev",
    text: "The sentiment service is separate so NLP testing stays cleaner.",
    sentiment: "positive",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  }
];

let nextId = 4;

function sentimentFor(text) {
  const value = text.toLowerCase();
  const positive = ["good", "great", "love", "happy", "nice", "better", "excellent", "clean"];
  const negative = ["bad", "sad", "angry", "hate", "terrible", "awful", "problem", "crash"];
  const pos = positive.filter((word) => value.includes(word)).length;
  const neg = negative.filter((word) => value.includes(word)).length;
  if (neg > pos) return "negative";
  if (pos > neg) return "positive";
  return "neutral";
}

function json(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

function appHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sentiment Chat Preview</title>
  <style>
    :root { color-scheme: light dark; font-family: Inter, system-ui, sans-serif; }
    body { margin: 0; background: #f7f8fb; color: #172033; }
    .dark { background: #111827; color: #f8fafc; }
    header { height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; border-bottom: 1px solid #dbe2ea; background: #fff; }
    .dark header, .dark aside, .dark .panel, .dark .composer { background: #172033; border-color: #2d3748; }
    main { display: grid; grid-template-columns: 290px 1fr; height: calc(100vh - 64px); }
    aside { border-right: 1px solid #dbe2ea; background: #fff; padding: 16px; overflow: auto; }
    button, input { font: inherit; }
    button { border: 0; border-radius: 8px; padding: 10px 12px; cursor: pointer; background: #e8edf3; color: inherit; }
    button.primary { background: #059669; color: white; }
    .room { width: 100%; display: flex; justify-content: space-between; margin-bottom: 8px; text-align: left; }
    .room.active { background: #d1fae5; color: #065f46; }
    .dark .room.active { background: #064e3b; color: #d1fae5; }
    .chat { min-width: 0; display: flex; flex-direction: column; background: #eef2f7; }
    .dark .chat { background: #0f172a; }
    .panel { border-bottom: 1px solid #dbe2ea; background: #fff; padding: 16px 20px; }
    .messages { flex: 1; overflow: auto; padding: 20px; }
    .msg { max-width: 720px; margin: 0 0 12px; display: flex; gap: 10px; }
    .bubble { background: #fff; border-radius: 8px; padding: 10px 12px; box-shadow: 0 1px 2px rgba(15,23,42,.08); }
    .dark .bubble { background: #172033; }
    .mine { margin-left: auto; justify-content: flex-end; }
    .mine .bubble { background: #059669; color: white; }
    .meta { display: flex; gap: 8px; align-items: center; font-size: 12px; opacity: .75; margin-bottom: 4px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .positive { background: #059669; } .neutral { background: #64748b; } .negative { background: #e11d48; }
    .composer { display: flex; gap: 8px; border-top: 1px solid #dbe2ea; background: #fff; padding: 14px; }
    input { width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; background: #fff; color: #172033; }
    .dark input { background: #0f172a; color: #f8fafc; border-color: #334155; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px; }
    .stat { background: #eef2f7; border-radius: 8px; padding: 12px; }
    .dark .stat { background: #0f172a; }
    @media (max-width: 760px) { main { grid-template-columns: 1fr; } aside { display: none; } }
  </style>
</head>
<body>
  <header>
    <strong>Sentiment Chat Preview</strong>
    <button id="theme">Dark mode</button>
  </header>
  <main>
    <aside>
      <h3>Rooms</h3>
      <div id="rooms"></div>
      <div class="stats">
        <div class="stat"><small>Messages</small><br><strong id="total">0</strong></div>
        <div class="stat"><small>Users</small><br><strong>3</strong></div>
        <div class="stat"><small>Rooms</small><br><strong>${rooms.length}</strong></div>
      </div>
    </aside>
    <section class="chat">
      <div class="panel">
        <h2 id="roomTitle" style="margin:0 0 4px">General</h2>
        <small>Local no-install preview. Full MERN app code is already in the project folders.</small>
      </div>
      <div class="messages" id="messages"></div>
      <form class="composer" id="form">
        <input id="text" placeholder="Type a message. Try: this is great, or this is a problem" autocomplete="off">
        <button class="primary">Send</button>
      </form>
    </section>
  </main>
  <script>
    let activeRoom = "general";
    const rooms = ${JSON.stringify(rooms)};
    let messages = ${JSON.stringify(messages)};
    const names = ["You", "Aarav", "Mira"];

    function renderRooms() {
      document.getElementById("rooms").innerHTML = rooms.map(room =>
        '<button class="room ' + (room.id === activeRoom ? 'active' : '') + '" onclick="selectRoom(\\'' + room.id + '\\')"><span># ' + room.name + '</span><span>' + room.unreadCount + '</span></button>'
      ).join("");
    }

    function renderMessages() {
      const list = messages.filter(message => message.roomId === activeRoom);
      document.getElementById("messages").innerHTML = list.map(message => {
        const mine = message.sender === "You";
        const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return '<div class="msg ' + (mine ? 'mine' : '') + '"><div class="bubble"><div class="meta"><span>' + message.sender + '</span><span>' + time + '</span><span title="' + message.sentiment + '" class="dot ' + message.sentiment + '"></span></div><div>' + message.text.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])) + '</div></div></div>';
      }).join("");
      document.getElementById("total").textContent = messages.length;
      document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
    }

    function selectRoom(id) {
      activeRoom = id;
      document.getElementById("roomTitle").textContent = rooms.find(room => room.id === id).name;
      renderRooms();
      renderMessages();
    }

    document.getElementById("form").addEventListener("submit", event => {
      event.preventDefault();
      const input = document.getElementById("text");
      const text = input.value.trim();
      if (!text) return;
      const lower = text.toLowerCase();
      const pos = ["good","great","love","happy","nice","better","excellent","clean"].filter(w => lower.includes(w)).length;
      const neg = ["bad","sad","angry","hate","terrible","awful","problem","crash"].filter(w => lower.includes(w)).length;
      messages.push({ id: Date.now(), roomId: activeRoom, sender: "You", text, sentiment: neg > pos ? "negative" : pos > neg ? "positive" : "neutral", createdAt: new Date().toISOString() });
      input.value = "";
      renderMessages();
    });

    document.getElementById("theme").addEventListener("click", () => {
      document.body.classList.toggle("dark");
    });

    window.selectRoom = selectRoom;
    renderRooms();
    renderMessages();
  </script>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, {});

  if (req.url === "/health") {
    return json(res, { status: "ok", service: "local-preview" });
  }

  if (req.url === "/api/rooms") {
    return json(res, { rooms });
  }

  if (req.url === "/api/messages" && req.method === "GET") {
    return json(res, { messages });
  }

  if (req.url === "/api/messages" && req.method === "POST") {
    const body = await readBody(req);
    const message = {
      id: nextId++,
      roomId: body.roomId || "general",
      sender: body.sender || "You",
      text: String(body.text || "").trim(),
      sentiment: sentimentFor(body.text || ""),
      createdAt: new Date().toISOString()
    };
    messages.push(message);
    return json(res, { message }, 201);
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(appHtml());
});

server.listen(5173, "127.0.0.1", () => {
  console.log("Local preview running at http://localhost:5173");
});
