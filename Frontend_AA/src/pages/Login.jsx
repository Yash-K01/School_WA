import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import "../style.css";
import { setToken, setUserData } from "../utils/authToken.js";

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Login successful! Redirecting...");
        console.log(
          "✅ [LOGIN] Token received:",
          data.data.token?.substring(0, 20) + "...",
        );
        setToken(data.data.token);
        setUserData(data.data.user);

        // Verify token was stored
        const storedToken = localStorage.getItem("token");
        console.log("✅ [LOGIN] Token stored in localStorage:", !!storedToken);
        if (storedToken) {
          console.log(
            "✅ [LOGIN] Stored token preview:",
            storedToken.substring(0, 20) + "...",
          );
        }

        setTimeout(() => {
          navigate("/leads");
        }, 1500);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "var(--primary-bg)",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "var(--r-lg)",
          boxShadow: "var(--shadow-lg)",
          padding: 40,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            marginBottom: 8,
            color: "var(--gray-900)",
          }}
        >
          Login
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: "var(--gray-500)", margin: 0 }}>
            Enter your credentials to access the system
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 13, color: isAdminLogin ? 'var(--gray-500)' : 'var(--primary)', fontWeight: isAdminLogin ? 'normal' : '500' }}>Staff</span>
            <label className="toggle">
              <input type="checkbox" checked={isAdminLogin} onChange={e => setIsAdminLogin(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
            <span style={{ fontSize: 13, color: isAdminLogin ? 'var(--primary)' : 'var(--gray-500)', fontWeight: isAdminLogin ? '500' : 'normal' }}>Admin</span>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "var(--r)",
              padding: "12px 16px",
              marginBottom: 16,
              display: "flex",
              gap: 12,
            }}
          >
            <AlertCircle
              size={20}
              style={{ color: "#dc2626", flexShrink: 0 }}
            />
            <div style={{ color: "#991b1b", fontSize: 14 }}>{error}</div>
          </div>
        )}

        {success && (
          <div
            style={{
              background: "#dcfce7",
              border: "1px solid #86efac",
              borderRadius: "var(--r)",
              padding: "12px 16px",
              marginBottom: 16,
              display: "flex",
              gap: 12,
            }}
          >
            <CheckCircle
              size={20}
              style={{ color: "#16a34a", flexShrink: 0 }}
            />
            <div style={{ color: "#15803d", fontSize: 14 }}>{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 6,
                color: "var(--gray-700)",
              }}
            >
              Email
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@test.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 6,
                color: "var(--gray-700)",
              }}
            >
              Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p
          style={{
            fontSize: 13,
            color: "var(--gray-500)",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Test Credentials:
          <br />
          Email: {isAdminLogin ? "admin@test.com" : "staff@test.com"}
          <br />
          Password: 123456
        </p>
      </div>
    </div>
  );
}
