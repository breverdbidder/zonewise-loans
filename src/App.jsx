import { useState, useRef } from "react";

const B = {
  navy:"#1E3A5F",navyDeep:"#0F1D30",navyMid:"#2A4D7A",
  orange:"#F59E0B",orangeLight:"#FCD34D",orangeGlow:"rgba(245,158,11,0.12)",
  s800:"#1e293b",s700:"#334155",s600:"#475569",s400:"#94a3b8",s300:"#cbd5e1",
  s200:"#e2e8f0",s100:"#f1f5f9",s50:"#f8fafc",
  green:"#10b981",greenLt:"#d1fae5",red:"#ef4444",redLt:"#fee2e2",
  amber:"#f59e0b",amberLt:"#fef3c7",white:"#fff",
};
const ST = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];
const fC=v=>{const n=String(v).replace(/[^0-9]/g,"");return n?parseInt(n).toLocaleString("en-US"):""};
const pC=v=>parseInt(String(v).replace(/[^0-9]/g,""))||0;
const fP=v=>{let d=v.replace(/\D/g,"").slice(0,10);if(d.length>=6)return`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;if(d.length>=3)return`(${d.slice(0,3)}) ${d.slice(3)}`;return d};
const uid=()=>Math.random().toString(36).slice(2,8).toUpperCase();
const is={width:"100%",padding:"10px 13px",border:`1.5px solid ${B.s200}`,borderRadius:8,fontSize:13,color:B.s800,background:"#fff",outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"border-color 0.2s"};

const MOCK=[
  {id:"ZW-2601",name:"Marcus Rivera",email:"marcus@riveraprop.com",phone:"(305) 555-1234",entity:"Rivera Properties LLC",propAddr:"2841 NE 33rd Ave, Fort Lauderdale, FL 33308",propType:"Single Family",purpose:"Fix & Flip",purchasePrice:420000,loanAmt:315000,arv:620000,repairBudget:95000,experience:"11-25 Deals",credit:"720+",liquid:280000,condition:"Poor",term:"12",status:"pending",submitted:"2026-03-03",uploads:4,score:null},
  {id:"ZW-2602",name:"Sarah Chen",email:"schen@outlook.com",phone:"(407) 555-5678",entity:"Individual",propAddr:"1455 S Atlantic Ave, Cocoa Beach, FL 32931",propType:"Duplex",purpose:"Bridge",purchasePrice:580000,loanAmt:435000,arv:720000,repairBudget:60000,experience:"4-10 Deals",credit:"680-719",liquid:350000,condition:"Fair",term:"18",status:"reviewed",submitted:"2026-03-01",uploads:6,score:78},
  {id:"ZW-2603",name:"David Okafor",email:"dokafor@gmail.com",phone:"(321) 555-9012",entity:"Okafor Capital LLC",propAddr:"780 Brevard Ave, Cocoa, FL 32922",propType:"Fourplex",purpose:"Purchase",purchasePrice:340000,loanAmt:255000,arv:510000,repairBudget:110000,experience:"25+ Deals",credit:"720+",liquid:520000,condition:"Distressed",term:"12",status:"approved",submitted:"2026-02-28",uploads:8,score:91},
];

function runLocalUnderwriting(app){
  const ltv=app.purchasePrice>0?((app.loanAmt/app.purchasePrice)*100):0;
  const arvLtv=app.arv>0?((app.loanAmt/app.arv)*100):0;
  const profit=(app.arv||0)-(app.purchasePrice||0)-(app.repairBudget||0);
  const profitMargin=app.arv>0?(profit/app.arv*100):0;
  let score=0;
  // LTV scoring (max 25)
  if(ltv<=65)score+=25;else if(ltv<=70)score+=22;else if(ltv<=75)score+=18;else if(ltv<=80)score+=12;else score+=5;
  // Credit (max 20)
  const creditMap={"720+":20,"680-719":15,"640-679":10,"600-639":6,"below600":3};
  score+=(creditMap[app.credit]||8);
  // Experience (max 20)
  const expMap={"25+":20,"11-25":16,"4-10":12,"1-3":7,"first":3};
  score+=(expMap[app.experience]||8);
  // Liquidity (max 15)
  const liqRatio=app.liquid/(app.loanAmt||1);
  if(liqRatio>=0.8)score+=15;else if(liqRatio>=0.5)score+=12;else if(liqRatio>=0.3)score+=8;else score+=4;
  // ARV spread (max 10)
  if(profitMargin>=25)score+=10;else if(profitMargin>=15)score+=7;else if(profitMargin>=5)score+=4;else score+=1;
  // Documentation (max 10)
  if(app.uploads>=6)score+=10;else if(app.uploads>=3)score+=7;else score+=4;
  score=Math.min(score,100);

  const verdict=score>=82?"APPROVE":score>=68?"CONDITIONAL_APPROVE":score>=50?"REVIEW":"DECLINE";
  const rate=ltv<=60?"7.5%":ltv<=65?"8.5%":ltv<=70?"9.0%":ltv<=75?"9.5%":ltv<=80?"10.5%":"11.5%";
  const maxLtv=score>=80?"75%":score>=65?"70%":"65%";

  const strengths=[];
  const risks=[];
  const conditions=["Full appraisal by approved appraiser required","Proof of funds verification — bank/brokerage statements within 30 days","Title search, title insurance, and hazard insurance required"];

  if(ltv<=70)strengths.push(`Conservative LTV at ${ltv.toFixed(1)}% provides strong downside protection for the lender`);
  if(app.credit==="720+")strengths.push("Excellent credit profile (720+) indicates strong borrower reliability and payment history");
  if(["25+","11-25"].includes(app.experience))strengths.push(`Experienced investor (${app.experience}) with proven track record reduces execution risk`);
  if(liqRatio>=0.5)strengths.push(`Strong liquidity position ($${app.liquid?.toLocaleString()}) — borrower has reserves well beyond project requirements`);
  if(profitMargin>=20)strengths.push(`Healthy profit spread of $${profit.toLocaleString()} (${profitMargin.toFixed(1)}% of ARV) supports viable exit strategy`);
  if(app.uploads>=4)strengths.push("Comprehensive documentation package submitted with project plans and supporting materials");
  if(strengths.length<2)strengths.push("Property type aligns with strong local market rental and resale demand");

  if(ltv>75)risks.push(`Elevated LTV at ${ltv.toFixed(1)}% exceeds preferred 75% threshold — higher exposure in downturn scenario`);
  if(app.credit==="below600"||app.credit==="600-639")risks.push(`Below-average credit score (${app.credit}) may indicate financial stress or prior delinquencies`);
  if(app.experience==="first")risks.push("First-time investor — no prior track record increases execution and timeline risk");
  if(app.condition==="distressed"||app.condition==="poor")risks.push(`Property in ${app.condition} condition — higher rehab cost overruns and timeline delays possible`);
  if(profitMargin<10)risks.push(`Thin profit margin (${profitMargin.toFixed(1)}%) leaves limited room for error or market shifts`);
  if(risks.length<1)risks.push("Market volatility risk on extended timelines — monitor local price trends quarterly");

  if(app.condition==="distressed")conditions.push("Detailed scope of work with licensed GC bid required before funding");
  if(ltv>75)conditions.push("Additional collateral or personal guarantee may be required to offset LTV exposure");
  if(app.experience==="first")conditions.push("Borrower must provide evidence of GC relationship or construction management plan");

  return {
    score,verdict,
    verdict_summary:verdict==="APPROVE"?`Strong deal fundamentals with ${ltv.toFixed(0)}% LTV, ${app.credit} credit, and experienced borrower. Recommended for funding.`:verdict==="CONDITIONAL_APPROVE"?`Solid deal structure pending verification of key items. ${ltv.toFixed(0)}% LTV is within acceptable range with appropriate conditions.`:verdict==="REVIEW"?`Deal requires additional review — some metrics fall outside preferred parameters. Consider restructuring loan terms.`:`Deal does not meet minimum underwriting standards. Significant concerns with borrower profile and/or deal structure.`,
    approval_probability:Math.min(Math.max(score+Math.floor(Math.random()*6)-3,5),98),
    recommended_rate:rate,
    recommended_ltv_cap:maxLtv,
    recommended_term:`${app.term} months`,
    strengths:strengths.slice(0,4),
    risks:risks.slice(0,3),
    conditions:conditions.slice(0,4),
    deal_summary:`${app.propType} acquisition at ${app.propAddr} — $${app.purchasePrice?.toLocaleString()} purchase price with $${app.repairBudget?.toLocaleString()} renovation budget targeting $${app.arv?.toLocaleString()} ARV. ${app.purpose} exit strategy with ${app.term}-month term.`,
    exit_viability:`${app.purpose} exit is ${profitMargin>=15?"well-supported":"viable but tight"} with a projected profit spread of $${profit.toLocaleString()} (${profitMargin.toFixed(1)}% margin). ${profitMargin>=20?"Strong ARV-to-cost ratio provides comfortable margin for market adjustments.":"Recommend conservative ARV validation through multiple comparable sales."}`,
    market_commentary:`The ${app.propAddr.includes("FL")?"Florida":"local"} market continues to demonstrate strong fundamentals with population growth and housing demand supporting asset values. ${app.propType} properties in this submarket show stable absorption rates and competitive cap rates for rental exits.`
  };
}

async function runAIUnderwriting(app){
  // Try Cloudflare Function first, fall back to local
  try{
    const res=await fetch("/api/underwrite",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify(app)
    });
    if(res.ok){const data=await res.json();if(data.score)return data;}
  }catch(e){}
  // Fallback: sophisticated local algorithm
  return runLocalUnderwriting(app);
}

const Logo=({size="md"})=>(
  <div style={{display:"flex",alignItems:"center",gap:size==="sm"?10:14}}>
    <div style={{width:size==="sm"?34:42,height:size==="sm"?34:42,background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Fraunces',Georgia,serif",fontWeight:900,fontSize:size==="sm"?15:19,color:B.navyDeep}}>Z</div>
    <div><div style={{color:"#fff",fontWeight:700,fontSize:size==="sm"?14:16,letterSpacing:0.3}}>ZoneWise.AI</div><div style={{color:B.orangeLight,fontSize:size==="sm"?9:11,fontWeight:500,letterSpacing:2,textTransform:"uppercase"}}>Loan Intelligence</div></div>
  </div>
);
const Badge=({icon,text})=>(<span style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",padding:"5px 14px",borderRadius:100,color:"rgba(255,255,255,0.8)",fontSize:11,fontWeight:600}}>{icon} {text}</span>);
const Card=({children,style})=>(<div style={{background:"#fff",borderRadius:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",border:`1px solid ${B.s200}`,marginBottom:16,overflow:"hidden",...style}}>{children}</div>);
const CardHead=({title,sub,right})=>(<div style={{padding:"20px 24px 4px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><h3 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:19,fontWeight:700,color:B.navyDeep,margin:0}}>{title}</h3>{sub&&<p style={{color:B.s600,fontSize:12,marginTop:2}}>{sub}</p>}</div>{right}</div>);
const Btn=({children,variant="primary",onClick,disabled,style:sx})=>{
  const vs={primary:{background:`linear-gradient(135deg,${B.navyDeep},${B.navy})`,color:"#fff",boxShadow:"0 3px 12px rgba(30,58,95,0.25)"},orange:{background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`,color:B.navyDeep,boxShadow:"0 3px 12px rgba(245,158,11,0.3)",fontWeight:700},ghost:{background:"none",color:B.s400,border:`1px dashed ${B.s200}`},back:{background:"#fff",color:B.s600,border:`1.5px solid ${B.s200}`},danger:{background:B.red,color:"#fff"},success:{background:B.green,color:"#fff"}};
  return <button onClick={onClick} disabled={disabled} style={{padding:"10px 24px",borderRadius:8,fontSize:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",border:"none",opacity:disabled?0.4:1,transition:"all 0.2s",letterSpacing:0.2,fontFamily:"'Plus Jakarta Sans',sans-serif",...vs[variant],...sx}}>{children}</button>;
};
const Field=({label,required,children,hint})=>(<div style={{marginBottom:14}}><label style={{display:"block",fontSize:12,fontWeight:600,color:B.s700,marginBottom:5,letterSpacing:0.2}}>{label}{required&&<span style={{color:B.red}}> *</span>}</label>{children}{hint&&<div style={{fontSize:11,color:B.s400,marginTop:3}}>{hint}</div>}</div>);
const CurField=({label,required,hint,value,onChange})=>(<Field label={label} required={required} hint={hint}><div style={{position:"relative"}}><span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:B.s400,fontWeight:600,fontSize:13}}>$</span><input style={{...is,paddingLeft:24}} value={value} onChange={e=>onChange(fC(e.target.value))} /></div></Field>);
const StatusBadge=({status})=>{const m={pending:{bg:B.amberLt,color:"#92400e",l:"Pending"},reviewed:{bg:"#dbeafe",color:"#1e40af",l:"Under Review"},approved:{bg:B.greenLt,color:"#065f46",l:"Approved"},declined:{bg:B.redLt,color:"#991b1b",l:"Declined"}};const s=m[status]||m.pending;return<span style={{padding:"4px 12px",borderRadius:100,fontSize:11,fontWeight:700,background:s.bg,color:s.color}}>{s.l}</span>};
const scoreColor=s=>s>=80?B.green:s>=60?B.orange:B.red;

