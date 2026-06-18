import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function PartnerLogin() {
  const navigate = useNavigate();
  const { loginPartner, loginAdmin, partners } = useAuth();
  const [mode, setMode] = useState("partner");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!identifier.trim() || !password.trim()) {
      setError(mode === "admin" ? "Enter admin email/phone and password." : "Enter employee ID and password.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "admin") {
        await loginAdmin({ username: identifier, password });
        navigate("/admin/dashboard");
      } else {
        await loginPartner({ employeeId: identifier, password });
        navigate("/partner/dashboard");
      }
    } catch (err) {
      setError(err?.message || (mode === "admin"
        ? "Invalid admin email/phone or password."
        : "Invalid partner employee ID or password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={pageStyle} className="page-padding">
      <div style={cardStyle}>
        <Link to="/login" style={backLink}>Back to Login As</Link>
        <p style={eyebrow}>Partner / Admin Access</p>
        <h1 style={title}>{mode === "admin" ? "Admin Login" : "Employee Login"}</h1>
        <p style={subtitle}>
          {mode === "admin"
            ? "Login using admin email or phone and your password."
            : "Login using the employee ID and password provided by admin."}
        </p>

        <div style={toggleWrap}>
          <button
            type="button"
            onClick={() => {
              setMode("partner");
              setIdentifier("");
              setPassword("");
              setError("");
            }}
            style={{ ...toggleButton, ...(mode === "partner" ? activeToggle : {}) }}
          >
            Partner
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("admin");
              setIdentifier("");
              setPassword("");
              setError("");
            }}
            style={{ ...toggleButton, ...(mode === "admin" ? activeToggle : {}) }}
          >
            Admin
          </button>
        </div>

        <form id="partnerLoginForm" onSubmit={handleSubmit} style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
          <label htmlFor="identifier" style={labelStyle}>
            {mode === "admin" ? "Email or Phone" : "Employee ID"}
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            style={inputStyle}
            required
          />
          <label htmlFor="partnerPassword" style={labelStyle}>
            Password
          </label>
          <input
            id="partnerPassword"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={inputStyle}
            required
          />
          {error ? <p style={{ margin: 0, color: "#ef4444" }}>{error}</p> : null}
          <button type="submit" style={buttonStyle} disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Login to Dashboard"}
          </button>
        </form>

        <div style={hintBox}>
          <strong>Access notes</strong>
          <span>
            {mode === "admin"
              ? "Admins must use their email or phone, not a partner employee ID."
              : "Use administrator-provided employee credentials to sign in."}
          </span>
          <span>Partner accounts are created by admin from the dashboard.</span>
          {partners.length ? <span>Available partner accounts are managed live by admin.</span> : null}
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0a2440, #0d594f)",
  display: "grid",
  placeItems: "center",
  padding: "24px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const cardStyle = {
  width: "100%",
  maxWidth: "520px",
  background: "#ffffff",
  borderRadius: "30px",
  padding: "30px",
  boxShadow: "0 24px 60px rgba(4, 20, 38, 0.22)"
};

const backLink = {
  display: "inline-flex",
  textDecoration: "none",
  color: "#102542",
  fontWeight: 700
};

const eyebrow = {
  margin: "20px 0 0",
  color: "#1cb5ac",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 700,
  fontSize: "13px"
};

const title = {
  margin: "12px 0 0",
  fontSize: "40px",
  color: "#102542"
};

const subtitle = {
  margin: "12px 0 0",
  color: "#5b6878",
  lineHeight: 1.7
};

const labelStyle = {
  display: "grid",
  gap: "8px",
  color: "#334155",
  fontWeight: 600
};

const inputStyle = {
  minHeight: "50px",
  borderRadius: "14px",
  border: "1px solid #d7e3ef",
  padding: "0 14px",
  fontSize: "15px"
};

const toggleWrap = {
  marginTop: "22px",
  display: "inline-flex",
  gap: "8px",
  background: "#edf4f7",
  padding: "6px",
  borderRadius: "14px"
};

const toggleButton = {
  border: "none",
  background: "transparent",
  color: "#355164",
  padding: "10px 14px",
  borderRadius: "10px",
  fontWeight: 700,
  cursor: "pointer"
};

const activeToggle = {
  background: "#ffffff",
  color: "#102542",
  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)"
};

const buttonStyle = {
  border: "none",
  borderRadius: "14px",
  background: "#102542",
  color: "#ffffff",
  padding: "14px 18px",
  fontWeight: 700,
  cursor: "pointer"
};

const hintBox = {
  marginTop: "24px",
  padding: "16px",
  borderRadius: "18px",
  background: "#f8fbff",
  color: "#475569",
  display: "grid",
  gap: "8px"
};
