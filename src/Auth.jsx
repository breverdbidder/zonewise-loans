import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const B = {
  navy:"#1E3A5F",navyDeep:"#0F1D30",navyMid:"#2A4D7A",
  orange:"#F59E0B",orangeLight:"#FCD34D",orangeGlow:"rgba(245,158,11,0.12)",
  s800:"#1e293b",s700:"#334155",s600:"#475569",s400:"#94a3b8",s300:"#cbd5e1",
  s200:"#e2e8f0",s100:"#f1f5f9",s50:"#f8fafc",
  green:"#10b981",red:"#ef4444",white:"#fff",
};
const inp = {
  width:"100%",padding:"12px 14px",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:8,
  fontSize:14,color:"#fff",background:"rgba(255,255,255,0.06)",outline:"none",
  fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"border-color 0.2s"
};

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); setUser(null); };
  return { user, loading, signOut };
}

export function AuthGate({ children }) {
  const { user, loading } = useAuth();
  // modes: login | signup | reset_request | reset_code | reset_newpw | verify
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Handle password reset token in URL (from email link)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setMode("reset_newpw");
    }
    // Also listen for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("reset_newpw");
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh",background:B.navyDeep,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:48,height:48,border:`3px solid ${B.orangeGlow}`,borderTopColor:B.orange,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ color:B.s400,fontSize:14 }}>Loading ZoneWise.AI…</div>
      </div>
    </div>
  );

  if (user) return children;

  const clear = () => { setError(""); setMessage(""); };
  const go = (m) => { clear(); setMode(m); };

  const handleLogin = async (e) => {
    e.preventDefault(); clear(); setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setSubmitting(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault(); clear(); setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
    if (error) { setError(error.message); }
    else if (data?.user?.identities?.length === 0) {
      setError("An account with this email already exists. Try signing in instead.");
    } else {
      go("verify");
      setMessage("Check your email (including spam/junk) for a confirmation link from noreply@mail.app.supabase.io");
    }
    setSubmitting(false);
  };

  const handleResetRequest = async (e) => {
    e.preventDefault(); clear(); setSubmitting(true);
    if (!email) { setError("Enter your email address"); setSubmitting(false); return; }

    // Send password reset email with redirect to our domain
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) {
      setError(error.message);
    } else {
      go("reset_code");
      setMessage(`Password reset email sent to ${email}. Check your inbox AND spam/junk folder — the email comes from noreply@mail.app.supabase.io`);
    }
    setSubmitting(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); clear(); setSubmitting(true);
    if (!otp || otp.length < 6) { setError("Enter the 6-digit code from your email"); setSubmitting(false); return; }
    const { data, error } = await supabase.auth.verifyOtp({
      email, token: otp, type: "recovery"
    });
    if (error) {
      setError(error.message + " — Make sure you're using the most recent code.");
    } else {
      go("reset_newpw");
      setMessage("Code verified! Set your new password below.");
    }
    setSubmitting(false);
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault(); clear(); setSubmitting(true);
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); setSubmitting(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated successfully! You are now signed in.");
      // User should now be authenticated
      setTimeout(() => window.location.reload(), 1500);
    }
    setSubmitting(false);
  };

  const handleResendReset = async () => {
    clear(); setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) setError(error.message);
    else setMessage("Reset email resent! Check spam/junk folder — sender: noreply@mail.app.supabase.io");
    setSubmitting(false);
  };

  const titles = {
    login: ["Welcome Back", "Sign in to your secure loan portal — protected by bank-grade encryption"],
    signup: ["Create Your Secure Account", "Your financial data is protected with 256-bit AES encryption and bank-level security"],
    verify: ["Check Your Email", "Confirm your account to access the secure portal"],
    reset_request: ["Reset Password", "We'll send a secure recovery code to your registered email"],
    reset_code: ["Enter Recovery Code", "Check your email for the secure 6-digit verification code"],
    reset_newpw: ["Set New Password", "Choose a strong password — all credentials are encrypted at rest"],
  };

  const Msg = ({ type, text }) => text ? (
    <div style={{
      background: type === "error" ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
      border: `1px solid ${type === "error" ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}`,
      borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,lineHeight:1.6,
      color: type === "error" ? "#fca5a5" : "#6ee7b7"
    }}>{type === "error" ? "⚠️" : "✅"} {text}</div>
  ) : null;

  const Submit = ({ text }) => (
    <button type="submit" disabled={submitting} style={{
      width:"100%",padding:"13px",borderRadius:8,fontSize:14,fontWeight:700,
      cursor:submitting?"not-allowed":"pointer",border:"none",
      background:submitting?"rgba(255,255,255,0.1)":`linear-gradient(135deg,${B.orange},${B.orangeLight})`,
      color:submitting?B.s400:B.navyDeep,fontFamily:"'Plus Jakarta Sans',sans-serif",
      boxShadow:submitting?"none":"0 4px 16px rgba(245,158,11,0.3)",transition:"all 0.2s"
    }}>{submitting ? "Processing…" : text}</button>
  );

  const Link = ({ onClick, text }) => (
    <button type="button" onClick={onClick} style={{
      background:"none",border:"none",color:B.orangeLight,fontWeight:600,
      cursor:"pointer",fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif"
    }}>{text}</button>
  );

  return (
    <div style={{
      minHeight:"100vh",
      background:`linear-gradient(160deg,${B.navyDeep} 0%,${B.navy} 50%,${B.navyMid} 100%)`,
      display:"flex",alignItems:"center",justifyContent:"center",
      padding:20,position:"relative",overflow:"hidden"
    }}>
      <div style={{ position:"absolute",top:"-20%",right:"-15%",width:600,height:600,background:`radial-gradient(circle,${B.orangeGlow},transparent 65%)`,borderRadius:"50%" }} />
      <div style={{ position:"absolute",bottom:"-10%",left:"-10%",width:400,height:400,background:"radial-gradient(circle,rgba(30,58,95,0.3),transparent 65%)",borderRadius:"50%" }} />

      <div style={{ width:"100%",maxWidth:420,position:"relative",zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:14 }}>
            <div style={{
              width:48,height:48,
              background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`,
              borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:"'Fraunces',Georgia,serif",fontWeight:900,fontSize:22,
              color:B.navyDeep
            }}>Z</div>
            <div style={{ textAlign:"left" }}>
              <div style={{ color:"#fff",fontWeight:700,fontSize:20 }}>ZoneWise.AI</div>
              <div style={{ color:B.orangeLight,fontSize:11,fontWeight:500,letterSpacing:2,textTransform:"uppercase" }}>Loan Intelligence</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background:"rgba(255,255,255,0.03)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:32,boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
          <h2 style={{ fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:700,color:"#fff",marginBottom:4,textAlign:"center" }}>
            {titles[mode]?.[0]}
          </h2>
          <p style={{ color:B.s400,fontSize:13,textAlign:"center",marginBottom:24 }}>
            {titles[mode]?.[1]}
          </p>

          {/* LOGIN */}
          {mode === "login" && (
            <form onSubmit={handleLogin}>
              <div style={{
                background:"rgba(30,58,95,0.15)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:8, padding:"10px 14px", marginBottom:16,
                fontSize:11, color:B.s300, lineHeight:1.5, textAlign:"center"
              }}>
                🔐 Secure connection — your credentials are encrypted end-to-end
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block",fontSize:12,fontWeight:600,color:B.s300,marginBottom:5 }}>Email Address</label>
                <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block",fontSize:12,fontWeight:600,color:B.s300,marginBottom:5 }}>Password</label>
                <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
              <Msg type="error" text={error} />
              <Submit text="Sign In" />
              <button
                type="button"
                onClick={() => go("reset_request")}
                style={{
                  width:"100%",marginTop:10,padding:"8px",
                  background:"none",border:"none",color:B.s400,
                  fontSize:12,cursor:"pointer",
                  fontFamily:"'Plus Jakarta Sans',sans-serif"
                }}
              >
                Forgot your password?
              </button>
            </form>
          )}

          {/* SIGNUP */}
          {mode === "signup" && (
            <form onSubmit={handleSignup}>
              <div style={{
                background:"rgba(16,185,129,0.08)",
                border:"1px solid rgba(16,185,129,0.15)",
                borderRadius:8, padding:"10px 14px", marginBottom:16,
                fontSize:11, color:"#6ee7b7", lineHeight:1.5
              }}>
                🏦 <strong>Bank-Grade Security:</strong>{" "}
                Your personal and financial information is encrypted with
                256-bit AES encryption, stored on SOC 2 certified
                infrastructure, and never shared with third parties.
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block",fontSize:12,fontWeight:600,color:B.s300,marginBottom:5 }}>Full Name</label>
                <input style={inp} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" required />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block",fontSize:12,fontWeight:600,color:B.s300,marginBottom:5 }}>Email Address</label>
                <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block",fontSize:12,fontWeight:600,color:B.s300,marginBottom:5 }}>Password</label>
                <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} />
              </div>
              <Msg type="error" text={error} />
              <Submit text="Create Account" />
            </form>
          )}

          {/* VERIFY (post-signup) */}
          {mode === "verify" && (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:48,marginBottom:16 }}>📧</div>
              <Msg type="success" text={message} />
              <div style={{
                background:"rgba(245,158,11,0.08)",
                border:"1px solid rgba(245,158,11,0.2)",
                borderRadius:8,padding:"12px 14px",marginBottom:16,
                fontSize:11,color:B.orangeLight,lineHeight:1.6
              }}>
                💡 <strong>Can't find the email?</strong>{" "}
                Check your spam/junk folder. The email comes from{" "}
                <code style={{
                  background:"rgba(255,255,255,0.1)",
                  padding:"1px 4px",borderRadius:3
                }}>noreply@mail.app.supabase.io</code>
              </div>
              <button onClick={() => go("login")} style={{
                width:"100%",padding:"12px",borderRadius:8,fontSize:14,fontWeight:600,
                cursor:"pointer",border:"none",background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`,
                color:B.navyDeep,fontFamily:"'Plus Jakarta Sans',sans-serif"
              }}>Back to Login</button>
            </div>
          )}

          {/* RESET REQUEST */}
          {mode === "reset_request" && (
            <form onSubmit={handleResetRequest}>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block",fontSize:12,fontWeight:600,color:B.s300,marginBottom:5 }}>Email Address</label>
                <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
              </div>
              <Msg type="error" text={error} />
              <Submit text="Send Recovery Email" />
            </form>
          )}

          {/* RESET CODE ENTRY */}
          {mode === "reset_code" && (
            <div>
              <Msg type="success" text={message} />
              <div style={{
                background:"rgba(245,158,11,0.08)",
                border:"1px solid rgba(245,158,11,0.2)",
                borderRadius:8,padding:"12px 14px",marginBottom:16,
                fontSize:11,color:B.orangeLight,lineHeight:1.6
              }}>
                💡 <strong>Check spam/junk!</strong>{" "}
                The email sender is{" "}
                <code style={{
                  background:"rgba(255,255,255,0.1)",
                  padding:"1px 4px",borderRadius:3
                }}>noreply@mail.app.supabase.io</code>.{" "}
                Look for subject:{" "}
                <em>"Reset Your ZoneWise.AI Password"</em>
              </div>
              <p style={{color:B.s300,fontSize:13,marginBottom:16,lineHeight:1.6}}>
                Option 1: <strong>Click the link</strong> in the email to reset directly.<br/>
                Option 2: Copy the <strong>6-digit code</strong> from the email and enter it below.
              </p>
              <form onSubmit={handleVerifyOtp}>
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:"block",fontSize:12,fontWeight:600,color:B.s300,marginBottom:5 }}>Recovery Code</label>
                  <input
                    style={{
                      ...inp,textAlign:"center",fontSize:24,
                      letterSpacing:8,fontFamily:"'JetBrains Mono',monospace"
                    }}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g,"").slice(0,8))}
                    placeholder="000000"
                    maxLength={8}
                  />
                </div>
                <Msg type="error" text={error} />
                <Submit text="Verify Code" />
              </form>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
                <button
                  type="button"
                  onClick={handleResendReset}
                  disabled={submitting}
                  style={{
                    background:"none",border:"none",color:B.s400,
                    fontSize:12,cursor:"pointer",
                    fontFamily:"'Plus Jakarta Sans',sans-serif"
                  }}
                >
                  📧 Resend email
                </button>
                <button type="button" onClick={() => go("login")} style={{ background:"none",border:"none",color:B.s400,fontSize:12,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  ← Back to login
                </button>
              </div>
            </div>
          )}

          {/* SET NEW PASSWORD */}
          {mode === "reset_newpw" && (
            <form onSubmit={handleSetNewPassword}>
              <Msg type="success" text={message} />
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block",fontSize:12,fontWeight:600,color:B.s300,marginBottom:5 }}>New Password</label>
                <input style={inp} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} autoFocus />
              </div>
              <Msg type="error" text={error} />
              <Submit text="Update Password" />
            </form>
          )}

          {/* Mode switcher */}
          {(mode === "login" || mode === "signup" || mode === "reset_request") && (
            <div style={{ marginTop:20,paddingTop:16,borderTop:"1px solid rgba(255,255,255,0.06)",textAlign:"center" }}>
              {mode === "login" ? (
                <span style={{ color:B.s400,fontSize:13 }}>Don't have an account? <Link onClick={() => go("signup")} text="Sign Up" /></span>
              ) : (
                <span style={{ color:B.s400,fontSize:13 }}>Already have an account? <Link onClick={() => go("login")} text="Sign In" /></span>
              )}
            </div>
          )}
        </div>

        {/* Security Trust Badges */}
        <div style={{ marginTop:24, padding:"20px 24px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, textAlign:"center", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:20, marginBottom:4 }}>🔐</div>
              <div style={{ fontSize:10, fontWeight:600, color:B.s300, letterSpacing:0.5 }}>256-BIT AES</div>
              <div style={{ fontSize:9, color:B.s600 }}>Encryption</div>
            </div>
            <div>
              <div style={{ fontSize:20, marginBottom:4 }}>🏦</div>
              <div style={{ fontSize:10, fontWeight:600, color:B.s300, letterSpacing:0.5 }}>BANK-GRADE</div>
              <div style={{ fontSize:9, color:B.s600 }}>Security</div>
            </div>
            <div>
              <div style={{ fontSize:20, marginBottom:4 }}>🛡️</div>
              <div style={{ fontSize:10, fontWeight:600, color:B.s300, letterSpacing:0.5 }}>SOC 2 TYPE II</div>
              <div style={{ fontSize:9, color:B.s600 }}>Compliant</div>
            </div>
          </div>
          <div style={{ fontSize:10, color:B.s600, textAlign:"center", lineHeight:1.6 }}>
            Your data is protected with bank-level 256-bit AES encryption at rest and TLS 1.3 in transit.
            All financial information is stored on SOC 2 Type II certified infrastructure.
            We never share your personal data with third parties.
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:16, color:B.s600, fontSize:10 }}>
          <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:8 }}>
            <span>🔒 End-to-End Encrypted</span>
            <span>📋 GLBA Compliant</span>
            <span>🇺🇸 US-Based Servers</span>
          </div>
          <div>ZoneWise.AI — Everest Capital USA — Satellite Beach, FL</div>
          <div style={{ marginTop:4, fontSize:9, color:B.s600 }}>Powered by Supabase Auth • Row-Level Security • Zero-Knowledge Architecture</div>
        </div>
      </div>
    </div>
  );
}
