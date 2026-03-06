/**
 * @fileoverview Admin portal shell with view routing
 * @module components/admin/AdminPortal
 */
import { useState, useEffect } from "react";
import { COLORS } from "../../utils/constants.js";
import { fetchAdminApplications } from "../../utils/adminAuth.js";
import { runAIUnderwriting } from "../../scoring/index.js";
import { Logo } from "../shared/Logo.jsx";
import { Btn } from "../shared/Btn.jsx";
import { AdminDashboard } from "./AdminDashboard.jsx";
import { AdminDetail } from "./AdminDetail.jsx";
import { AdminUnderwriting } from "./AdminUnderwriting.jsx";
import { BetaPanel } from "./BetaPanel.jsx";
const B = COLORS;

/**
 * Admin operations portal
 * @param {Object} props
 * @param {Function} props.onSwitch - Callback to switch to applicant view
 * @returns {JSX.Element}
 */
export function AdminPortal({ onSwitch }) {
  const [view, setView] = useState("dashboard");
  const [apps, setApps] = useState([]);
  const [sel, setSel] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminApplications().then((rows) => {
      const mapped = rows.map((r) => ({
        id: r.ref_code || r.id,
        name: r.form_data?.firstName
          ? `${r.form_data.firstName} ${r.form_data.lastName}`
          : "Unknown",
        email: r.form_data?.email || "",
        phone: r.form_data?.phone || "",
        entity: r.form_data?.entityType || "",
        propAddr: r.form_data?.propAddr || "",
        propType: r.form_data?.propType || "",
        loanType: r.loan_type || r.form_data?.loanType || "hardmoney",
        purchasePrice: r.form_data?.purchasePrice || 0,
        loanAmt: r.form_data?.loanAmt || 0,
        arv: r.form_data?.arv || 0,
        repairBudget: r.form_data?.repairBudget || 0,
        credit: r.form_data?.credit || "",
        experience: r.form_data?.experience || "",
        liquid: r.form_data?.liquid || 0,
        status: r.status || "pending",
        submitted: r.created_at?.slice(0, 10) || "",
        uploads: r.uploads_count || 0,
        score: r.ai_score || null,
        ...r.form_data,
      }));
      setApps(mapped);
      setLoading(false);
    });
  }, []);

  /**
   * Opens a single application in the detail view.
   * @param {Object} a - Application object to display
   */
  const openApp = (a) => {
    setSel(a); setView("detail"); setAiResult(null);
  };

  /**
   * Runs AI underwriting on the selected application and updates state.
   * @returns {Promise<void>}
   */
  const doUnderwrite = async () => {
    if (!sel) return;
    setAiLoading(true);
    setView("underwriting");
    const result = await runAIUnderwriting(sel);
    setAiResult(result);
    setApps((p) => p.map((a) =>
      a.id === sel.id
        ? {
            ...a,
            score: result.score,
            status: result.verdict === "APPROVE" ? "approved"
              : result.verdict === "DECLINE" ? "declined" : "reviewed",
          }
        : a
    ));
    setAiLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: B.slate50 }}>
      <header style={{
        background: `linear-gradient(145deg,${B.navyDeep},${B.navy})`,
        borderBottom: `3px solid ${B.orange}`,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "14px 28px",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 20,
          }}>
            <Logo size="sm" />
            <div style={{
              height: 24, width: 1,
              background: "rgba(255,255,255,0.15)",
            }} />
            <span style={{
              color: B.slate300, fontSize: 12, fontWeight: 600,
              letterSpacing: 1, textTransform: "uppercase",
            }}>Admin Console</span>
          </div>
          <div style={{
            display: "flex", gap: 10, alignItems: "center",
          }}>
            <span style={{ color: B.slate400, fontSize: 12 }}>
              Ariel Shapira
            </span>
            <Btn
              variant="ghost"
              onClick={() => setView("dashboard")}
              style={{
                color: view === "dashboard" ? B.orange : B.slate400,
                borderColor: view === "dashboard"
                  ? "rgba(245,158,11,0.4)"
                  : "rgba(255,255,255,0.15)",
                fontSize: 11,
              }}
            >📋 Dashboard</Btn>
            <Btn
              variant="ghost"
              onClick={() => setView("beta")}
              style={{
                color: view === "beta" ? B.orange : B.slate400,
                borderColor: view === "beta"
                  ? "rgba(245,158,11,0.4)"
                  : "rgba(255,255,255,0.15)",
                fontSize: 11,
              }}
            >📣 Beta Comms</Btn>
            <Btn
              variant="ghost" onClick={onSwitch}
              style={{
                color: B.slate400,
                borderColor: "rgba(255,255,255,0.15)",
                fontSize: 11,
              }}
            >← Applicant View</Btn>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "24px 20px 60px",
      }}>
        {view === "dashboard" && (
          loading ? (
            <div style={{
              textAlign: "center", padding: 60, color: B.slate400,
            }}>Loading applications...</div>
          ) : (
            <AdminDashboard
              apps={apps}
              openApp={openApp}
            />
          )
        )}
        {view === "detail" && sel && (
          <AdminDetail
            sel={sel}
            setView={setView}
            setSel={setSel}
            doUnderwrite={doUnderwrite}
          />
        )}
        {view === "underwriting" && (
          <AdminUnderwriting
            sel={sel}
            aiLoading={aiLoading}
            aiResult={aiResult}
            setView={setView}
            setApps={setApps}
          />
        )}
        {view === "beta" && (
          <BetaPanel />
        )}
      </div>
    </div>
  );
}
