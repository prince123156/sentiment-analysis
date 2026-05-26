import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-6 text-slate-600 dark:text-slate-200">Loading...</div>;
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
