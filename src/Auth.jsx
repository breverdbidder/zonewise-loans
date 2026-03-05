import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const B = {
  navy:"#1E3A5F",navyDeep:"#0F1D30",navyMid:"#2A4D7A",
  orange:"#F59E0B",orangeLight:"#FCD34D",orangeGlow:"rgba(245,158,11,0.12)",
  s800:"#1e293b",s700:"#334155",s600:"#475569",s400:"#94a3b8",s300:"#cbd5e1",
  s200:"#e2e8f0",s100:"#f1f5f9",s50:"#f8fafc",
  green:"#10b981",red:"#ef4444",white:"#fff",
};

const is = {
  width:"100%",padding:"12px 14px",border:`1.5px solid ${B.s200}`,borderRadius:8,
  fontSize:14,color:B.s800,background:"#fff",outline:"none",
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signOut };
}

export function AuthGate({ children }) {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState("login"); // login | signup | reset | verify
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:B.navyDeep, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:48,height:48,border:`3px solid ${B.orangeGlow}`,borderTopColor:B.orange,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ color:B.s400,fontSize:14 }}>Loading ZoneWise.AI…</div>
      </div>
    </div>
  );

  if (user) return children;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setSubmitting(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
    if (error) setError(error.message);
    else { setMode("verify"); setMessage("Check your email for a confirmation link."); }
    setSubmitting(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) setError(error.message);
    else setMessage("Password reset link sent to your email.");
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg, ${B.navyDeep} 0%, ${B.navy} 50%, ${B.navyMid} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", overflow:"hidden" }}>
      {/* Background effects */}
      <div style={{ position:"absolute",top:"-20%",right:"-15%",width:600,height:600,background:`radial-gradient(circle,${B.orangeGlow},transparent 65%)`,borderRadius:"50%" }} />
      <div style={{ position:"absolute",bottom:"-10%",left:"-10%",width:400,height:400,background:"radial-gradient(circle,rgba(30,58,95,0.3),transparent 65%)",borderRadius:"50%" }} />

      <div style={{ width:"100%",maxWidth:420,position:"relative",zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:14,marginBottom:8 }}>
            <div style={{ width:48,height:48,background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Fraunces',Georgia,serif",fontWeight:900,fontSize:22,color:B.navyDeep }}>Z</div>
            <div style={{ textAlign:"left" }}>
              <div style={{ color:"#fff",fontWeight:700,fontSize:20,letterSpacing:0.3 }}>ZoneWise.AI</div>
              <div style={{ color:B.orangeLight,fontSize:11,fontWeight:500,letterSpacing:2,textTransform:"uppercase" }}>Loan Intelligence</div>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div style={{ background:"rgba(255,255,255,0.03)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:32,boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
          <h2 style={{ fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:700,color:"#fff",marginBottom:4,textAlign:"center" }}>
            {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : mode === "verify" ? "Check Your Email" : "Reset Password"}
          </h2>
          <p style={{ color:B.s400,fontSize:13,textAlign:"center",marginBottom:24 }}>
            {mode === "login" ? "Sign in to access your loan applications" :
             mode === "signup" ? "Start your hard money loan application" :
             mode === "verify" ? "We sent a confirmation link to your email" :
             "Enter your email to receive a reset link"}
          </p>

          {mode === "verify" ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:48,marginBottom:16 }}>📧</div>
              <p style={{ color:B.s300,fontSize:13,lineHeight:1.7,marginBottom:20 }}>{message}</p>
              <button onClick={() => { setMode("login"); setMessage(""); }} style={{
                width:"100%",padding:"12px",borderRadius:8,fontSize:14,fontWeight:600,
                cursor:"pointer",border:"none",background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`,
                color:B.navyDeep,fontFamily:"'Plus Jakarta Sans',sans-serif"
              }}>Back to Login</button>
            </div>
          ) : (
            <form onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleReset}>
              {mode === "signup" && (
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:"block",fontSize:12,fontWeight:600,color:B.s300,marginBottom:5 }}>Full Name</label>
                  <input style={{ ...is,background:"rgba(255,255,255,0.06)",borderColor:"rgba(255,255,255,0.1)",color:"#fff" }}
                    value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ariel Shapira" required />
                </div>
              )}

              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block",fontSize:12,fontWeight:600,color:B.s300,marginBottom:5 }}>Email Address</label>
                <input style={{ ...is,background:"rgba(255,255,255,0.06)",borderColor:"rgba(255,255,255,0.1)",color:"#fff" }}
                  type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
              </div>

              {mode !== "reset" && (
                <div style={{ marginBottom:20 }}>
                  <label style={{ display:"block",fontSize:12,fontWeight:600,color:B.s300,marginBottom:5 }}>Password</label>
                  <input style={{ ...is,background:"rgba(255,255,255,0.06)",borderColor:"rgba(255,255,255,0.1)",color:"#fff" }}
                    type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                </div>
              )}

              {error && (
                <div style={{ background:"rgba(239,68,68,0.12)",border:`1px solid rgba(239,68,68,0.25)`,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#fca5a5" }}>
                  ⚠️ {error}
                </div>
              )}
              {message && !error && (
                <div style={{ background:"rgba(16,185,129,0.12)",border:`1px solid rgba(16,185,129,0.25)`,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#6ee7b7" }}>
                  ✅ {message}
                </div>
              )}

              <button type="submit" disabled={submitting} style={{
                width:"100%",padding:"13px",borderRadius:8,fontSize:14,fontWeight:700,
                cursor:submitting?"not-allowed":"pointer",border:"none",
                background:submitting?"rgba(255,255,255,0.1)":`linear-gradient(135deg,${B.orange},${B.orangeLight})`,
                color:submitting?B.s400:B.navyDeep,fontFamily:"'Plus Jakarta Sans',sans-serif",
                boxShadow:submitting?"none":"0 4px 16px rgba(245,158,11,0.3)",transition:"all 0.2s"
              }}>
                {submitting ? "Processing…" : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
              </button>

              {mode === "login" && (
                <button type="button" onClick={() => { setMode("reset"); setError(""); setMessage(""); }}
                  style={{ width:"100%",marginTop:10,padding:"8px",background:"none",border:"none",color:B.s400,fontSize:12,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  Forgot your password?
                </button>
              )}
            </form>
          )}

          {/* Mode switcher */}
          {mode !== "verify" && (
            <div style={{ marginTop:20,paddingTop:16,borderTop:"1px solid rgba(255,255,255,0.06)",textAlign:"center" }}>
              {mode === "login" ? (
                <span style={{ color:B.s400,fontSize:13 }}>
                  Don't have an account?{" "}
                  <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
                    style={{ background:"none",border:"none",color:B.orangeLight,fontWeight:600,cursor:"pointer",fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                    Sign Up
                  </button>
                </span>
              ) : (
                <span style={{ color:B.s400,fontSize:13 }}>
                  Already have an account?{" "}
                  <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                    style={{ background:"none",border:"none",color:B.orangeLight,fontWeight:600,cursor:"pointer",fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                    Sign In
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center",marginTop:24,color:B.s600,fontSize:11 }}>
          <div>🔒 Bank-grade encryption • Secured by Supabase</div>
          <div style={{ marginTop:4 }}>ZoneWise.AI — Everest Capital USA</div>
        </div>
      </div>
    </div>
  );
}
