import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "./store/authStore";
import useSocketStore from "./store/socketStore";
import AppLayout from "./components/layout/AppLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import BoardsPage from "./pages/BoardsPage";
import BoardDetailPage from "./pages/BoardDetailPage";

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AuthRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/boards" replace />;
  return children;
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated && token) {
      connect(token);
    } else {
      disconnect();
    }
  }, [isAuthenticated, token, connect, disconnect]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page — public homepage */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/boards" replace />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <SignupPage />
            </AuthRoute>
          }
        />

        {/* Protected Routes (inside AppLayout) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/boards" element={<BoardsPage />} />
          <Route path="/boards/:id" element={<BoardDetailPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
