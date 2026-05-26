import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api, { API_URL } from "../api.js";
import Layout from "../components/Layout.jsx";
import MessageComposer from "../components/MessageComposer.jsx";
import MessageList from "../components/MessageList.jsx";
import RoomSidebar from "../components/RoomSidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ChatPage() {
  const { token, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [alert, setAlert] = useState("");
  const [mobileRoomName, setMobileRoomName] = useState("");
  const activeRoomRef = useRef(null);
  const socketRef = useRef(null);

  const loadRooms = useCallback(async () => {
    const res = await api.get("/rooms");
    setRooms(res.data.rooms);
    setActiveRoom((current) => current || res.data.rooms[0] || null);
  }, []);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  useEffect(() => {
    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("message:new", (message) => {
      const currentRoom = activeRoomRef.current;
      setMessages((current) => {
        if (String(message.room) !== String(currentRoom?._id)) return current;
        return [...current, message];
      });
      loadRooms();
    });

    socket.on("typing:start", ({ roomId, userId, name }) => {
      if (userId === user?.id) return;
      setTypingUsers((current) => ({ ...current, [roomId]: name }));
    });

    socket.on("typing:stop", ({ roomId }) => {
      setTypingUsers((current) => {
        const copy = { ...current };
        delete copy[roomId];
        return copy;
      });
    });

    socket.on("sentiment:alert", ({ message }) => {
      setAlert(message);
      setTimeout(() => setAlert(""), 6000);
    });

    socket.on("user:status", loadRooms);

    return () => socket.disconnect();
  }, [token, user?.id, loadRooms]);

  useEffect(() => {
    if (!activeRoom) return;
    const socket = socketRef.current;
    socket?.emit("room:join", { roomId: activeRoom._id });

    api.get(`/rooms/${activeRoom._id}/messages`).then((res) => {
      setMessages(res.data.messages);
      loadRooms();
    });

    return () => socket?.emit("room:leave", { roomId: activeRoom._id });
  }, [activeRoom?._id]);

  async function createRoom(name) {
    const res = await api.post("/rooms", { name });
    setRooms((current) => [res.data.room, ...current]);
    setActiveRoom(res.data.room);
  }

  function createMobileRoom(event) {
    event.preventDefault();
    if (!mobileRoomName.trim()) return;
    createRoom(mobileRoomName.trim());
    setMobileRoomName("");
  }

  function sendMessage(text) {
    socketRef.current?.emit("message:send", { roomId: activeRoom._id, text });
  }

  const handleTyping = useCallback(
    (isTyping) => {
      if (!activeRoom) return;
      socketRef.current?.emit(isTyping ? "typing:start" : "typing:stop", {
        roomId: activeRoom._id
      });
    },
    [activeRoom]
  );

  return (
    <Layout>
      <main className="mx-auto flex h-[calc(100vh-65px)] max-w-7xl overflow-hidden border-x border-slate-200 dark:border-slate-800">
        <div className="hidden md:block">
          <RoomSidebar
            activeRoomId={activeRoom?._id}
            onCreateRoom={createRoom}
            onSelectRoom={setActiveRoom}
            rooms={rooms}
          />
        </div>
        <section className="flex min-w-0 flex-1 flex-col bg-slate-100 dark:bg-slate-950">
          <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{activeRoom?.name || "No room selected"}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {typingUsers[activeRoom?._id] ? `${typingUsers[activeRoom._id]} is typing...` : "Messages are analyzed before broadcast"}
                </p>
              </div>
            </div>
            <div className="mt-3 block md:hidden">
              <div className="grid gap-2">
                <select
                  className="input"
                  onChange={(event) => {
                    const next = rooms.find((room) => room._id === event.target.value);
                    setActiveRoom(next);
                  }}
                  value={activeRoom?._id || ""}
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.name}
                    </option>
                  ))}
                </select>
                <form className="flex gap-2" onSubmit={createMobileRoom}>
                  <input
                    className="input"
                    onChange={(event) => setMobileRoomName(event.target.value)}
                    placeholder="New room"
                    value={mobileRoomName}
                  />
                  <button className="btn btn-primary">Create</button>
                </form>
              </div>
            </div>
          </div>

          {alert && (
            <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
              <AlertTriangle size={17} />
              {alert}
            </div>
          )}

          <MessageList currentUserId={user?.id} messages={messages} />
          <MessageComposer disabled={!activeRoom} onSend={sendMessage} onTyping={handleTyping} />
        </section>
      </main>
    </Layout>
  );
}
