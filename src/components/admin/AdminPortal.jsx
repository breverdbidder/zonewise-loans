/**
 * @fileoverview Admin portal shell with view routing
 * @module components/admin/AdminPortal
 */
import { useState } from "react";
import { COLORS } from "../../utils/constants.js";
import { MOCK } from "../../utils/mockData.js";
import { runAIUnderwriting } from "../../scoring/index.js";
import { Logo } from "../shared/Logo.jsx";
import { Btn } from "../shared/Btn.jsx";
import { AdminDashboard } from "./AdminDashboard.jsx";
import { AdminDetail } from "./AdminDetail.jsx";
import { AdminUnderwriting } from "./AdminUnderwriting.jsx";
const B = COLORS;

/**
 * Admin operations portal
 * @param {Object} props
 * @param {Function} props.onSwitch - Callback to switch to applicant view
 * @returns {JSX.Element}
 */
export function AdminPortal({ onSwitch }) {
  const [view, setView] = useState("dashboard");
  const [apps, setApps] = useState(MOCK);
  const [sel, setSel] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const openApp = (a) => {
    setSel(a); setView("detail"); setAiResult(null);
  };

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
          <AdminDashboard
            apps={apps}
            openApp={openApp}
          />
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
      </div>
    </div>
  );
}
