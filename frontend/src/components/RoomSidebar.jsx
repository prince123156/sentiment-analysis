import { Hash, Plus, Users } from "lucide-react";
import { useState } from "react";

export default function RoomSidebar({ rooms, activeRoomId, onCreateRoom, onSelectRoom }) {
  const [name, setName] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    onCreateRoom(name.trim());
    setName("");
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:w-80">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <form className="flex gap-2" onSubmit={submit}>
          <input
            className="input"
            onChange={(event) => setName(event.target.value)}
            placeholder="New room"
            value={name}
          />
          <button className="btn btn-primary h-10 w-10 px-0" title="Create room">
            <Plus size={18} />
          </button>
        </form>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {rooms.map((room) => (
          <button
            className={`mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
              activeRoomId === room._id
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            key={room._id}
            onClick={() => onSelectRoom(room)}
            type="button"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Hash size={16} />
              <span className="truncate font-medium">{room.name}</span>
            </span>
            <span className="flex items-center gap-2">
              {room.unreadCount > 0 && (
                <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs text-white">
                  {room.unreadCount}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Users size={14} />
                {room.members?.filter((member) => member.isOnline).length || 0}
              </span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
