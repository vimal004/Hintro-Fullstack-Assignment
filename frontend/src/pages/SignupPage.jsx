import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, LayoutDashboard } from "lucide-react";
import useAuthStore from "../store/authStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import "./AuthPages.css";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const { signup, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError("");

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (password.length < 4) {
      setLocalError("Password must be at least 4 characters");
      return;
    }

    const success = await signup(name, email, password);
    if (success) navigate("/boards");
  };

  const displayError = localError || error;

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
            <h1 className="auth-page__title">Create account</h1>
            <p className="auth-page__subtitle">
              Start collaborating with your team
            </p>
          </div>

          {/* ── Form ──── */}
          <form className="auth-page__form" onSubmit={handleSubmit}>
            {displayError && (
              <div className="auth-page__error">{displayError}</div>
            )}

            <Input
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              icon={User}
              required
            />

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
              placeholder="At least 4 characters"
              icon={Lock}
              required
            />

            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
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
              Create account
            </Button>
          </form>

          <p className="auth-page__footer">
            Already have an account?{" "}
            <Link to="/login" className="auth-page__link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
