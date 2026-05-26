import { Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function MessageComposer({ disabled, onSend, onTyping }) {
  const [text, setText] = useState("");
  const debouncedStop = useMemo(() => {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => onTyping(false), 900);
    };
  }, [onTyping]);

  useEffect(() => () => onTyping(false), [onTyping]);

  function submit(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText("");
    onTyping(false);
  }

  return (
    <form className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900" onSubmit={submit}>
      <div className="mx-auto flex max-w-4xl gap-2">
        <input
          className="input"
          disabled={disabled}
          onChange={(event) => {
            setText(event.target.value);
            onTyping(true);
            debouncedStop();
          }}
          placeholder={disabled ? "Select a room to start chatting" : "Type a message"}
          value={text}
        />
        <button className="btn btn-primary h-10 w-10 px-0" disabled={disabled} title="Send message">
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
