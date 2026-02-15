import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LayoutDashboard } from "lucide-react";
import useAuthStore from "../store/authStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import "./AuthPages.css";

export default function LoginPage() {
  const [email, setEmail] = useState("vimal@taskflow.io");
  const [password, setPassword] = useState("demo");
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password);
    if (success) navigate("/boards");
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg" />

      <div className="auth-page__container">
        <div className="auth-page__card">
          {/* ── Logo ──── */}
          <div className="auth-page__header">
            <div className="auth-page__logo">
              <LayoutDashboard size={28} />
            </div>
            <h1 className="auth-page__title">Welcome back</h1>
            <p className="auth-page__subtitle">
              Sign in to your TaskFlow workspace
            </p>
          </div>

          {/* ── Form ──── */}
          <form className="auth-page__form" onSubmit={handleSubmit}>
            {error && <div className="auth-page__error">{error}</div>}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={Mail}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon={Lock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
            >
              Sign in
            </Button>
          </form>

          <p className="auth-page__footer">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="auth-page__link">
              Create one
            </Link>
          </p>

          <div className="auth-page__demo">
            <span className="auth-page__demo-label">Demo credentials</span>
            <code>vimal@taskflow.io / demo</code>
          </div>
        </div>
      </div>
    </div>
  );
}
