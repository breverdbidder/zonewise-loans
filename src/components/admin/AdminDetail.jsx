/**
 * @fileoverview Admin single application detail view
 * @module components/admin/AdminDetail
 */
import { COLORS, LOAN_TYPES } from "../../utils/constants.js";
import { Card } from "../shared/Card.jsx";
import { Btn } from "../shared/Btn.jsx";
import { StatusBadge } from "../shared/StatusBadge.jsx";
const B = COLORS;

/**
 * Detailed view of a single loan application
 * @param {Object} props
 * @param {Object} props.sel - Selected application
 * @param {Function} props.setView - Set admin view
 * @param {Function} props.setSel - Set selected app
 * @param {Function} props.doUnderwrite - Trigger AI underwriting
 * @returns {JSX.Element}
 */
export function AdminDetail({ sel, setView, setSel, doUnderwrite }) {
  const lt = LOAN_TYPES[sel.loanType];

  const financialTitle = lt.financialTitle || "Financial Summary";

  const financialItems = sel.loanType === "dscr" ? [
    ["Monthly Rent", `$${sel.monthlyRent?.toLocaleString() || "—"}`],
    ["DSCR", `${sel.dscrRatio?.toFixed(2) || "—"}x`],
    ["Loan Amt", `$${sel.loanAmt?.toLocaleString()}`],
    ["Purchase", `$${sel.purchasePrice?.toLocaleString()}`],
    ["LTV", `${sel.purchasePrice > 0
      ? ((sel.loanAmt / sel.purchasePrice) * 100).toFixed(1) : 0}%`],
    ["Rate Type", {
      fixed30: "30yr Fixed", arm51: "5/1 ARM",
      arm71: "7/1 ARM",
    }[sel.rateType] || "—"],
    ["Credit", sel.credit],
    ["Liquid", `$${sel.liquid?.toLocaleString()}`],
    ["Ann. Taxes", `$${sel.annualTaxes?.toLocaleString() || "—"}`],
    ["Ann. Insurance", `$${sel.annualInsurance?.toLocaleString() || "—"}`],
    ["Rental Type", {
      longterm: "Long-Term", shortterm: "Short-Term",
      midterm: "Mid-Term",
    }[sel.rentalType] || "—"],
    ["Experience", sel.experience],
  ] : sel.loanType === "nodoc" ? [
    ["Program", {
      bankstatement: "Bank Stmt", asset_depletion: "Asset Depl.",
      profit_loss: "P&L", nina: "NINA",
    }[sel.noDocSubtype] || "—"],
    ["Loan Amt", `$${sel.loanAmt?.toLocaleString()}`],
    ["Purchase", `$${sel.purchasePrice?.toLocaleString()}`],
    ["LTV", `${sel.purchasePrice > 0
      ? ((sel.loanAmt / sel.purchasePrice) * 100).toFixed(1) : 0}%`],
    ["Avg Deposits", sel.avgMonthlyDeposits
      ? `$${sel.avgMonthlyDeposits?.toLocaleString()}/mo` : "—"],
    ["Stmt Period", sel.statementPeriod
      ? `${sel.statementPeriod} mo` : "—"],
    ["Credit", sel.credit],
    ["Liquid", `$${sel.liquid?.toLocaleString()}`],
    ["Occupancy", {
      investment: "Investment", primary: "Primary",
      second: "Second Home",
    }[sel.occupancy] || "—"],
    ["Down %", `${sel.purchasePrice > 0
      ? ((1 - sel.loanAmt / sel.purchasePrice) * 100).toFixed(0) : 0}%`],
    ["Experience", sel.experience],
    ["Term", sel.term],
  ] : sel.loanType === "construction" ? [
    ["Land Value", `$${sel.lotValue?.toLocaleString() || "—"}`],
    ["Loan Amt", `$${sel.loanAmt?.toLocaleString()}`],
    ["Hard Costs", `$${sel.hardCosts?.toLocaleString() || "—"}`],
    ["Soft Costs", `$${sel.softCosts?.toLocaleString() || "—"}`],
    ["Total Budget", `$${sel.totalBudget?.toLocaleString() || "—"}`],
    ["Completed Val", `$${(sel.completedValue || sel.arv)?.toLocaleString() || "—"}`],
    ["LTC", `${sel.totalBudget > 0
      ? ((sel.loanAmt / (sel.lotValue + sel.totalBudget)) * 100).toFixed(1) : 0}%`],
    ["LTV (Completed)", `${(sel.completedValue || sel.arv) > 0
      ? ((sel.loanAmt / (sel.completedValue || sel.arv)) * 100).toFixed(1) : 0}%`],
    ["Timeline", `${sel.term} Mo`],
    ["Credit", sel.credit],
    ["Liquid", `$${sel.liquid?.toLocaleString()}`],
    ["Experience", sel.experience],
  ] : [
    ["Purchase", `$${sel.purchasePrice?.toLocaleString()}`],
    ["Loan", `$${sel.loanAmt?.toLocaleString()}`],
    ["ARV", `$${sel.arv?.toLocaleString()}`],
    ["Rehab", `$${sel.repairBudget?.toLocaleString()}`],
    ["LTV", `${sel.purchasePrice > 0
      ? ((sel.loanAmt / sel.purchasePrice) * 100).toFixed(1) : 0}%`],
    ["ARV LTV", `${sel.arv > 0
      ? ((sel.loanAmt / sel.arv) * 100).toFixed(1) : 0}%`],
    ["Credit", sel.credit],
    ["Liquid", `$${sel.liquid?.toLocaleString()}`],
  ];

  const infoCards = [
    {
      i: "👤", t: "Borrower",
      items: [
        ["Name", sel.name], ["Email", sel.email],
        ["Phone", sel.phone], ["Entity", sel.entity],
        ["Submitted", sel.submitted],
      ],
    },
    {
      i: "🏠", t: "Property",
      items: [
        ["Address", sel.propAddr],
        ["Type", sel.propType],
        ["Condition", sel.condition],
        ["Docs", `${sel.uploads} files`],
        ...(sel.loanType === "construction" ? [
          ["Construction", {
            ground_up: "Ground-Up", tear_down: "Tear-Down",
            major_reno: "Major Reno",
          }[sel.constructionType] || "—"],
          ["Permits", {
            approved: "✅ Approved", submitted: "⏳ Pending",
            not_applied: "❌ Not Applied",
          }[sel.permitStatus] || "—"],
          ["Plans", {
            complete: "✅ Stamped",
            in_progress: "⏳ In Progress",
          }[sel.plansStatus] || "—"],
        ] : []),
      ],
    },
  ];

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 20,
      }}>
        <Btn
          variant="back"
          onClick={() => { setView("dashboard"); setSel(null); }}
          style={{ padding: "6px 14px", fontSize: 12 }}
        >← Back</Btn>
        <h2 style={{
          fontFamily: "'Fraunces',Georgia,serif",
          fontSize: 22, fontWeight: 700,
          color: B.navyDeep, margin: 0,
        }}>Application {sel.id}</h2>
        <span style={{
          padding: "3px 10px", borderRadius: 100,
          fontSize: 10, fontWeight: 700,
          background: lt?.badgeBg || B.slate100,
          color: lt?.badgeColor || B.slate600,
          border: `1px solid ${lt?.badgeBorder || B.slate200}`,
        }}>
          {lt ? `${lt.icon} ${lt.label}` : sel.loanType}
        </span>
        <StatusBadge status={sel.status} />
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
      }}>
        {infoCards.map((s) => (
          <Card key={s.t}>
            <div style={{ padding: 20 }}>
              <div style={{
                fontWeight: 700, color: B.navyDeep,
                marginBottom: 12, fontSize: 14,
              }}>{s.i} {s.t}</div>
              {s.items.map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 13, padding: "5px 0",
                  borderBottom: `1px solid ${B.slate100}`,
                }}>
                  <span style={{ color: B.slate400 }}>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ padding: 20 }}>
          <div style={{
            fontWeight: 700, color: B.navyDeep,
            marginBottom: 14, fontSize: 14,
          }}>💰 {financialTitle}</div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
          }}>
            {financialItems.map(([k, v]) => (
              <div key={k} style={{
                background: B.slate50, borderRadius: 8,
                padding: 14, border: `1px solid ${B.slate200}`,
              }}>
                <div style={{
                  fontSize: 10, textTransform: "uppercase",
                  letterSpacing: 1, color: B.slate400,
                  fontWeight: 600,
                }}>{k}</div>
                <div style={{
                  fontSize: 18, fontWeight: 700, color: B.navy,
                  fontFamily: "'JetBrains Mono',monospace",
                  marginTop: 2,
                }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div style={{
        display: "flex", gap: 12, marginTop: 20,
        justifyContent: "center",
      }}>
        <Btn
          variant="orange" onClick={doUnderwrite}
          style={{ padding: "14px 36px", fontSize: 15 }}
        >🤖 Run AI Underwriting Analysis</Btn>
      </div>
    </div>
  );
}
