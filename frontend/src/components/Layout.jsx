import { BarChart3, LogOut, MessageCircle } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Layout({ children }) {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <MessageCircle className="text-emerald-600" size={22} />
            Sentiment Chat
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink className="btn btn-muted" to="/">
              <MessageCircle size={17} />
              Chat
            </NavLink>
            <NavLink className="btn btn-muted" to="/dashboard">
              <BarChart3 size={17} />
              Dashboard
            </NavLink>
            <ThemeToggle />
            <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">
              {user?.name}
            </span>
            <button className="btn btn-muted h-10 w-10 px-0" onClick={logout} title="Log out">
              <LogOut size={17} />
            </button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
