import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import backgroundImage from "../assets/shared/vista_background.png";
import vistaLogo from "../assets/shared/vista_logo.png";
import { useLogin } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLogin();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await loginMutation.mutateAsync({ email, password });
      // Successful login
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login failed", err);
      alert("Login failed. Check credentials.");
    }
  }

  return (
    <div className="login-page">
      <Header />

      <main className="login-main">
        <div
          className="login-hero"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          {/* dark left overlay for readability */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, rgba(17,58,110,0.75) 0%, rgba(17,58,110,0.45) 50%, transparent 100%)",
              pointerEvents: "none",
            }}
          />

          <div
            className="login-card"
            style={{ position: "relative", zIndex: 1 }}
          >
            <img src={vistaLogo} alt="V.I.S.T.A." className="login-card-logo" />
            <p className="login-card-title">Sign in to your account</p>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <div className="login-field">
                <label className="login-label" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="login-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>

              <button type="submit" className="login-submit">
                SIGN IN
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
