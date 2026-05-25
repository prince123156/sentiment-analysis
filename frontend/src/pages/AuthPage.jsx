import { LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { token, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (isRegister) {
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Sentiment Chat</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isRegister ? "Create your account" : "Welcome back"}
            </p>
          </div>
          <ThemeToggle />
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={submit}>
          {isRegister && (
            <label className="block text-sm font-medium">
              Name
              <input
                className="input mt-1"
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
                value={form.name}
              />
            </label>
          )}
          <label className="block text-sm font-medium">
            Email
            <input
              className="input mt-1"
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
              type="email"
              value={form.email}
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              className="input mt-1"
              minLength={6}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
              type="password"
              value={form.password}
            />
          </label>
          <button className="btn btn-primary w-full" disabled={busy}>
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isRegister ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <Link className="font-medium text-emerald-700 dark:text-emerald-300" to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Log in" : "Register"}
          </Link>
        </p>
      </div>
    </main>
  );
}
