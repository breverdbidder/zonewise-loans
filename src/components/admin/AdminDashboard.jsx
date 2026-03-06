/**
 * @fileoverview Admin dashboard with stats cards and applications table
 * @module components/admin/AdminDashboard
 */
import { COLORS, LOAN_TYPES } from "../../utils/constants.js";
import { Card, CardHead } from "../shared/Card.jsx";
import { Btn } from "../shared/Btn.jsx";
import { StatusBadge, scoreColor } from "../shared/StatusBadge.jsx";
const B = COLORS;

/**
 * Admin dashboard view with summary stats and app table
 * @param {Object} props
 * @param {Array} props.apps - All loan applications
 * @param {Function} props.openApp - Open single app detail
 * @returns {JSX.Element}
 */
export function AdminDashboard({ apps, openApp }) {
  const stats = [
    { l: "Applications", v: apps.length, i: "📋", c: B.navy },
    {
      l: "Pending",
      v: apps.filter((a) => a.status === "pending").length,
      i: "⏳", c: B.amber,
    },
    {
      l: "Approved",
      v: apps.filter((a) => a.status === "approved").length,
      i: "✅", c: B.green,
    },
    {
      l: "Pipeline",
      v: `$${(apps.reduce((s, a) =>
        s + (a.loanAmt || 0), 0) / 1000).toFixed(0)}K`,
      i: "💰", c: B.orange,
    },
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        gap: 14, marginBottom: 20,
      }}>
        {stats.map((s) => (
          <Card key={s.l} style={{ marginBottom: 0 }}>
            <div style={{ padding: 18 }}>
              <div style={{
                fontSize: 11, color: B.slate400, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: 1,
              }}>{s.i} {s.l}</div>
              <div style={{
                fontSize: 28, fontWeight: 800, color: s.c,
                fontFamily: "'JetBrains Mono',monospace",
                marginTop: 4,
              }}>{s.v}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Applications Table */}
      <Card>
        <CardHead
          title="Loan Applications"
          sub="Click to review and run AI underwriting"
        />
        <div style={{ padding: "8px 24px 24px", overflowX: "auto" }}>
          <table style={{
            width: "100%", borderCollapse: "collapse", fontSize: 13,
          }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${B.slate200}` }}>
                {["ID", "Borrower", "Type", "Property", "Loan",
                  "LTV", "Status", "Score", ""].map((h) => (
                  <th key={h} style={{
                    padding: "10px 12px", textAlign: "left",
                    fontSize: 11, fontWeight: 700, color: B.slate400,
                    textTransform: "uppercase", letterSpacing: 0.8,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => {
                const ltv = a.purchasePrice > 0
                  ? ((a.loanAmt / a.purchasePrice) * 100).toFixed(0)
                  : "—";
                const lt = LOAN_TYPES[a.loanType];
                return (
                  <tr
                    key={a.id}
                    onClick={() => openApp(a)}
                    style={{
                      borderBottom: `1px solid ${B.slate100}`,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      e.currentTarget.style.background = B.slate50}
                    onMouseLeave={(e) =>
                      e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{
                      padding: 12,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontWeight: 600, color: B.navy, fontSize: 12,
                    }}>{a.id}</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 600 }}>{a.name}</div>
                      <div style={{
                        fontSize: 11, color: B.slate400,
                      }}>{a.entity}</div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 100,
                        fontSize: 10, fontWeight: 700,
                        background: lt?.badgeBg || B.slate100,
                        color: lt?.badgeColor || B.slate600,
                        border: `1px solid ${lt?.badgeBorder || B.slate200}`,
                      }}>
                        {lt ? `${lt.icon} ${lt.label}` : a.loanType}
                      </span>
                    </td>
                    <td style={{
                      padding: 12, fontSize: 12, maxWidth: 200,
                      overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>{a.propAddr}</td>
                    <td style={{
                      padding: 12,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontWeight: 600,
                    }}>${(a.loanAmt / 1000).toFixed(0)}K</td>
                    <td style={{
                      padding: 12,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontWeight: 600,
                      color: parseFloat(ltv) <= 75 ? B.green : B.amber,
                    }}>{ltv}%</td>
                    <td style={{ padding: 12 }}>
                      <StatusBadge status={a.status} />
                    </td>
                    <td style={{ padding: 12 }}>
                      {a.score ? (
                        <span style={{
                          fontFamily: "'JetBrains Mono',monospace",
                          fontWeight: 700, fontSize: 16,
                          color: scoreColor(a.score),
                        }}>{a.score}</span>
                      ) : (
                        <span style={{
                          color: B.slate300, fontSize: 12,
                        }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: 12 }}>
                      <Btn
                        style={{ padding: "6px 14px", fontSize: 11 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openApp(a);
                        }}
                      >Review →</Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
