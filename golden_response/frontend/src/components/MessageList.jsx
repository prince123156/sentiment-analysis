import { memo, useEffect, useRef } from "react";

const colors = {
  positive: "bg-emerald-500",
  neutral: "bg-slate-400",
  negative: "bg-rose-500"
};

function initials(name = "?") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function MessageList({ messages, currentUserId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        {messages.map((message) => {
          const mine = message.sender?._id === currentUserId || message.sender === currentUserId;
          const label = message.sentiment?.label || "neutral";

          return (
            <div className={`flex gap-3 ${mine ? "justify-end" : "justify-start"}`} key={message._id}>
              {!mine && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {initials(message.sender?.name)}
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-md px-3 py-2 shadow-sm ${
                  mine
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                }`}
              >
                <div className="mb-1 flex items-center gap-2 text-xs opacity-75">
                  <span>{mine ? "You" : message.sender?.name}</span>
                  <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${colors[label]}`} title={label} />
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>
                {message.sentiment?.sourceAvailable === false && (
                  <p className="mt-1 text-xs opacity-70">Sentiment service offline</p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default memo(MessageList);
