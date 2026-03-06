/**
 * @fileoverview Root application component for ZoneWise.AI Loan Platform.
 * Manages portal switching between applicant and admin views,
 * including server-side admin role verification and password re-authentication.
 * @module App
 */
import { useState, useEffect } from "react";
import { AuthGate, useAuth } from "./Auth";
import { supabase } from "./supabase";
import { COLORS } from "./utils/constants.js";
import { ApplicantPortal } from "./components/applicant/ApplicantPortal";
import { AdminPortal } from "./components/admin/AdminPortal";

const B = COLORS;

/**
 * Root application component that handles portal routing and admin authentication.
 * Checks user_roles table for admin privileges and requires password re-entry
 * before granting admin access.
 * @returns {JSX.Element} The rendered applicant or admin portal wrapped in AuthGate
 */
export default function App() {
  const { user } = useAuth();
  const [portal, setPortal] = useState("applicant");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          setUserIsAdmin(data?.role === "admin");
          setAdminChecked(true);
        })
        .catch(() => {
          setUserIsAdmin(false);
          setAdminChecked(true);
        });
    }
  }, [user]);

  const handleAdminLogin = async () => {
    setAdminErr("");
    setAdminLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: adminPw,
      });
      if (error) {
        setAdminErr("Invalid password. Admin access denied.");
        setAdminLoading(false);
        return;
      }
      setAdminAuthed(true);
      setPortal("admin");
      setAdminLoading(false);
      setAdminPw("");
    } catch (err) {
      setAdminErr("Authentication error. Please try again.");
      setAdminLoading(false);
    }
  };

  if (portal === "admin" && userIsAdmin && !adminAuthed) {
    return (
      <AuthGate>
        <div
          style={{
            minHeight: "100vh",
            background: `linear-gradient(160deg,${B.navyDeep},${B.navy},${B.navyMid})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div style={{ width: "100%", maxWidth: 400 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    background: `linear-gradient(135deg,${B.orange},${B.orangeLight})`,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Fraunces',Georgia,serif",
                    fontWeight: 900,
                    fontSize: 19,
                    color: B.navyDeep,
                  }}
                >
                  Z
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                    ZoneWise.AI
                  </div>
                  <div
                    style={{
                      color: B.orangeLight,
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    Admin Console
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 32,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
                <h2
                  style={{
                    fontFamily: "'Fraunces',Georgia,serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 4,
                  }}
                >
                  Administrator Access
                </h2>
                <p style={{ color: B.s400, fontSize: 12 }}>
                  Re-enter your password to access the operations portal
                </p>
              </div>
              <div
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.15)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 16,
                  fontSize: 11,
                  color: B.orangeLight,
                  textAlign: "center",
                }}
              >
                🏦 Authorized: {user.email}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: B.s300,
                    marginBottom: 5,
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={adminPw}
                  onChange={(e) => setAdminPw(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 14,
                    color: "#fff",
                    background: "rgba(255,255,255,0.06)",
                    outline: "none",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
              {adminErr && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 14,
                    fontSize: 12,
                    color: "#fca5a5",
                  }}
                >
                  ⚠️ {adminErr}
                </div>
              )}
              <button
                onClick={handleAdminLogin}
                disabled={adminLoading || !adminPw}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: adminLoading ? "not-allowed" : "pointer",
                  border: "none",
                  background: adminLoading
                    ? "rgba(255,255,255,0.1)"
                    : `linear-gradient(135deg,${B.orange},${B.orangeLight})`,
                  color: adminLoading ? B.s400 : B.navyDeep,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  boxShadow: adminLoading
                    ? "none"
                    : "0 4px 16px rgba(245,158,11,0.3)",
                  opacity: !adminPw ? 0.4 : 1,
                }}
              >
                {adminLoading ? "Verifying..." : "Unlock Admin Console"}
              </button>
              <button
                onClick={() => {
                  setPortal("applicant");
                  setAdminErr("");
                  setAdminPw("");
                }}
                style={{
                  width: "100%",
                  marginTop: 10,
                  padding: "8px",
                  background: "none",
                  border: "none",
                  color: B.s400,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}
              >
                ← Back to Applicant Portal
              </button>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: 16,
                color: B.s600,
                fontSize: 10,
              }}
            >
              🔒 Admin access restricted to authorized personnel only
            </div>
          </div>
        </div>
      </AuthGate>
    );
  }

  if (portal === "admin" && !userIsAdmin) {
    setPortal("applicant");
  }

  return (
    <AuthGate>
      {portal === "admin" && adminAuthed ? (
        <AdminPortal
          onSwitch={() => {
            setPortal("applicant");
            setAdminAuthed(false);
          }}
        />
      ) : (
        <ApplicantPortal
          onSwitch={userIsAdmin ? () => setPortal("admin") : null}
        />
      )}
    </AuthGate>
  );
}