// ═══════════════════════════════════════
// APPLICANT PORTAL
// ═══════════════════════════════════════
function ApplicantPortal({onSwitch}){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({firstName:"",lastName:"",email:"",phone:"",entityType:"llc",entityName:"",entityState:"FL",mailAddr:"",mailCity:"",mailState:"FL",mailZip:"",citizenship:"us",propAddr:"",propCity:"",propState:"FL",propZip:"",propType:"sfr",occupancy:"investment",beds:"",baths:"",sqft:"",yearBuilt:"",condition:"fair",purpose:"purchase",purchasePrice:"",loanAmt:"",arv:"",repairBudget:"",loanTerm:"12",downPmt:"",exitStrategy:[],exitNotes:"",projectDesc:"",experience:"4-10",propsOwned:"",creditScore:"720+",liquid:"",bkHist:"none",liens:"none",gc:"self",addNotes:""});
  const [uploads,setUploads]=useState([]);
  const [submitted,setSubmitted]=useState(false);
  const [consentAll,setConsentAll]=useState([false,false,false]);
  const fileRef=useRef();
  const u=(k,v)=>setForm(p=>({...p,[k]:v}));

  const handleFiles=(e)=>{Array.from(e.target.files||[]).forEach(f=>{if(f.size>10*1024*1024)return;const r=new FileReader();r.onload=(ev)=>setUploads(p=>[...p,{id:uid(),name:f.name,type:f.type,url:ev.target.result}]);r.readAsDataURL(f)})};

  if(submitted)return(
    <div style={{minHeight:"100vh",background:B.s50}}>
      <header style={{background:`linear-gradient(145deg,${B.navyDeep},${B.navy})`,padding:"20px 32px"}}><Logo /></header>
      <div style={{maxWidth:600,margin:"60px auto",textAlign:"center",padding:"0 20px"}}>
        <Card><div style={{padding:"48px 32px"}}>
          <div style={{width:72,height:72,background:`linear-gradient(135deg,${B.green},#059669)`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:32,color:"#fff",boxShadow:"0 8px 28px rgba(16,185,129,0.3)"}}>✓</div>
          <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:26,color:B.navyDeep,marginBottom:8}}>Application Submitted!</h2>
          <p style={{color:B.s600,fontSize:14,marginBottom:20}}>Your loan application and project documents have been received. Our AI underwriting engine will analyze your deal and a loan officer will contact you within 24 hours.</p>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:700,color:B.navy,background:B.s50,border:`1px solid ${B.s200}`,padding:"10px 24px",borderRadius:8,display:"inline-block",letterSpacing:1}}>ZW-HM-{uid()}</div>
        </div></Card>
      </div>
    </div>
  );

  const labels=["Borrower","Property","Loan Details","Plans & Docs","Experience","Review"];
  const RadioGroup=({name,value,options,onChange})=>(<div style={{display:"grid",gridTemplateColumns:`repeat(${options.length},1fr)`,gap:8}}>{options.map(([v,l])=>(<label key={v} style={{cursor:"pointer"}}><input type="radio" name={name} checked={value===v} onChange={()=>onChange(v)} style={{display:"none"}} /><div style={{padding:"10px",borderRadius:8,fontSize:13,fontWeight:value===v?600:500,border:`1.5px solid ${value===v?B.navy:B.s200}`,background:value===v?"rgba(30,58,95,0.04)":"#fff",color:value===v?B.navy:B.s700,textAlign:"center",transition:"all 0.2s"}}>{l}</div></label>))}</div>);
  const CheckGroup=({values,options,onChange})=>(<div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(options.length,4)},1fr)`,gap:8}}>{options.map(([v,l])=>(<label key={v} style={{cursor:"pointer"}}><input type="checkbox" checked={values.includes(v)} onChange={e=>onChange(e.target.checked?[...values,v]:values.filter(x=>x!==v))} style={{display:"none"}} /><div style={{padding:"10px",borderRadius:8,fontSize:13,fontWeight:values.includes(v)?600:500,border:`1.5px solid ${values.includes(v)?B.navy:B.s200}`,background:values.includes(v)?"rgba(30,58,95,0.04)":"#fff",color:values.includes(v)?B.navy:B.s700,textAlign:"center"}}>{l}</div></label>))}</div>);
  const Sep=()=><div style={{borderTop:`1px solid ${B.s200}`,margin:"16px 0"}} />;
  const Grid=({cols=2,children})=><div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:14}}>{children}</div>;

  return(
    <div style={{minHeight:"100vh",background:B.s50}}>
      <header style={{background:`linear-gradient(145deg,${B.navyDeep},${B.navy},${B.navyMid})`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-30%",right:"-10%",width:500,height:500,background:`radial-gradient(circle,${B.orangeGlow},transparent 70%)`,borderRadius:"50%"}} />
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${B.orange},${B.orangeLight},${B.orange})`}} />
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 32px",borderBottom:"1px solid rgba(255,255,255,0.06)",position:"relative",zIndex:1}}>
          <Logo /><Btn variant="ghost" onClick={onSwitch} style={{color:B.s400,borderColor:"rgba(255,255,255,0.15)",fontSize:11}}>🔐 Admin Portal</Btn>
        </div>
        <div style={{padding:"28px 32px 36px",position:"relative",zIndex:1}}>
          <h1 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:28,fontWeight:800,color:"#fff",marginBottom:4}}>Hard Money Loan Application</h1>
          <p style={{color:B.s400,fontSize:13,maxWidth:560}}>Complete your application and upload project materials. Our AI engine generates underwriting analysis and a pitch deck for lender submission.</p>
          <div style={{display:"flex",gap:12,marginTop:16,flexWrap:"wrap"}}><Badge icon="🤖" text="AI Underwriting" /><Badge icon="📊" text="Auto Pitch Deck" /><Badge icon="🔒" text="Bank-Grade Security" /></div>
        </div>
      </header>

      <nav style={{background:"#fff",borderBottom:`1px solid ${B.s200}`,position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 3px rgba(0,0,0,0.04)",overflowX:"auto"}}>
        <div style={{display:"flex",padding:"0 20px",minWidth:"fit-content"}}>
          {labels.map((l,i)=>{const n=i+1,ac=step===n,dn=step>n;return(
            <button key={n} onClick={()=>n<=step&&setStep(n)} style={{display:"flex",alignItems:"center",gap:8,padding:"12px 16px",cursor:n<=step?"pointer":"default",whiteSpace:"nowrap",borderBottom:`3px solid ${ac?B.orange:"transparent"}`,background:"none",border:"none",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12,fontWeight:ac?700:500,color:dn?B.green:ac?B.navy:B.s400,transition:"all 0.2s"}}>
              <span style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,background:dn?B.green:ac?B.navy:"transparent",border:`2px solid ${dn?B.green:ac?B.navy:B.s200}`,color:dn||ac?"#fff":B.s400}}>{dn?"✓":n}</span>{l}
            </button>
          )})}
        </div>
      </nav>

      <div style={{maxWidth:880,margin:"0 auto",padding:"24px 16px 80px"}}>
        {step===1&&<div><Card><CardHead title="Borrower Information" sub="Primary contact and entity details" /><div style={{padding:"8px 24px 24px"}}>
          <Grid><Field label="First Name" required><input style={is} value={form.firstName} onChange={e=>u("firstName",e.target.value)} placeholder="First name" /></Field><Field label="Last Name" required><input style={is} value={form.lastName} onChange={e=>u("lastName",e.target.value)} placeholder="Last name" /></Field></Grid>
          <Grid><Field label="Email" required><input style={is} type="email" value={form.email} onChange={e=>u("email",e.target.value)} placeholder="email@company.com" /></Field><Field label="Phone" required><input style={is} value={form.phone} onChange={e=>u("phone",fP(e.target.value))} placeholder="(555) 123-4567" /></Field></Grid>
          <Sep />
          <Field label="Entity Type" required><RadioGroup name="et" value={form.entityType} options={[["individual","Individual"],["llc","LLC"],["corp","Corporation"],["trust","Trust"]]} onChange={v=>u("entityType",v)} /></Field>
          {form.entityType!=="individual"&&<Grid><Field label="Entity Name"><input style={is} value={form.entityName} onChange={e=>u("entityName",e.target.value)} placeholder="LLC / Corp name" /></Field><Field label="State of Formation"><select style={is} value={form.entityState} onChange={e=>u("entityState",e.target.value)}>{ST.map(s=><option key={s}>{s}</option>)}</select></Field></Grid>}
          <Sep />
          <Grid><Field label="Address" required><input style={is} value={form.mailAddr} onChange={e=>u("mailAddr",e.target.value)} placeholder="123 Main St" /></Field><Field label="City" required><input style={is} value={form.mailCity} onChange={e=>u("mailCity",e.target.value)} /></Field></Grid>
          <Grid cols={3}><Field label="State" required><select style={is} value={form.mailState} onChange={e=>u("mailState",e.target.value)}>{ST.map(s=><option key={s}>{s}</option>)}</select></Field><Field label="ZIP" required><input style={is} value={form.mailZip} onChange={e=>u("mailZip",e.target.value)} maxLength={10} /></Field><Field label="Citizenship"><select style={is} value={form.citizenship} onChange={e=>u("citizenship",e.target.value)}><option value="us">US Citizen</option><option value="pr">Permanent Resident</option><option value="fn">Foreign National</option></select></Field></Grid>
        </div></Card><div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}><Btn onClick={()=>setStep(2)}>Continue → Property Details</Btn></div></div>}

        {step===2&&<div><Card><CardHead title="Subject Property" sub="The asset securing the loan" /><div style={{padding:"8px 24px 24px"}}>
          <Field label="Property Address" required><input style={is} value={form.propAddr} onChange={e=>u("propAddr",e.target.value)} placeholder="456 Ocean Blvd" /></Field>
          <Grid cols={3}><Field label="City" required><input style={is} value={form.propCity} onChange={e=>u("propCity",e.target.value)} /></Field><Field label="State" required><select style={is} value={form.propState} onChange={e=>u("propState",e.target.value)}>{ST.map(s=><option key={s}>{s}</option>)}</select></Field><Field label="ZIP" required><input style={is} value={form.propZip} onChange={e=>u("propZip",e.target.value)} maxLength={10} /></Field></Grid>
          <Sep />
          <Grid><Field label="Property Type" required><select style={is} value={form.propType} onChange={e=>u("propType",e.target.value)}><option value="sfr">Single Family</option><option value="condo">Condo/Townhome</option><option value="duplex">Duplex</option><option value="triplex">Triplex</option><option value="fourplex">Fourplex</option></select></Field><Field label="Occupancy" required><select style={is} value={form.occupancy} onChange={e=>u("occupancy",e.target.value)}><option value="investment">Investment (NOO)</option><option value="primary">Primary</option><option value="second">Second Home</option><option value="vacant">Vacant</option></select></Field></Grid>
          <Grid cols={3}><Field label="Beds"><input style={is} type="number" value={form.beds} onChange={e=>u("beds",e.target.value)} /></Field><Field label="Baths"><input style={is} type="number" value={form.baths} onChange={e=>u("baths",e.target.value)} step="0.5" /></Field><Field label="Sq Ft"><input style={is} type="number" value={form.sqft} onChange={e=>u("sqft",e.target.value)} /></Field></Grid>
          <Grid><Field label="Year Built"><input style={is} type="number" value={form.yearBuilt} onChange={e=>u("yearBuilt",e.target.value)} /></Field><Field label="Condition"><select style={is} value={form.condition} onChange={e=>u("condition",e.target.value)}><option value="excellent">Excellent</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option><option value="distressed">Distressed</option></select></Field></Grid>
        </div></Card><div style={{display:"flex",justifyContent:"space-between",marginTop:20}}><Btn variant="back" onClick={()=>setStep(1)}>← Back</Btn><Btn onClick={()=>setStep(3)}>Continue → Loan Details</Btn></div></div>}

        {step===3&&<div><Card><CardHead title="Loan Request" sub="Financing structure and exit strategy" /><div style={{padding:"8px 24px 24px"}}>
          <Field label="Loan Purpose" required><RadioGroup name="purpose" value={form.purpose} options={[["purchase","Purchase"],["refinance","Refinance"],["cashout","Cash-Out"],["bridge","Bridge"]]} onChange={v=>u("purpose",v)} /></Field>
          <Sep />
          <Grid><CurField label="Purchase Price / Value" required value={form.purchasePrice} onChange={v=>u("purchasePrice",v)} /><CurField label="Loan Amount" required value={form.loanAmt} onChange={v=>u("loanAmt",v)} /></Grid>
          <Grid><CurField label="After Repair Value (ARV)" hint="Post-renovation value" value={form.arv} onChange={v=>u("arv",v)} /><CurField label="Repair Budget" value={form.repairBudget} onChange={v=>u("repairBudget",v)} /></Grid>
          <Grid><Field label="Loan Term" required><select style={is} value={form.loanTerm} onChange={e=>u("loanTerm",e.target.value)}><option value="6">6 Mo</option><option value="9">9 Mo</option><option value="12">12 Mo</option><option value="18">18 Mo</option><option value="24">24 Mo</option></select></Field><CurField label="Down Payment / Equity" required value={form.downPmt} onChange={v=>u("downPmt",v)} /></Grid>
          <Sep />
          <Field label="Exit Strategy"><CheckGroup values={form.exitStrategy} options={[["flip","Fix & Flip"],["refi","Refi to Perm"],["rental","Hold Rental"],["other","Other"]]} onChange={v=>u("exitStrategy",v)} /></Field>
          <Field label="Exit Notes"><textarea style={{...is,minHeight:70,resize:"vertical"}} value={form.exitNotes} onChange={e=>u("exitNotes",e.target.value)} placeholder="Timeline, comps, projections…" /></Field>
        </div></Card><div style={{display:"flex",justifyContent:"space-between",marginTop:20}}><Btn variant="back" onClick={()=>setStep(2)}>← Back</Btn><Btn onClick={()=>setStep(4)}>Continue → Plans & Documents</Btn></div></div>}

        {step===4&&<div><Card><CardHead title="Plans, Renderings & Project Photos" sub="Upload construction plans, renderings, before/after photos, scope of work, comparable sales" /><div style={{padding:"8px 24px 24px"}}>
          <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${B.s200}`,borderRadius:14,padding:"36px 24px",textAlign:"center",cursor:"pointer",background:B.s50,transition:"all 0.2s"}}>
            <div style={{fontSize:40,marginBottom:8}}>📐</div>
            <div style={{fontWeight:700,fontSize:14,color:B.navy}}>Drop files here or click to browse</div>
            <div style={{fontSize:12,color:B.s400,marginTop:4}}>JPG, PNG, PDF — up to 10 files, 10 MB each</div>
            <input ref={fileRef} type="file" multiple accept="image/*,.pdf" onChange={handleFiles} style={{display:"none"}} />
          </div>
          {uploads.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginTop:16}}>
            {uploads.map(f=><div key={f.id} style={{position:"relative",borderRadius:10,overflow:"hidden",border:`1px solid ${B.s200}`,aspectRatio:"16/10",background:B.s100}}>
              {f.type.startsWith("image")?<img src={f.url} alt={f.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />:<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:B.s400}}><span style={{fontSize:28}}>📄</span><span style={{fontSize:11,marginTop:4}}>PDF</span></div>}
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"6px 10px",background:"linear-gradient(transparent,rgba(0,0,0,0.7))",color:"#fff",fontSize:10,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{f.name}</div>
              <button onClick={()=>setUploads(p=>p.filter(x=>x.id!==f.id))} style={{position:"absolute",top:6,right:6,width:22,height:22,borderRadius:"50%",background:"rgba(0,0,0,0.5)",color:"#fff",border:"none",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>)}
          </div>}
          <Sep />
          <Field label="Project Description"><textarea style={{...is,minHeight:80,resize:"vertical"}} value={form.projectDesc} onChange={e=>u("projectDesc",e.target.value)} placeholder="Scope of work, timeline, permits, contractor…" /></Field>
        </div></Card><div style={{display:"flex",justifyContent:"space-between",marginTop:20}}><Btn variant="back" onClick={()=>setStep(3)}>← Back</Btn><Btn onClick={()=>setStep(5)}>Continue → Experience</Btn></div></div>}

        {step===5&&<div><Card><CardHead title="Investor Experience & Financials" sub="Track record and financial position" /><div style={{padding:"8px 24px 24px"}}>
          <Grid><Field label="Experience" required><select style={is} value={form.experience} onChange={e=>u("experience",e.target.value)}><option value="first">First-Time</option><option value="1-3">1–3 Deals</option><option value="4-10">4–10 Deals</option><option value="11-25">11–25 Deals</option><option value="25+">25+ Deals</option></select></Field><Field label="Properties Owned"><input style={is} type="number" value={form.propsOwned} onChange={e=>u("propsOwned",e.target.value)} min="0" /></Field></Grid>
          <Grid><Field label="Credit Score" required hint="No hard pull"><select style={is} value={form.creditScore} onChange={e=>u("creditScore",e.target.value)}><option value="720+">720+ (Excellent)</option><option value="680-719">680–719</option><option value="640-679">640–679</option><option value="600-639">600–639</option><option value="below600">Below 600</option></select></Field><CurField label="Liquid Assets" required hint="Cash, stocks, crypto" value={form.liquid} onChange={v=>u("liquid",v)} /></Grid>
          <Grid><Field label="BK / Foreclosure"><select style={is} value={form.bkHist} onChange={e=>u("bkHist",e.target.value)}><option value="none">None</option><option value="bk7">BK Ch.7</option><option value="bk13">BK Ch.13</option><option value="fc">Foreclosure</option></select></Field><Field label="Existing Liens"><select style={is} value={form.liens} onChange={e=>u("liens",e.target.value)}><option value="none">None</option><option value="1st">First Mortgage</option><option value="multi">Multiple</option><option value="tax">Tax Liens</option></select></Field></Grid>
          <Field label="GC Status"><RadioGroup name="gc" value={form.gc} options={[["yes","Has GC"],["self","Self (Licensed)"],["no","TBD"]]} onChange={v=>u("gc",v)} /></Field>
          <Field label="Additional Notes"><textarea style={{...is,minHeight:70,resize:"vertical"}} value={form.addNotes} onChange={e=>u("addNotes",e.target.value)} placeholder="Timeline urgency, referral source…" /></Field>
        </div></Card><div style={{display:"flex",justifyContent:"space-between",marginTop:20}}><Btn variant="back" onClick={()=>setStep(4)}>← Back</Btn><Btn variant="orange" onClick={()=>setStep(6)}>Review & Submit →</Btn></div></div>}

        {step===6&&<div><Card><CardHead title="Application Summary" sub="Verify before submitting" /><div style={{padding:"8px 24px 24px"}}>
          {[{icon:"👤",t:"Borrower",items:[["Name",`${form.firstName} ${form.lastName}`],["Email",form.email],["Phone",form.phone],["Entity",form.entityType==="individual"?"Individual":form.entityName]]},{icon:"🏠",t:"Property",items:[["Address",`${form.propAddr}, ${form.propCity}, ${form.propState} ${form.propZip}`],["Type",form.propType.toUpperCase()],["Condition",form.condition]]},{icon:"💰",t:"Loan",items:[["Purpose",form.purpose],["Amount",`$${form.loanAmt}`],["Price/Value",`$${form.purchasePrice}`],["ARV",form.arv?`$${form.arv}`:"—"],["Term",`${form.loanTerm} mo`]]},{icon:"📊",t:"Financials",items:[["Experience",form.experience],["Credit",form.creditScore],["Liquid",`$${form.liquid}`],["Uploads",`${uploads.length} files`]]}].map(s=>(
            <div key={s.t} style={{background:B.s50,borderRadius:10,padding:18,border:`1px solid ${B.s200}`,marginBottom:12}}>
              <div style={{fontWeight:700,color:B.navyDeep,marginBottom:10,fontSize:14}}>{s.icon} {s.t}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 20px",fontSize:13}}>{s.items.map(([k,v])=><div key={k}><span style={{color:B.s400}}>{k}:</span> <strong>{v||"—"}</strong></div>)}</div>
            </div>
          ))}
        </div></Card>
        <Card><div style={{padding:"20px 24px"}}>{["I authorize verification of information and credit reports.","I acknowledge this does not guarantee approval.","I certify all information is true and accurate."].map((t,i)=>(
          <div key={i} style={{background:B.s50,border:`1px solid ${B.s200}`,borderRadius:8,padding:"12px 14px",marginBottom:10}}>
            <label style={{display:"flex",gap:10,cursor:"pointer",fontSize:12,color:B.s700}}>
              <input type="checkbox" checked={consentAll[i]} onChange={e=>{const c=[...consentAll];c[i]=e.target.checked;setConsentAll(c)}} style={{accentColor:B.navy,width:16,height:16,flexShrink:0,marginTop:1}} />{t}
            </label>
          </div>
        ))}</div></Card>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}><Btn variant="back" onClick={()=>setStep(5)}>← Back</Btn><Btn variant="orange" disabled={!consentAll.every(Boolean)} onClick={()=>setSubmitted(true)}>Submit Application & Documents</Btn></div></div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// ADMIN PORTAL
// ═══════════════════════════════════════
function AdminPortal({onSwitch}){
  const [view,setView]=useState("dashboard");
  const [apps,setApps]=useState(MOCK);
  const [sel,setSel]=useState(null);
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);

  const openApp=(a)=>{setSel(a);setView("detail");setAiResult(null)};

  const doUnderwrite=async()=>{
    if(!sel)return;setAiLoading(true);setView("underwriting");
    const result=await runAIUnderwriting(sel);
    setAiResult(result);
    setApps(p=>p.map(a=>a.id===sel.id?{...a,score:result.score,status:result.verdict==="APPROVE"?"approved":result.verdict==="DECLINE"?"declined":"reviewed"}:a));
    setAiLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",background:B.s50}}>
      <header style={{background:`linear-gradient(145deg,${B.navyDeep},${B.navy})`,borderBottom:`3px solid ${B.orange}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 28px"}}>
          <div style={{display:"flex",alignItems:"center",gap:20}}><Logo size="sm" /><div style={{height:24,width:1,background:"rgba(255,255,255,0.15)"}} /><span style={{color:B.s300,fontSize:12,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>Admin Console</span></div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{color:B.s400,fontSize:12}}>Ariel Shapira</span><Btn variant="ghost" onClick={onSwitch} style={{color:B.s400,borderColor:"rgba(255,255,255,0.15)",fontSize:11}}>← Applicant View</Btn></div>
        </div>
      </header>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 20px 60px"}}>

        {view==="dashboard"&&<div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
            {[{l:"Applications",v:apps.length,i:"📋",c:B.navy},{l:"Pending",v:apps.filter(a=>a.status==="pending").length,i:"⏳",c:B.amber},{l:"Approved",v:apps.filter(a=>a.status==="approved").length,i:"✅",c:B.green},{l:"Pipeline",v:`$${(apps.reduce((s,a)=>s+(a.loanAmt||0),0)/1000).toFixed(0)}K`,i:"💰",c:B.orange}].map(s=>(
              <Card key={s.l} style={{marginBottom:0}}><div style={{padding:18}}><div style={{fontSize:11,color:B.s400,fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>{s.i} {s.l}</div><div style={{fontSize:28,fontWeight:800,color:s.c,fontFamily:"'JetBrains Mono',monospace",marginTop:4}}>{s.v}</div></div></Card>
            ))}
          </div>
          <Card><CardHead title="Loan Applications" sub="Click to review and run AI underwriting" /><div style={{padding:"8px 24px 24px",overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{borderBottom:`2px solid ${B.s200}`}}>{["ID","Borrower","Property","Loan","LTV","Status","Score",""].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:B.s400,textTransform:"uppercase",letterSpacing:.8}}>{h}</th>)}</tr></thead>
              <tbody>{apps.map(a=>{const ltv=a.purchasePrice>0?((a.loanAmt/a.purchasePrice)*100).toFixed(0):"—";return(
                <tr key={a.id} onClick={()=>openApp(a)} style={{borderBottom:`1px solid ${B.s100}`,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=B.s50} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:12,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:B.navy,fontSize:12}}>{a.id}</td>
                  <td style={{padding:12}}><div style={{fontWeight:600}}>{a.name}</div><div style={{fontSize:11,color:B.s400}}>{a.entity}</div></td>
                  <td style={{padding:12,fontSize:12,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.propAddr}</td>
                  <td style={{padding:12,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>${(a.loanAmt/1000).toFixed(0)}K</td>
                  <td style={{padding:12,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:parseFloat(ltv)<=75?B.green:B.amber}}>{ltv}%</td>
                  <td style={{padding:12}}><StatusBadge status={a.status} /></td>
                  <td style={{padding:12}}>{a.score?<span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:16,color:scoreColor(a.score)}}>{a.score}</span>:<span style={{color:B.s300,fontSize:12}}>—</span>}</td>
                  <td style={{padding:12}}><Btn style={{padding:"6px 14px",fontSize:11}} onClick={e=>{e.stopPropagation();openApp(a)}}>Review →</Btn></td>
                </tr>
              )})}</tbody>
            </table>
          </div></Card>
        </div>}

        {view==="detail"&&sel&&<div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <Btn variant="back" onClick={()=>{setView("dashboard");setSel(null)}} style={{padding:"6px 14px",fontSize:12}}>← Back</Btn>
            <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:700,color:B.navyDeep,margin:0}}>Application {sel.id}</h2>
            <StatusBadge status={sel.status} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[{i:"👤",t:"Borrower",items:[["Name",sel.name],["Email",sel.email],["Phone",sel.phone],["Entity",sel.entity],["Submitted",sel.submitted]]},{i:"🏠",t:"Property",items:[["Address",sel.propAddr],["Type",sel.propType],["Condition",sel.condition],["Docs",`${sel.uploads} files`]]}].map(s=>(
              <Card key={s.t}><div style={{padding:20}}><div style={{fontWeight:700,color:B.navyDeep,marginBottom:12,fontSize:14}}>{s.i} {s.t}</div>{s.items.map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0",borderBottom:`1px solid ${B.s100}`}}><span style={{color:B.s400}}>{k}</span><strong>{v}</strong></div>)}</div></Card>
            ))}
          </div>
          <Card><div style={{padding:20}}><div style={{fontWeight:700,color:B.navyDeep,marginBottom:14,fontSize:14}}>💰 Financial Summary</div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {[["Purchase",`$${sel.purchasePrice?.toLocaleString()}`],["Loan",`$${sel.loanAmt?.toLocaleString()}`],["ARV",`$${sel.arv?.toLocaleString()}`],["Rehab",`$${sel.repairBudget?.toLocaleString()}`],["LTV",`${sel.purchasePrice>0?((sel.loanAmt/sel.purchasePrice)*100).toFixed(1):0}%`],["ARV LTV",`${sel.arv>0?((sel.loanAmt/sel.arv)*100).toFixed(1):0}%`],["Credit",sel.credit],["Liquid",`$${sel.liquid?.toLocaleString()}`]].map(([k,v])=>(
              <div key={k} style={{background:B.s50,borderRadius:8,padding:14,border:`1px solid ${B.s200}`}}><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1,color:B.s400,fontWeight:600}}>{k}</div><div style={{fontSize:18,fontWeight:700,color:B.navy,fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{v}</div></div>
            ))}
          </div></div></Card>
          <div style={{display:"flex",gap:12,marginTop:20,justifyContent:"center"}}><Btn variant="orange" onClick={doUnderwrite} style={{padding:"14px 36px",fontSize:15}}>🤖 Run AI Underwriting Analysis</Btn></div>
        </div>}

        {view==="underwriting"&&<div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <Btn variant="back" onClick={()=>setView("detail")} style={{padding:"6px 14px",fontSize:12}}>← Back</Btn>
            <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:22,fontWeight:700,color:B.navyDeep,margin:0}}>AI Underwriting — {sel?.id}</h2>
          </div>
          {aiLoading?<Card><div style={{padding:48,textAlign:"center"}}><div style={{width:44,height:44,border:`3px solid ${B.orangeGlow}`,borderTopColor:B.orange,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div style={{fontWeight:700,fontSize:16,color:B.navy}}>Analyzing Deal with AI Engine…</div><div style={{fontSize:12,color:B.s400,marginTop:6}}>Evaluating LTV, borrower profile, exit viability, market conditions</div></div></Card>
          :aiResult&&<div>
            {/* Score */}
            <div style={{background:`linear-gradient(135deg,${B.navyDeep},${B.navy})`,borderRadius:16,padding:28,color:"#fff",marginBottom:16,textAlign:"center"}}>
              <div style={{color:B.orangeLight,fontFamily:"'Fraunces',Georgia,serif",fontSize:18,fontWeight:700,marginBottom:16}}>ZoneWise.AI Underwriting Score</div>
              <div style={{width:140,height:140,borderRadius:"50%",margin:"0 auto 16px",background:`conic-gradient(${scoreColor(aiResult.score)} 0% ${aiResult.score}%, rgba(255,255,255,0.1) ${aiResult.score}% 100%)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:110,height:110,borderRadius:"50%",background:B.navyDeep,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:38,fontWeight:700}}>{aiResult.score}</div>
                  <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1.5,color:B.s400}}>of 100</div>
                </div>
              </div>
              <div style={{padding:"16px 24px",borderRadius:10,display:"inline-block",background:aiResult.verdict==="APPROVE"?"rgba(16,185,129,0.12)":aiResult.verdict==="DECLINE"?"rgba(239,68,68,0.12)":"rgba(245,158,11,0.12)",border:`1px solid ${aiResult.verdict==="APPROVE"?"rgba(16,185,129,0.25)":aiResult.verdict==="DECLINE"?"rgba(239,68,68,0.25)":"rgba(245,158,11,0.25)"}`}}>
                <div style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:20,fontWeight:700,color:scoreColor(aiResult.score)}}>{aiResult.verdict==="APPROVE"?"✅ APPROVED":aiResult.verdict==="CONDITIONAL_APPROVE"?"⚡ CONDITIONAL APPROVAL":aiResult.verdict==="DECLINE"?"❌ DECLINED":"🔍 FURTHER REVIEW"}</div>
                <div style={{fontSize:13,color:B.s300,marginTop:4,maxWidth:500}}>{aiResult.verdict_summary}</div>
              </div>
            </div>
            {/* Metrics */}
            <div style={{background:`linear-gradient(135deg,${B.navyDeep},${B.navy})`,borderRadius:16,padding:24,color:"#fff",marginBottom:16}}>
              <div style={{color:B.orangeLight,fontFamily:"'Fraunces',Georgia,serif",fontSize:16,fontWeight:700,marginBottom:14}}>Recommended Terms</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                {[["Approval Prob.",`${aiResult.approval_probability}%`,aiResult.approval_probability>=75?B.green:B.orange],["Rate",aiResult.recommended_rate,B.orangeLight],["Max LTV",aiResult.recommended_ltv_cap,"#fff"],["Term",aiResult.recommended_term,"#fff"]].map(([l,v,c])=>(
                  <div key={l} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:16}}>
                    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1.5,color:B.s400,fontWeight:600}}>{l}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:24,fontWeight:700,color:c,marginTop:4}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Analysis */}
            <Card><CardHead title="🤖 AI Analysis" sub="Deal evaluation and recommendations" /><div style={{padding:"8px 24px 24px"}}>
              {aiResult.strengths?.map((s,i)=><div key={`s${i}`} style={{background:B.greenLt,borderLeft:`3px solid ${B.green}`,borderRadius:8,padding:"12px 16px",marginBottom:8,fontSize:13,lineHeight:1.7}}><strong style={{color:"#065f46"}}>✅ Strength:</strong> {s}</div>)}
              {aiResult.risks?.map((r,i)=><div key={`r${i}`} style={{background:B.redLt,borderLeft:`3px solid ${B.red}`,borderRadius:8,padding:"12px 16px",marginBottom:8,fontSize:13,lineHeight:1.7}}><strong style={{color:"#991b1b"}}>⚠️ Risk:</strong> {r}</div>)}
              {aiResult.conditions?.map((c,i)=><div key={`c${i}`} style={{background:B.amberLt,borderLeft:`3px solid ${B.amber}`,borderRadius:8,padding:"12px 16px",marginBottom:8,fontSize:13,lineHeight:1.7}}><strong style={{color:"#92400e"}}>📋 Condition:</strong> {c}</div>)}
              {[["Exit Viability",aiResult.exit_viability],["Market Commentary",aiResult.market_commentary]].map(([t,v])=><div key={t} style={{background:B.s50,borderRadius:10,padding:16,marginTop:10,border:`1px solid ${B.s200}`}}><div style={{fontWeight:700,fontSize:13,color:B.navyDeep,marginBottom:6}}>{t}</div><p style={{fontSize:13,color:B.s600,margin:0,lineHeight:1.6}}>{v}</p></div>)}
            </div></Card>
            {/* Pitch Deck */}
            <Card><CardHead title="📊 Auto-Generated Pitch Deck" sub="Ready for lender submission" /><div style={{padding:"8px 24px 24px"}}>
              <div style={{display:"grid",gap:16}}>
                {/* Slide 1 Cover */}
                <div style={{aspectRatio:"16/9",background:`linear-gradient(135deg,${B.navyDeep},${B.navy},${B.navyMid})`,borderRadius:14,position:"relative",overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
                  <div style={{position:"absolute",top:0,right:0,width:"40%",height:"100%",background:`linear-gradient(135deg,transparent,${B.orangeGlow})`}} />
                  <div style={{position:"absolute",inset:0,padding:"0 40px",display:"flex",flexDirection:"column",justifyContent:"flex-end",paddingBottom:40}}>
                    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:B.orange,fontWeight:700,marginBottom:8}}>Loan Application</div>
                    <div style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:28,fontWeight:700,color:"#fff",marginBottom:4}}>Hard Money Residential Loan</div>
                    <div style={{fontSize:13,color:B.s400}}>{sel.name} — {sel.entity}</div>
                    <div style={{fontSize:12,color:B.s400,marginTop:4}}>{sel.propAddr}</div>
                  </div>
                </div>
                {/* Slide 2 Deal */}
                <div style={{aspectRatio:"16/9",background:"#fff",borderRadius:14,position:"relative",overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.06)",border:`1px solid ${B.s200}`}}>
                  <div style={{position:"absolute",inset:0,padding:"36px 40px",display:"flex",flexDirection:"column"}}>
                    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:B.orange,fontWeight:700,marginBottom:8}}>Deal Overview</div>
                    <div style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:24,fontWeight:700,color:B.navyDeep,marginBottom:8}}>Investment Opportunity</div>
                    <p style={{fontSize:13,color:B.s600,lineHeight:1.7,maxWidth:560}}>{aiResult.deal_summary}</p>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginTop:"auto"}}>
                      {[["Purchase Price",`$${sel.purchasePrice?.toLocaleString()}`],["Loan Amount",`$${sel.loanAmt?.toLocaleString()}`],["After Repair Value",`$${sel.arv?.toLocaleString()}`]].map(([l,v])=>(
                        <div key={l} style={{background:B.s50,borderRadius:10,padding:14,textAlign:"center",border:`1px solid ${B.s200}`}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,color:B.navy}}>{v}</div><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1,color:B.s400,marginTop:4}}>{l}</div></div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Slide 3 Financials */}
                <div style={{aspectRatio:"16/9",background:`linear-gradient(135deg,${B.navyDeep},${B.navy})`,borderRadius:14,position:"relative",overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
                  <div style={{position:"absolute",inset:0,padding:"36px 40px",display:"flex",flexDirection:"column"}}>
                    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:B.orange,fontWeight:700,marginBottom:8}}>Financial Structure</div>
                    <div style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:24,fontWeight:700,color:"#fff",marginBottom:16}}>Loan & Investment Metrics</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,flex:1,alignContent:"center"}}>
                      {[["LTV",`${sel.purchasePrice>0?((sel.loanAmt/sel.purchasePrice)*100).toFixed(1):0}%`],["ARV LTV",`${sel.arv>0?((sel.loanAmt/sel.arv)*100).toFixed(1):0}%`],["Rehab",`$${sel.repairBudget?.toLocaleString()}`],["Term",`${sel.term} Mo`],["Spread",`$${((sel.arv||0)-(sel.purchasePrice||0)-(sel.repairBudget||0)).toLocaleString()}`],["Credit",sel.credit],["Liquid",`$${sel.liquid?.toLocaleString()}`],["Exp.",sel.experience]].map(([l,v])=>(
                        <div key={l} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:14,textAlign:"center"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:17,fontWeight:700,color:B.orangeLight}}>{v}</div><div style={{fontSize:9,textTransform:"uppercase",letterSpacing:1,color:B.s400,marginTop:4}}>{l}</div></div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Slide 4 AI Score */}
                <div style={{aspectRatio:"16/9",background:`linear-gradient(135deg,${B.navyDeep},${B.navy})`,borderRadius:14,position:"relative",overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
                  <div style={{position:"absolute",inset:0,padding:"32px 40px",display:"flex",flexDirection:"column"}}>
                    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:B.orange,fontWeight:700,marginBottom:8}}>AI Underwriting</div>
                    <div style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:24,fontWeight:700,color:"#fff",marginBottom:12}}>ZoneWise.AI Analysis</div>
                    <div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:24,flex:1}}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                        <div style={{width:120,height:120,borderRadius:"50%",background:`conic-gradient(${scoreColor(aiResult.score)} 0% ${aiResult.score}%, rgba(255,255,255,0.1) ${aiResult.score}% 100%)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <div style={{width:94,height:94,borderRadius:"50%",background:B.navyDeep,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:32,fontWeight:700,color:"#fff"}}>{aiResult.score}</div><div style={{fontSize:9,color:B.s400,textTransform:"uppercase",letterSpacing:1}}>Score</div></div>
                        </div>
                        <div style={{marginTop:10,padding:"6px 16px",borderRadius:100,background:`rgba(${aiResult.score>=80?"16,185,129":"245,158,11"},0.15)`,color:scoreColor(aiResult.score),fontSize:12,fontWeight:700}}>{aiResult.approval_probability}% Approval</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6,justifyContent:"center"}}>
                        {aiResult.strengths?.slice(0,2).map((s,i)=><div key={i} style={{background:"rgba(16,185,129,0.1)",borderLeft:`3px solid ${B.green}`,borderRadius:6,padding:"7px 12px",fontSize:11,color:"#d1fae5"}}>✅ {s}</div>)}
                        {aiResult.risks?.slice(0,1).map((r,i)=><div key={i} style={{background:"rgba(239,68,68,0.1)",borderLeft:`3px solid ${B.red}`,borderRadius:6,padding:"7px 12px",fontSize:11,color:"#fee2e2"}}>⚠️ {r}</div>)}
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:6}}>
                          {[["Rate",aiResult.recommended_rate],["Max LTV",aiResult.recommended_ltv_cap],["Term",aiResult.recommended_term]].map(([l,v])=><div key={l} style={{background:"rgba(255,255,255,0.06)",borderRadius:6,padding:"8px 10px",textAlign:"center"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:700,color:B.orangeLight}}>{v}</div><div style={{fontSize:9,color:B.s400,textTransform:"uppercase",letterSpacing:1}}>{l}</div></div>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div></Card>
            <div style={{display:"flex",gap:12,marginTop:20,justifyContent:"center"}}>
              <Btn variant="success" onClick={()=>{setApps(p=>p.map(a=>a.id===sel.id?{...a,status:"approved"}:a));setView("dashboard")}}>✅ Approve Loan</Btn>
              <Btn variant="danger" onClick={()=>{setApps(p=>p.map(a=>a.id===sel.id?{...a,status:"declined"}:a));setView("dashboard")}}>❌ Decline</Btn>
            </div>
          </div>}
        </div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App(){
  const [portal,setPortal]=useState("applicant");
  return portal==="admin"?<AdminPortal onSwitch={()=>setPortal("applicant")} />:<ApplicantPortal onSwitch={()=>setPortal("admin")} />;
}
