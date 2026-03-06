/**
 * @fileoverview AI underwriting results and pitch deck view
 * @module components/admin/AdminUnderwriting
 */
import { COLORS } from "../../utils/constants.js";
import { Card, CardHead } from "../shared/Card.jsx";
import { Btn } from "../shared/Btn.jsx";
import { scoreColor } from "../shared/StatusBadge.jsx";
const B = COLORS;

/**
 * AI underwriting results display
 * @param {Object} props
 * @param {Object} props.sel - Selected application
 * @param {boolean} props.aiLoading - Loading state
 * @param {Object|null} props.aiResult - AI underwriting result
 * @param {Function} props.setView - Set admin view
 * @param {Function} props.setApps - Update apps state
 * @returns {JSX.Element}
 */
export function AdminUnderwriting({
  sel, aiLoading, aiResult, setView, setApps,
}) {
  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 20,
      }}>
        <Btn
          variant="back" onClick={() => setView("detail")}
          style={{ padding: "6px 14px", fontSize: 12 }}
        >← Back</Btn>
        <h2 style={{
          fontFamily: "'Fraunces',Georgia,serif",
          fontSize: 22, fontWeight: 700,
          color: B.navyDeep, margin: 0,
        }}>AI Underwriting — {sel?.id}</h2>
      </div>

      {aiLoading ? (
        <Card>
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{
              width: 44, height: 44,
              border: `3px solid ${B.orangeGlow}`,
              borderTopColor: B.orange, borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{
              fontWeight: 700, fontSize: 16, color: B.navy,
            }}>Analyzing Deal with AI Engine…</div>
            <div style={{
              fontSize: 12, color: B.slate400, marginTop: 6,
            }}>Evaluating LTV, borrower profile, exit viability, market conditions</div>
          </div>
        </Card>
      ) : aiResult && (
        <div>
          {/* Score Ring */}
          <div style={{
            background: `linear-gradient(135deg,${B.navyDeep},${B.navy})`,
            borderRadius: 16, padding: 28, color: "#fff",
            marginBottom: 16, textAlign: "center",
          }}>
            <div style={{
              color: B.orangeLight,
              fontFamily: "'Fraunces',Georgia,serif",
              fontSize: 18, fontWeight: 700, marginBottom: 16,
            }}>ZoneWise.AI Underwriting Score</div>
            <div style={{
              width: 140, height: 140, borderRadius: "50%",
              margin: "0 auto 16px",
              background: `conic-gradient(${scoreColor(aiResult.score)} 0% ${aiResult.score}%, rgba(255,255,255,0.1) ${aiResult.score}% 100%)`,
              display: "flex", alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{
                width: 110, height: 110, borderRadius: "50%",
                background: B.navyDeep,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 38, fontWeight: 700,
                }}>{aiResult.score}</div>
                <div style={{
                  fontSize: 10, textTransform: "uppercase",
                  letterSpacing: 1.5, color: B.slate400,
                }}>of 100</div>
              </div>
            </div>
            {/* Verdict Badge */}
            <div style={{
              padding: "16px 24px", borderRadius: 10,
              display: "inline-block",
              background: aiResult.verdict === "APPROVE"
                ? "rgba(16,185,129,0.12)"
                : aiResult.verdict === "DECLINE"
                  ? "rgba(239,68,68,0.12)"
                  : "rgba(245,158,11,0.12)",
              border: `1px solid ${
                aiResult.verdict === "APPROVE"
                  ? "rgba(16,185,129,0.25)"
                  : aiResult.verdict === "DECLINE"
                    ? "rgba(239,68,68,0.25)"
                    : "rgba(245,158,11,0.25)"}`,
            }}>
              <div style={{
                fontFamily: "'Fraunces',Georgia,serif",
                fontSize: 20, fontWeight: 700,
                color: scoreColor(aiResult.score),
              }}>
                {aiResult.verdict === "APPROVE" ? "✅ APPROVED"
                  : aiResult.verdict === "CONDITIONAL_APPROVE"
                    ? "⚡ CONDITIONAL APPROVAL"
                    : aiResult.verdict === "DECLINE"
                      ? "❌ DECLINED" : "🔍 FURTHER REVIEW"}
              </div>
              <div style={{
                fontSize: 13, color: B.slate300, marginTop: 4,
                maxWidth: 500,
              }}>{aiResult.verdict_summary}</div>
            </div>
          </div>

          {/* Recommended Terms */}
          <div style={{
            background: `linear-gradient(135deg,${B.navyDeep},${B.navy})`,
            borderRadius: 16, padding: 24, color: "#fff",
            marginBottom: 16,
          }}>
            <div style={{
              color: B.orangeLight,
              fontFamily: "'Fraunces',Georgia,serif",
              fontSize: 16, fontWeight: 700, marginBottom: 14,
            }}>Recommended Terms</div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4,1fr)",
              gap: 12,
            }}>
              {[
                ["Approval Prob.",
                  `${aiResult.approval_probability}%`,
                  aiResult.approval_probability >= 75
                    ? B.green : B.orange],
                ["Rate", aiResult.recommended_rate, B.orangeLight],
                ["Max LTV", aiResult.recommended_ltv_cap, "#fff"],
                ["Term", aiResult.recommended_term, "#fff"],
              ].map(([l, v, c]) => (
                <div key={l} style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: 16,
                }}>
                  <div style={{
                    fontSize: 10, textTransform: "uppercase",
                    letterSpacing: 1.5, color: B.slate400,
                    fontWeight: 600,
                  }}>{l}</div>
                  <div style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 24, fontWeight: 700, color: c,
                    marginTop: 4,
                  }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis */}
          <Card>
            <CardHead
              title="🤖 AI Analysis"
              sub="Deal evaluation and recommendations"
            />
            <div style={{ padding: "8px 24px 24px" }}>
              {aiResult.strengths?.map((s, i) => (
                <div key={`s${i}`} style={{
                  background: B.greenLight,
                  borderLeft: `3px solid ${B.green}`,
                  borderRadius: 8, padding: "12px 16px",
                  marginBottom: 8, fontSize: 13, lineHeight: 1.7,
                }}>
                  <strong style={{ color: "#065f46" }}>
                    ✅ Strength:
                  </strong> {s}
                </div>
              ))}
              {aiResult.risks?.map((r, i) => (
                <div key={`r${i}`} style={{
                  background: B.redLight,
                  borderLeft: `3px solid ${B.red}`,
                  borderRadius: 8, padding: "12px 16px",
                  marginBottom: 8, fontSize: 13, lineHeight: 1.7,
                }}>
                  <strong style={{ color: "#991b1b" }}>
                    ⚠️ Risk:
                  </strong> {r}
                </div>
              ))}
              {aiResult.conditions?.map((c, i) => (
                <div key={`c${i}`} style={{
                  background: B.amberLight,
                  borderLeft: `3px solid ${B.amber}`,
                  borderRadius: 8, padding: "12px 16px",
                  marginBottom: 8, fontSize: 13, lineHeight: 1.7,
                }}>
                  <strong style={{ color: "#92400e" }}>
                    📋 Condition:
                  </strong> {c}
                </div>
              ))}
              {[
                ["Exit Viability", aiResult.exit_viability],
                ["Market Commentary", aiResult.market_commentary],
              ].map(([t, v]) => (
                <div key={t} style={{
                  background: B.slate50, borderRadius: 10,
                  padding: 16, marginTop: 10,
                  border: `1px solid ${B.slate200}`,
                }}>
                  <div style={{
                    fontWeight: 700, fontSize: 13,
                    color: B.navyDeep, marginBottom: 6,
                  }}>{t}</div>
                  <p style={{
                    fontSize: 13, color: B.slate600,
                    margin: 0, lineHeight: 1.6,
                  }}>{v}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Pitch Deck — 4 slides */}
          <Card>
            <CardHead
              title="📊 Auto-Generated Pitch Deck"
              sub="Ready for lender submission"
            />
            <div style={{ padding: "8px 24px 24px" }}>
              <div style={{ display: "grid", gap: 16 }}>
                {/* Slide 1: Cover */}
                <div style={{
                  aspectRatio: "16/9",
                  background: `linear-gradient(135deg,${B.navyDeep},${B.navy},${B.navyMid})`,
                  borderRadius: 14, position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}>
                  <div style={{
                    position: "absolute", top: 0, right: 0,
                    width: "40%", height: "100%",
                    background: `linear-gradient(135deg,transparent,${B.orangeGlow})`,
                  }} />
                  <div style={{
                    position: "absolute", inset: 0,
                    padding: "0 40px",
                    display: "flex", flexDirection: "column",
                    justifyContent: "flex-end", paddingBottom: 40,
                  }}>
                    <div style={{
                      fontSize: 10, textTransform: "uppercase",
                      letterSpacing: 2, color: B.orange,
                      fontWeight: 700, marginBottom: 8,
                    }}>Loan Application</div>
                    <div style={{
                      fontFamily: "'Fraunces',Georgia,serif",
                      fontSize: 28, fontWeight: 700, color: "#fff",
                      marginBottom: 4,
                    }}>Hard Money Residential Loan</div>
                    <div style={{
                      fontSize: 13, color: B.slate400,
                    }}>{sel.name} — {sel.entity}</div>
                    <div style={{
                      fontSize: 12, color: B.slate400, marginTop: 4,
                    }}>{sel.propAddr}</div>
                  </div>
                </div>

                {/* Slide 2: Deal Overview */}
                <div style={{
                  aspectRatio: "16/9", background: "#fff",
                  borderRadius: 14, position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  border: `1px solid ${B.slate200}`,
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    padding: "36px 40px",
                    display: "flex", flexDirection: "column",
                  }}>
                    <div style={{
                      fontSize: 10, textTransform: "uppercase",
                      letterSpacing: 2, color: B.orange,
                      fontWeight: 700, marginBottom: 8,
                    }}>Deal Overview</div>
                    <div style={{
                      fontFamily: "'Fraunces',Georgia,serif",
                      fontSize: 24, fontWeight: 700,
                      color: B.navyDeep, marginBottom: 8,
                    }}>Investment Opportunity</div>
                    <p style={{
                      fontSize: 13, color: B.slate600,
                      lineHeight: 1.7, maxWidth: 560,
                    }}>{aiResult.deal_summary}</p>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 14, marginTop: "auto",
                    }}>
                      {[
                        ["Purchase Price", `$${sel.purchasePrice?.toLocaleString()}`],
                        ["Loan Amount", `$${sel.loanAmt?.toLocaleString()}`],
                        ["After Repair Value", `$${sel.arv?.toLocaleString()}`],
                      ].map(([l, v]) => (
                        <div key={l} style={{
                          background: B.slate50, borderRadius: 10,
                          padding: 14, textAlign: "center",
                          border: `1px solid ${B.slate200}`,
                        }}>
                          <div style={{
                            fontFamily: "'JetBrains Mono',monospace",
                            fontSize: 20, fontWeight: 700,
                            color: B.navy,
                          }}>{v}</div>
                          <div style={{
                            fontSize: 10, textTransform: "uppercase",
                            letterSpacing: 1, color: B.slate400,
                            marginTop: 4,
                          }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Slide 3: Financial Structure */}
                <div style={{
                  aspectRatio: "16/9",
                  background: `linear-gradient(135deg,${B.navyDeep},${B.navy})`,
                  borderRadius: 14, position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    padding: "36px 40px",
                    display: "flex", flexDirection: "column",
                  }}>
                    <div style={{
                      fontSize: 10, textTransform: "uppercase",
                      letterSpacing: 2, color: B.orange,
                      fontWeight: 700, marginBottom: 8,
                    }}>Financial Structure</div>
                    <div style={{
                      fontFamily: "'Fraunces',Georgia,serif",
                      fontSize: 24, fontWeight: 700, color: "#fff",
                      marginBottom: 16,
                    }}>Loan & Investment Metrics</div>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 12, flex: 1, alignContent: "center",
                    }}>
                      {[
                        ["LTV", `${sel.purchasePrice > 0 ? ((sel.loanAmt / sel.purchasePrice) * 100).toFixed(1) : 0}%`],
                        ["ARV LTV", `${sel.arv > 0 ? ((sel.loanAmt / sel.arv) * 100).toFixed(1) : 0}%`],
                        ["Rehab", `$${sel.repairBudget?.toLocaleString()}`],
                        ["Term", `${sel.term} Mo`],
                        ["Spread", `$${((sel.arv || 0) - (sel.purchasePrice || 0) - (sel.repairBudget || 0)).toLocaleString()}`],
                        ["Credit", sel.credit],
                        ["Liquid", `$${sel.liquid?.toLocaleString()}`],
                        ["Exp.", sel.experience],
                      ].map(([l, v]) => (
                        <div key={l} style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 10, padding: 14,
                          textAlign: "center",
                        }}>
                          <div style={{
                            fontFamily: "'JetBrains Mono',monospace",
                            fontSize: 17, fontWeight: 700,
                            color: B.orangeLight,
                          }}>{v}</div>
                          <div style={{
                            fontSize: 9, textTransform: "uppercase",
                            letterSpacing: 1, color: B.slate400,
                            marginTop: 4,
                          }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Slide 4: AI Score */}
                <div style={{
                  aspectRatio: "16/9",
                  background: `linear-gradient(135deg,${B.navyDeep},${B.navy})`,
                  borderRadius: 14, position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    padding: "32px 40px",
                    display: "flex", flexDirection: "column",
                  }}>
                    <div style={{
                      fontSize: 10, textTransform: "uppercase",
                      letterSpacing: 2, color: B.orange,
                      fontWeight: 700, marginBottom: 8,
                    }}>AI Underwriting</div>
                    <div style={{
                      fontFamily: "'Fraunces',Georgia,serif",
                      fontSize: 24, fontWeight: 700, color: "#fff",
                      marginBottom: 12,
                    }}>ZoneWise.AI Analysis</div>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "160px 1fr",
                      gap: 24, flex: 1,
                    }}>
                      <div style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{
                          width: 120, height: 120,
                          borderRadius: "50%",
                          background: `conic-gradient(${scoreColor(aiResult.score)} 0% ${aiResult.score}%, rgba(255,255,255,0.1) ${aiResult.score}% 100%)`,
                          display: "flex", alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <div style={{
                            width: 94, height: 94,
                            borderRadius: "50%",
                            background: B.navyDeep,
                            display: "flex", flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            <div style={{
                              fontFamily: "'JetBrains Mono',monospace",
                              fontSize: 32, fontWeight: 700,
                              color: "#fff",
                            }}>{aiResult.score}</div>
                            <div style={{
                              fontSize: 9, color: B.slate400,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                            }}>Score</div>
                          </div>
                        </div>
                        <div style={{
                          marginTop: 10, padding: "6px 16px",
                          borderRadius: 100,
                          background: `rgba(${aiResult.score >= 80 ? "16,185,129" : "245,158,11"},0.15)`,
                          color: scoreColor(aiResult.score),
                          fontSize: 12, fontWeight: 700,
                        }}>{aiResult.approval_probability}% Approval</div>
                      </div>
                      <div style={{
                        display: "flex", flexDirection: "column",
                        gap: 6, justifyContent: "center",
                      }}>
                        {aiResult.strengths?.slice(0, 2).map((s, i) => (
                          <div key={i} style={{
                            background: "rgba(16,185,129,0.1)",
                            borderLeft: `3px solid ${B.green}`,
                            borderRadius: 6, padding: "7px 12px",
                            fontSize: 11, color: "#d1fae5",
                          }}>✅ {s}</div>
                        ))}
                        {aiResult.risks?.slice(0, 1).map((r, i) => (
                          <div key={i} style={{
                            background: "rgba(239,68,68,0.1)",
                            borderLeft: `3px solid ${B.red}`,
                            borderRadius: 6, padding: "7px 12px",
                            fontSize: 11, color: "#fee2e2",
                          }}>⚠️ {r}</div>
                        ))}
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 8, marginTop: 6,
                        }}>
                          {[
                            ["Rate", aiResult.recommended_rate],
                            ["Max LTV", aiResult.recommended_ltv_cap],
                            ["Term", aiResult.recommended_term],
                          ].map(([l, v]) => (
                            <div key={l} style={{
                              background: "rgba(255,255,255,0.06)",
                              borderRadius: 6, padding: "8px 10px",
                              textAlign: "center",
                            }}>
                              <div style={{
                                fontFamily: "'JetBrains Mono',monospace",
                                fontSize: 15, fontWeight: 700,
                                color: B.orangeLight,
                              }}>{v}</div>
                              <div style={{
                                fontSize: 9, color: B.slate400,
                                textTransform: "uppercase",
                                letterSpacing: 1,
                              }}>{l}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Approve/Decline Buttons */}
          <div style={{
            display: "flex", gap: 12, marginTop: 20,
            justifyContent: "center",
          }}>
            <Btn
              variant="success"
              onClick={() => {
                setApps((p) => p.map((a) =>
                  a.id === sel.id
                    ? { ...a, status: "approved" } : a
                ));
                setView("dashboard");
              }}
            >✅ Approve Loan</Btn>
            <Btn
              variant="danger"
              onClick={() => {
                setApps((p) => p.map((a) =>
                  a.id === sel.id
                    ? { ...a, status: "declined" } : a
                ));
                setView("dashboard");
              }}
            >❌ Decline</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
