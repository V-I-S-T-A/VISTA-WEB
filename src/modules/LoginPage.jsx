import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import backgroundImage from "../assets/shared/vista_background.png";
import vistaLogo from "../assets/shared/vista_logo.png";
import { useLogin } from "../hooks/useAuth";

const STORAGE_KEY = "vista_remembered_accounts";
const LAST_EMAIL_KEY = "vista_last_remembered_email";

function getRememberedAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveRememberedAccount(email, password) {
  try {
    const accounts = getRememberedAccounts();
    const normalized = email.trim().toLowerCase();
    // Obfuscate so password isn't plain text in DevTools
    const encoded = btoa(unescape(encodeURIComponent(password)));
    accounts[normalized] = encoded;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    localStorage.setItem(LAST_EMAIL_KEY, normalized);
  } catch (e) {
    console.warn("Could not save credentials to local storage", e);
  }
}

function removeRememberedAccount(email) {
  try {
    const accounts = getRememberedAccounts();
    const normalized = email.trim().toLowerCase();
    delete accounts[normalized];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    if (localStorage.getItem(LAST_EMAIL_KEY) === normalized) {
      localStorage.removeItem(LAST_EMAIL_KEY);
    }
  } catch (e) {
    console.warn("Could not remove credentials from local storage", e);
  }
}

function getStoredPassword(email) {
  try {
    const accounts = getRememberedAccounts();
    const normalized = email.trim().toLowerCase();
    const encoded = accounts[normalized];
    if (encoded) {
      return decodeURIComponent(escape(atob(encoded)));
    }
  } catch (e) {
    return null;
  }
  return null;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLogin();

  // Load last remembered account on this device on mount
  useEffect(() => {
    const lastEmail = localStorage.getItem(LAST_EMAIL_KEY);
    if (lastEmail) {
      const savedPass = getStoredPassword(lastEmail);
      if (savedPass !== null) {
        setEmail(lastEmail);
        setPassword(savedPass);
        setRemember(true);
      }
    }
  }, []);

  // Dynamically check if entered/selected email has remembered password on this device
  function handleEmailChange(newEmail) {
    setEmail(newEmail);
    const savedPass = getStoredPassword(newEmail);
    if (savedPass !== null) {
      setPassword(savedPass);
      setRemember(true);
    } else {
      // If switching to an unsaved account, do not retain previous password
      setRemember(false);
    }
  }

  function handleRememberToggle(checked) {
    setRemember(checked);
    if (!checked && email) {
      removeRememberedAccount(email);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await loginMutation.mutateAsync({ email, password });

      // If Remember Me is checked, store credentials on this device
      if (remember) {
        saveRememberedAccount(email, password);
      } else {
        removeRememberedAccount(email);
      }

      // Role-based redirect
      const role = res?.user?.role;
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "staff") {
        navigate("/staff/dashboard");
      } else if (role === "student") {
        navigate("/student/dashboard");
      } else {
        navigate("/login");
      }
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
                  name="email"
                  type="email"
                  className="login-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required
                  autoComplete="username email"
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="login-password">
                  Password
                </label>
                <div className="login-password-wrapper">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="login-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: "42px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="login-password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => handleRememberToggle(e.target.checked)}
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
