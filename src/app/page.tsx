"use client";
// ══════════════════════════════════════════════════════════════════
// شواهد تعليمية — Main App (Production with Supabase)
// ══════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { toast } from "sonner";
import type { TeacherRow, ReportRow } from "@/lib/supabase";

// ── Theme ──────────────────────────────────────────────────────
const T = {
  primary:"#0d9488", primaryDk:"#0f766e", primaryLt:"#ccfbf1", primaryMd:"#14b8a6",
  bg:"#f8fafc", white:"#ffffff", text:"#1e293b", sub:"#64748b", border:"#e2e8f0",
};

// ── Constants ──────────────────────────────────────────────────
const MAX_PHOTOS  = 4;
const GRADES      = ["الصف الأول","الصف الثاني","الصف الثالث","الصف الرابع","الصف الخامس","الصف السادس","الصف السابع","الصف الثامن","الصف التاسع","الصف العاشر","الصف الحادي عشر","الصف الثاني عشر"];
const SUBJECTS    = ["اللغة العربية","الرياضيات","العلوم","اللغة الإنجليزية","التربية الإسلامية","الاجتماعيات","الحاسب الآلي","الفنون","التربية البدنية","الكيمياء","الفيزياء","الأحياء"];
const ACT_TYPES   = ["تجربة علمية","عمل جماعي","عرض تقديمي","نشاط صفي","برنامج علاجي","برنامج إثرائي","حصة نموذجية","اجتماع أولياء أمور","مسابقة","ورشة عمل","تقويم ومتابعة","مشروع طلابي"];

// ── Icon paths ─────────────────────────────────────────────────
const PX: Record<string,string> = {
  home:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  reports:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  plus:"M12 5v14M5 12h14",
  user:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z",
  logout:"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  camera:"M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a5 5 0 100-10 5 5 0 000 10z",
  check:"M20 6L9 17l-5-5",
  back:"M19 12H5M12 19l-7-7 7-7",
  print:"M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z",
  trash:"M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  moon:"M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  sun:"M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M17 12a5 5 0 11-10 0 5 5 0 0110 0z",
  spark:"M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z",
  upload:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  x:"M18 6L6 18M6 6l12 12",
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  chevD:"M6 9l6 6 6-6",
  chevU:"M18 15l-6-6-6 6",
  tag:"M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  share:"M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98M21 5a3 3 0 11-6 0 3 3 0 016 0zM9 12a3 3 0 11-6 0 3 3 0 016 0zM21 19a3 3 0 11-6 0 3 3 0 016 0z",
  pdf:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h3",
  mail:"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  eye:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
};

function Ic({ n, s=24, col }: { n:string; s?:number; col?:string }) {
  const d = PX[n]; if (!d) return null;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke={col||"currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>
    </svg>
  );
}

// ── Face blur ──────────────────────────────────────────────────
async function blurFaces(dataUrl: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      // Skin-tone detection
      const id = ctx.getImageData(0,0,canvas.width,canvas.height).data;
      const cs = 32, cols = Math.ceil(canvas.width/cs), rows = Math.ceil(canvas.height/cs);
      let minR=rows,maxR=0,minC=cols,maxC=0,found=false;
      for (let row=0;row<Math.min(rows,10);row++) {
        for (let col=0;col<cols;col++) {
          let skin=0,tot=0;
          for (let dy=0;dy<cs;dy+=3) for (let dx=0;dx<cs;dx+=3) {
            const x=col*cs+dx,y=row*cs+dy;
            if(x>=canvas.width||y>=canvas.height) continue;
            const i=(y*canvas.width+x)*4;
            const r=id[i],g=id[i+1],b=id[i+2];
            if(r>90&&g>50&&b>20&&r>g&&r>b&&r-b>15&&Math.abs(r-g)<35) skin++;
            tot++;
          }
          if(tot>0&&skin/tot>0.2){minR=Math.min(minR,row);maxR=Math.max(maxR,row);minC=Math.min(minC,col);maxC=Math.max(maxC,col);found=true;}
        }
      }
      const region = found
        ? { x:(minC*cs)-cs*0.5, y:(minR*cs)-cs*0.5, w:(maxC-minC+2)*cs, h:(maxR-minR+2)*cs }
        : { x:canvas.width*0.15, y:0, w:canvas.width*0.7, h:canvas.height*0.4 };
      const {x,y,w,h} = region;
      const bx=Math.max(0,Math.floor(x)),by=Math.max(0,Math.floor(y));
      const bw=Math.min(canvas.width-bx,Math.floor(w)),bh=Math.min(canvas.height-by,Math.floor(h));
      const bs=Math.max(6,Math.floor(Math.min(bw,bh)/12));
      for(let px=bx;px<bx+bw;px+=bs) for(let py=by;py<by+bh;py+=bs){
        const pw=Math.min(bs,bx+bw-px),ph=Math.min(bs,by+bh-py);
        if(pw<=0||ph<=0) continue;
        const p=ctx.getImageData(Math.floor(px+pw/2),Math.floor(py+ph/2),1,1).data;
        ctx.fillStyle=`rgb(${p[0]},${p[1]},${p[2]})`;
        ctx.fillRect(px,py,pw,ph);
      }
      resolve(canvas.toDataURL("image/jpeg",0.88));
    };
    img.onerror=()=>resolve(dataUrl);
    img.src=dataUrl;
  });
}

// ── Criteria ───────────────────────────────────────────────────
const CRITERIA = [
  { id:"duties", label:"أداء الواجبات الوظيفية", tags:["الالتزام","إعداد الدروس","تنفيذ المنهج"],
    suggestions:[
      { title:"تحضير يومي شامل",activity:"نشاط صفي",desc:"إعداد تحضير يومي يتضمن الأهداف والأنشطة",fillObjectives:"الالتزام بإعداد الدروس\nتحقيق أهداف المنهج\nتوثيق العملية التعليمية",fillSteps:"مراجعة المنهج\nإعداد الخطة\nتحضير الوسائل\nالتنفيذ\nالتقييم",fillOutcomes:"تنظيم التعليم\nتحقيق التغطية\nتحسين الأداء" },
    ]},
  { id:"strategies", label:"التنوع في استراتيجيات التدريس", tags:["تعاوني","استقصاء","حل مشكلات"],
    suggestions:[
      { title:"التعلم التعاوني",activity:"عمل جماعي",desc:"العمل في مجموعات صغيرة",fillObjectives:"تنويع الاستراتيجيات\nتعزيز التعاون\nتحسين الفهم",fillSteps:"تقسيم الطلاب\nتوزيع الأدوار\nتقديم المهمة\nمتابعة العمل\nالتغذية الراجعة",fillOutcomes:"زيادة التفاعل\nتحسن التعاون\nارتفاع الفهم" },
    ]},
  { id:"tech", label:"توظيف تقنيات التعلم", tags:["تفاعلية","تطبيقات","منصات"],
    suggestions:[
      { title:"العروض التفاعلية",activity:"عرض تقديمي",desc:"عروض تقديمية محفزة",fillObjectives:"محتوى جذاب\nتوظيف التقنية\nتحسين الاستيعاب",fillSteps:"إعداد العرض\nتضمين الوسائط\nأنشطة تفاعلية\nالتقديم\nالتقييم",fillOutcomes:"زيادة التفاعل\nسهولة الاستيعاب\nتنويع المصادر" },
    ]},
  { id:"results", label:"تحسين نتائج المتعلمين", tags:["علاجي","إثرائي","رفع التحصيل"],
    suggestions:[
      { title:"خطة علاجية للمتأخرين",activity:"برنامج علاجي",desc:"برنامج علاجي مخصص",fillObjectives:"تشخيص الضعف\nدعم مخصص\nرفع التحصيل",fillSteps:"تحليل النتائج\nتشخيص الضعف\nخطة فردية\nحصص تقوية\nالمتابعة",fillOutcomes:"ارتفاع المستوى\nتقليص الفجوة\nزيادة الثقة" },
    ]},
  { id:"assessment", label:"تنوع أساليب التقويم", tags:["بنائي","ملفات إنجاز","أقران"],
    suggestions:[
      { title:"ملف الإنجاز",activity:"مشروع طلابي",desc:"توثيق تقدم الطلاب",fillObjectives:"تنويع التقويم\nتوثيق مسيرة التعلم\nالتقويم الذاتي",fillSteps:"شرح الفكرة\nمعايير الأعمال\nجمع الأعمال\nالتأمل الذاتي\nالتقييم",fillOutcomes:"توثيق شامل\nتنظيم ذاتي\nتقويم حقيقي" },
    ]},
];

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
export default function App() {
  const supabase = getSupabaseBrowser();
  const [page, setPage]         = useState<string>("landing");
  const [session, setSession]   = useState<any>(null);
  const [teacher, setTeacher]   = useState<TeacherRow | null>(null);
  const [reports, setReports]   = useState<any[]>([]);
  const [cur, setCur]           = useState<any>(null);
  const [dark, setDark]         = useState(false);
  const [loading, setLoading]   = useState(true);

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadTeacher();
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) loadTeacher();
      else { setTeacher(null); setPage("landing"); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadTeacher = async () => {
    try {
      const res = await fetch("/api/teacher");
      if (res.ok) {
        const data = await res.json();
        setTeacher(data);
        if (!data.is_complete) setPage("profile-setup");
        else { setPage("dashboard"); loadReports(); }
      }
    } catch {}
    setLoading(false);
  };

  const loadReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) { const data = await res.json(); setReports(data); }
    } catch {}
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setReports([]); setCur(null); setPage("landing");
    toast.success("تم تسجيل الخروج");
  };

  const addReport    = (r: any) => setReports(p => [r, ...p]);
  const deleteReport = async (id: string) => {
    await fetch(`/api/reports?id=${id}`, { method:"DELETE" });
    setReports(p => p.filter(r => r.id !== id));
  };
  const updateReport = (u: any) => setReports(p => p.map(r => r.id === u.id ? u : r));

  const ctx = { page,setPage,session,teacher,setTeacher,reports,addReport,deleteReport,updateReport,
                loadReports,cur,setCur,dark,setDark,logout };

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:56,height:56,border:`4px solid ${T.primaryLt}`,borderTopColor:T.primary,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}}/>
        <p style={{color:T.primary,fontWeight:700}}>جارٍ التحميل...</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:dark?"#0f172a":T.bg,color:dark?"#f1f5f9":T.text,fontFamily:"'Cairo','Noto Sans Arabic',Arial,sans-serif",direction:"rtl"}}>
      <style>{`
        .lift{transition:transform .18s,box-shadow .18s} .lift:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.12)}
        .bt{transition:all .14s;cursor:pointer;outline:none} .bt:hover{opacity:.88;transform:translateY(-1px)} .bt:active{transform:translateY(0)}
        .fi{animation:fi .28s ease}
        @keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .tag-p{display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;margin:2px;background:rgba(13,148,136,.1);color:#0f766e;border:1px solid rgba(13,148,136,.2)}
        input,textarea,select{font-family:'Cairo',Arial,sans-serif}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:rgba(13,148,136,.3);border-radius:3px}
        @media print{.no-print{display:none!important}body{background:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
      `}</style>

      {page === "landing"       && <Landing ctx={ctx} />}
      {page === "login"         && <LoginPage ctx={ctx} />}
      {page === "magic-sent"    && <MagicSent ctx={ctx} />}
      {page === "profile-setup" && session && <ProfileSetup ctx={ctx} />}
      {page === "dashboard"     && session && teacher?.is_complete && <Dashboard ctx={ctx} />}
      {page === "reports"       && session && teacher?.is_complete && <Reports ctx={ctx} />}
      {page === "new"           && session && teacher?.is_complete && <NewReport ctx={ctx} />}
      {page === "preview"       && session && cur && <Preview ctx={ctx} />}
      {page === "settings"      && session && <Settings ctx={ctx} />}
    </div>
  );
}

// ── Landing ────────────────────────────────────────────────────
function Landing({ ctx }: any) {
  const { setPage, dark } = ctx;
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(150deg,${T.primaryDk} 0%,${T.primary} 55%,${T.primaryDk} 100%)`}}>
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,.95)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
            <Ic n="spark" s={24} col={T.primary}/>
          </div>
          <span style={{color:"#fff",fontWeight:900,fontSize:18}}>شواهد تعليمية</span>
        </div>
        <button onClick={()=>setPage("login")} className="bt"
          style={{background:"rgba(255,255,255,.2)",border:"1px solid rgba(255,255,255,.35)",color:"#fff",padding:"8px 20px",borderRadius:12,fontWeight:700,fontSize:14}}>
          تسجيل الدخول
        </button>
      </header>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"32px 20px 80px"}} className="fi">
        <div style={{width:100,height:100,borderRadius:24,background:"rgba(255,255,255,.15)",border:"2px solid rgba(255,255,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24}}>
          <Ic n="spark" s={48} col="white"/>
        </div>
        <h1 style={{fontSize:36,fontWeight:900,color:"#fff",marginBottom:16,lineHeight:1.3}}>
          وثِّق أنشطتك التعليمية<br/><span style={{color:"#ccfbf1"}}>بالذكاء الاصطناعي</span>
        </h1>
        <p style={{color:"rgba(255,255,255,.85)",fontSize:16,maxWidth:480,marginBottom:32,lineHeight:1.7}}>
          ارفع صور النشاط وسيُنشئ النظام تقريراً رسمياً تلقائياً وفق معايير تقييم المعلم في المملكة العربية السعودية
        </p>
        <button onClick={()=>setPage("login")} className="bt"
          style={{background:"#fff",color:T.primary,padding:"16px 52px",borderRadius:16,fontWeight:900,fontSize:18,border:"none",boxShadow:"0 8px 28px rgba(0,0,0,.2)"}}>
          ابدأ التوثيق مجاناً ←
        </button>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginTop:48,maxWidth:600,width:"100%"}}>
          {[{n:"camera",t:"رفع الصور",d:"حتى 4 صور لكل تقرير"},{n:"shield",t:"حماية الخصوصية",d:"تمويه ذكي للوجوه"},{n:"spark",t:"ذكاء اصطناعي",d:"تقرير رسمي تلقائي"}].map((f,i)=>(
            <div key={i} style={{padding:18,borderRadius:14,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.15)",textAlign:"center"}}>
              <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>
                <Ic n={f.n} s={20} col="white"/>
              </div>
              <p style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:3}}>{f.t}</p>
              <p style={{color:"rgba(255,255,255,.7)",fontSize:11}}>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Login with Magic Link ──────────────────────────────────────
function LoginPage({ ctx }: any) {
  const { setPage, dark } = ctx;
  const supabase = getSupabaseBrowser();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const card=dark?"#1e293b":"#fff"; const inp=dark?"#0f172a":"#f8fafc"; const bdr=dark?"#334155":T.border;

  const sendMagicLink = async () => {
    if (!email || !email.includes("@")) { toast.error("يرجى إدخال بريد إلكتروني صحيح"); return; }
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) { toast.error("فشل إرسال الرابط: " + error.message); }
    else { ctx.setPage("magic-sent"); }
    setSending(false);
  };

  const loginGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:dark?"#0f172a":`linear-gradient(135deg,${T.primaryLt},#fff)`}}>
      <div style={{width:"100%",maxWidth:420,background:card,borderRadius:24,padding:32,boxShadow:"0 20px 60px rgba(0,0,0,.12)"}} className="fi">
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:64,height:64,borderRadius:18,background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
            <Ic n="spark" s={30} col="white"/>
          </div>
          <h1 style={{fontSize:22,fontWeight:900,color:T.primary}}>شواهد تعليمية</h1>
          <p style={{fontSize:13,color:T.sub,marginTop:4}}>تسجيل الدخول أو إنشاء حساب جديد</p>
        </div>

        {/* Google */}
        <button onClick={loginGoogle} className="bt"
          style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`1px solid ${bdr}`,background:card,display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontWeight:700,fontSize:14,marginBottom:14,color:T.text}}>
          <svg width={18} height={18} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          تسجيل الدخول بواسطة Google
        </button>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{flex:1,height:1,background:bdr}}/><span style={{fontSize:11,color:T.sub,flexShrink:0}}>أو عبر البريد الإلكتروني</span><div style={{flex:1,height:1,background:bdr}}/>
        </div>

        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:12,fontWeight:600,color:T.sub,marginBottom:5}}>البريد الإلكتروني</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="teacher@school.edu.sa"
            onKeyDown={e=>e.key==="Enter"&&sendMagicLink()}
            style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`1px solid ${bdr}`,background:inp,fontSize:14,outline:"none"}}/>
        </div>

        <button onClick={sendMagicLink} disabled={sending} className="bt"
          style={{width:"100%",padding:14,borderRadius:14,background:T.primary,color:"#fff",fontWeight:900,fontSize:15,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {sending
            ? <><span style={{width:16,height:16,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 1s linear infinite"}}/> جارٍ الإرسال...</>
            : <><Ic n="mail" s={17} col="white"/> إرسال رابط الدخول</>}
        </button>

        <div style={{marginTop:16,padding:10,borderRadius:10,background:"#f0fdfa",border:`1px solid ${T.primary}33`,textAlign:"center",fontSize:12,color:T.primaryDk}}>
          <strong>سيُرسَل رابط الدخول إلى بريدك</strong><br/>
          لا تحتاج إلى كلمة مرور — رابط مؤقت آمن
        </div>
        <button onClick={()=>setPage("landing")} className="bt" style={{width:"100%",marginTop:10,fontSize:12,color:T.sub,textAlign:"center",background:"none",border:"none"}}>→ العودة للصفحة الرئيسية</button>
      </div>
    </div>
  );
}

// ── Magic Link Sent ────────────────────────────────────────────
function MagicSent({ ctx }: any) {
  const { setPage } = ctx;
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${T.primaryLt},#fff)`}}>
      <div style={{maxWidth:400,padding:40,textAlign:"center",background:"#fff",borderRadius:24,boxShadow:"0 20px 60px rgba(0,0,0,.1)"}} className="fi">
        <div style={{width:80,height:80,borderRadius:"50%",background:T.primaryLt,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
          <Ic n="mail" s={40} col={T.primary}/>
        </div>
        <h2 style={{fontSize:22,fontWeight:900,color:T.primary,marginBottom:10}}>تحقق من بريدك!</h2>
        <p style={{color:T.sub,fontSize:14,lineHeight:1.8,marginBottom:24}}>
          أرسلنا رابط الدخول إلى بريدك الإلكتروني.<br/>
          انقر على الرابط الموجود في الإيميل لتسجيل الدخول.
        </p>
        <button onClick={()=>setPage("login")} className="bt"
          style={{padding:"12px 28px",borderRadius:12,background:T.primary,color:"#fff",fontWeight:700,border:"none",fontSize:14}}>
          ← العودة لتسجيل الدخول
        </button>
      </div>
    </div>
  );
}

// ── Profile Setup ──────────────────────────────────────────────
function ProfileSetup({ ctx }: any) {
  const { setTeacher, setPage, loadReports, dark } = ctx;
  const [form, setForm] = useState({ name:"", phone:"", gender:"male" as "male"|"female", school:"", subject:"" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.phone || form.phone.length < 9) { toast.error("يرجى إدخال رقم جوال صحيح"); return; }
    if (!form.name) { toast.error("يرجى إدخال الاسم"); return; }
    setSaving(true);
    const res = await fetch("/api/teacher", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    if (res.ok) {
      const data = await res.json();
      setTeacher(data); await loadReports();
      setPage("dashboard"); toast.success("تم حفظ الملف الشخصي ✓");
    } else { toast.error("حدث خطأ، يرجى المحاولة"); }
    setSaving(false);
  };

  const card=dark?"#1e293b":"#fff"; const bdr=dark?"#334155":T.border; const inp=dark?"#0f172a":"#f8fafc";

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:dark?"#0f172a":`linear-gradient(135deg,${T.primaryLt},#fff)`}}>
      <div style={{width:"100%",maxWidth:440,background:card,borderRadius:24,padding:32,boxShadow:"0 20px 60px rgba(0,0,0,.12)"}} className="fi">
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:60,height:60,borderRadius:18,background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><Ic n="user" s={28} col="white"/></div>
          <h2 style={{fontSize:20,fontWeight:900,color:T.primary}}>أكمل ملفك الشخصي</h2>
          <p style={{fontSize:13,color:T.sub,marginTop:4}}>مطلوب لإنشاء التقارير</p>
        </div>
        {[{l:"الاسم الكامل *",f:"name",t:"text",p:"أ. محمد الأحمدي"},{l:"اسم المدرسة",f:"school",t:"text",p:"مدرسة التميز"},{l:"المادة الرئيسية",f:"subject",t:"text",p:"العلوم"}].map(({l,f,t,p})=>(
          <div key={f} style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:T.sub,marginBottom:5}}>{l}</label>
            <input type={t} value={(form as any)[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} placeholder={p}
              style={{width:"100%",padding:"11px 13px",borderRadius:12,border:`1px solid ${bdr}`,background:inp,fontSize:13,outline:"none"}}/>
          </div>
        ))}
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:12,fontWeight:600,color:T.sub,marginBottom:5}}>رقم الجوال *</label>
          <div style={{display:"flex"}} dir="ltr">
            <span style={{padding:"11px 12px",borderRadius:"0 12px 12px 0",background:"#f1f5f9",border:`1px solid ${bdr}`,borderLeft:"none",fontSize:13,color:T.sub,flexShrink:0}}>+966</span>
            <input type="tel" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value.replace(/\D/g,"")}))}
              placeholder="5XXXXXXXX" maxLength={9} dir="ltr"
              style={{flex:1,padding:"11px 14px",borderRadius:"12px 0 0 12px",border:`1px solid ${bdr}`,outline:"none",fontSize:14,background:inp}}/>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:12,fontWeight:600,color:T.sub,marginBottom:8}}>الجنس *</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["male","ذكر 👨‍🏫"],["female","أنثى 👩‍🏫"]].map(([v,l])=>(
              <button key={v} onClick={()=>setForm(p=>({...p,gender:v as "male"|"female"}))} className="bt"
                style={{padding:"11px",borderRadius:12,border:`2px solid ${form.gender===v?T.primary:bdr}`,background:form.gender===v?T.primaryLt:"transparent",fontWeight:700,color:form.gender===v?T.primary:T.sub,fontSize:13}}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <button onClick={save} disabled={saving} className="bt"
          style={{width:"100%",padding:14,borderRadius:14,background:T.primary,color:"#fff",fontWeight:900,fontSize:15,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {saving?<><span style={{width:14,height:14,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 1s linear infinite"}}/>حفظ...</>:"حفظ ومتابعة ←"}
        </button>
        <p style={{fontSize:10,textAlign:"center",marginTop:10,color:T.sub}}>🔒 بياناتك محفوظة بأمان في قاعدة البيانات</p>
      </div>
    </div>
  );
}

// ── App Shell ──────────────────────────────────────────────────
function Shell({ ctx, title, children }: any) {
  const { page, setPage, teacher, dark, setDark, logout } = ctx;
  const navBg=dark?"#1e293b":"#fff"; const navBdr=dark?"#334155":T.border;
  const TABS=[{id:"dashboard",n:"home",l:"الرئيسية"},{id:"reports",n:"reports",l:"التقارير"},{id:"new",n:"plus",l:"وثِّق"},{id:"settings",n:"user",l:"حسابي"}];
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <header className="no-print" style={{position:"sticky",top:0,zIndex:40,background:T.primary,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}>
        <div><h2 style={{fontWeight:800,fontSize:16,color:"#fff"}}>{title}</h2><p style={{fontSize:11,color:"rgba(255,255,255,.75)"}}>{teacher?.school||""}</p></div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setDark((d:boolean)=>!d)} className="bt" style={{padding:8,borderRadius:10,background:"rgba(255,255,255,.18)",color:"#fff",border:"none"}}><Ic n={dark?"sun":"moon"} s={17} col="white"/></button>
          <button onClick={logout} className="bt" style={{padding:8,borderRadius:10,background:"rgba(255,255,255,.18)",color:"#fff",border:"none"}}><Ic n="logout" s={17} col="white"/></button>
        </div>
      </header>
      <main style={{flex:1,paddingBottom:80,overflowY:"auto"}}>{children}</main>
      <nav className="no-print" style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,background:navBg,borderTop:`1px solid ${navBdr}`,boxShadow:"0 -2px 12px rgba(0,0,0,.07)"}}>
        <div style={{display:"flex",justifyContent:"space-around",alignItems:"center",padding:"6px 0 4px"}}>
          {TABS.map(tab=>{
            const active=page===tab.id;
            return (
              <button key={tab.id} onClick={()=>setPage(tab.id)} className="bt"
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 10px",border:"none",background:"none"}}>
                {tab.id==="new"
                  ? <div style={{width:44,height:44,borderRadius:14,background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 12px ${T.primary}44`}}><Ic n="plus" s={24} col="white"/></div>
                  : <div style={{width:44,height:44,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:active?T.primaryLt:"transparent"}}>
                      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={active?T.primary:"#94a3b8"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={PX[tab.n]}/></svg>
                    </div>
                }
                <span style={{fontSize:11,fontWeight:700,color:active?T.primary:dark?"#64748b":"#94a3b8"}}>{tab.l}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ── Report Card ────────────────────────────────────────────────
function RCard({ r, ctx }: any) {
  const { setCur, setPage, deleteReport, dark } = ctx;
  const SL:any={draft:"#fef3c7|#d97706",ready:"#d1fae5|#059669",shared:"#dbeafe|#2563eb"};
  const SN:any={draft:"مسودة",ready:"مكتمل",shared:"تمت المشاركة"};
  const [bg,fg]=(SL[r.status]||SL.ready).split("|");
  const firstImg = r.report_images?.[0];
  return (
    <div className="lift" onClick={()=>{setCur(r);setPage("preview");}}
      style={{padding:14,borderRadius:16,background:dark?"#1e293b":"#fff",border:`1px solid ${dark?"#334155":T.border}`,cursor:"pointer",position:"relative",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        {firstImg && <div style={{width:54,height:54,borderRadius:10,overflow:"hidden",flexShrink:0,background:"#f8fafc"}}><div style={{width:"100%",height:"100%",background:T.primaryLt,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic n="camera" s={22} col={T.primary}/></div></div>}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
            <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,fontWeight:700,background:bg,color:fg}}>{SN[r.status]||"مكتمل"}</span>
            <span style={{fontSize:11,color:T.sub}}>{r.date}</span>
          </div>
          <h4 style={{fontWeight:800,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</h4>
          <p style={{fontSize:12,color:T.sub,marginTop:2}}>{r.subject} • {r.grade}</p>
          {r.criteria_label&&<p style={{fontSize:11,color:T.primary,fontWeight:700,marginTop:3}}>📋 {r.criteria_label}</p>}
        </div>
      </div>
      <button onClick={e=>{e.stopPropagation();if(confirm("حذف هذا التقرير؟"))deleteReport(r.id);}}
        style={{position:"absolute",left:10,top:10,padding:6,borderRadius:8,background:"#fee2e2",color:"#ef4444",border:"none"}} className="bt">
        <Ic n="trash" s={13} col="#ef4444"/>
      </button>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────
function Dashboard({ ctx }: any) {
  const { teacher, reports, setPage, dark } = ctx;
  const cardBg=dark?"#1e293b":"#fff";
  const stats=[
    {l:"تمت المشاركة",v:reports.filter((r:any)=>r.status==="shared").length,col:"#2563eb",bg:"#dbeafe",n:"share"},
    {l:"جاهزة",v:reports.filter((r:any)=>r.status==="ready").length,col:"#059669",bg:"#d1fae5",n:"check"},
    {l:"الإجمالي",v:reports.length,col:T.text,bg:dark?"#334155":"#f1f5f9",n:"reports"},
  ];
  return (
    <Shell ctx={ctx} title="الرئيسية">
      <div style={{padding:16}} className="fi">
        <div style={{padding:20,borderRadius:20,background:T.primary,color:"#fff",marginBottom:16,backgroundImage:"radial-gradient(circle at 80% 20%,rgba(255,255,255,.12) 0%,transparent 60%)"}}>
          <p style={{fontSize:12,opacity:.85,marginBottom:4}}>مدعوم بالذكاء الاصطناعي ✦</p>
          <h2 style={{fontSize:20,fontWeight:900,lineHeight:1.3,marginBottom:8}}>وثِّق أنشطتك التعليمية<br/>من الصور فقط</h2>
          <button onClick={()=>setPage("new")} className="bt"
            style={{background:"#fff",color:T.primary,padding:"11px 20px",borderRadius:12,fontWeight:800,fontSize:14,display:"inline-flex",alignItems:"center",gap:8,border:"none"}}>
            <Ic n="camera" s={17} col={T.primary}/> وثِّق الآن
          </button>
        </div>
        <p style={{fontWeight:700,marginBottom:10,fontSize:15}}>مرحباً، {teacher?.name?.split(" ").slice(-1)[0]}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
          {stats.map((s,i)=>(
            <div key={i} style={{padding:14,borderRadius:16,background:cardBg,border:`1px solid ${dark?"#334155":T.border}`,textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:900,color:s.col}}>{s.v}</div>
              <div style={{fontSize:11,color:T.sub,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        {reports.length>0&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p style={{fontWeight:800,fontSize:15}}>أحدث التقارير</p>
            <button onClick={()=>setPage("reports")} className="bt" style={{fontSize:12,color:T.primary,fontWeight:700,background:"none",border:"none"}}>عرض الكل ←</button>
          </div>
          {reports.slice(0,3).map((r:any)=><RCard key={r.id} r={r} ctx={ctx}/>)}
        </>}
      </div>
    </Shell>
  );
}

// ── Reports ────────────────────────────────────────────────────
function Reports({ ctx }: any) {
  const { reports, setPage, dark } = ctx;
  const [q, setQ] = useState("");
  const filtered = reports.filter((r:any)=>r.title?.includes(q)||r.subject?.includes(q)||r.criteria_label?.includes(q));
  return (
    <Shell ctx={ctx} title="التقارير">
      <div style={{padding:16}} className="fi">
        <input type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 ابحث..."
          style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`1px solid ${dark?"#334155":T.border}`,background:dark?"#1e293b":"#fff",fontSize:14,outline:"none",marginBottom:12}}/>
        {filtered.length===0
          ? <div style={{padding:36,textAlign:"center"}}><p style={{color:T.sub,marginBottom:14}}>لا توجد تقارير</p><button onClick={()=>setPage("new")} className="bt" style={{padding:"10px 22px",borderRadius:12,background:T.primary,color:"#fff",fontWeight:700,border:"none"}}>أنشئ أول تقرير</button></div>
          : filtered.map((r:any)=><RCard key={r.id} r={r} ctx={ctx}/>)
        }
      </div>
    </Shell>
  );
}

// ── New Report Wizard ──────────────────────────────────────────
function NewReport({ ctx }: any) {
  const { setPage, addReport, teacher, dark } = ctx;
  const [step, setStep]       = useState(1);
  const [photos, setPhotos]   = useState<string[]>([]);
  const [blurred, setBlurred] = useState<string[]>([]);
  const [blurOn, setBlurOn]   = useState(false);
  const [blurring, setBling]  = useState(false);
  const [selC, setSelC]       = useState<any>(null);
  const [openC, setOpenC]     = useState<string|null>(null);
  const [form, setForm]       = useState({title:"",date:new Date().toISOString().split("T")[0],grade:"",subject:teacher?.subject||"",activityType:"",description:""});
  const [gen, setGen]         = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [fErr, setFErr]       = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const cardBg=dark?"#1e293b":"#fff"; const inp=dark?"#0f172a":"#f8fafc"; const bdr=dark?"#334155":T.border;
  const STEPS=["الصور","المعيار","البيانات","التوليد"];

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) { toast.error(`الحد الأقصى ${MAX_PHOTOS} صور`); return; }
    Array.from(e.target.files||[]).slice(0,remaining).forEach(f => {
      const r = new FileReader();
      r.onload = ev => {
        const src = ev.target?.result as string;
        setPhotos(p=>[...p,src]); setBlurred(p=>[...p,src]);
      };
      r.readAsDataURL(f);
    });
  };

  const toggleBlur = async (on: boolean) => {
    setBlurOn(on);
    if (!on) { setBlurred([...photos]); return; }
    setBling(true);
    const res = await Promise.all(photos.map(blurFaces));
    setBlurred(res); setBling(false);
    toast.success("تم تمويه الوجوه ✓");
  };

  const removePhoto = (i: number) => {
    setPhotos(p=>p.filter((_,j)=>j!==i));
    setBlurred(p=>p.filter((_,j)=>j!==i));
  };

  const applySug = (c: any, s: any) => {
    setSelC(c);
    setForm(f=>({...f,title:s.title,activityType:s.activity}));
    setGen({objectives:s.fillObjectives,steps:s.fillSteps,outcomes:s.fillOutcomes,tools:"",evaluation:""});
    setOpenC(null); setStep(3);
  };

  const generate = async () => {
    if (!form.title||!form.grade||!form.subject||!form.activityType) { setFErr("يرجى ملء الحقول المطلوبة (*)"); return; }
    setLoading(true); setFErr("");
    try {
      const res = await fetch("/api/generate-report",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form,criteriaLabel:selC?.label||"",teacherName:teacher?.name,schoolName:teacher?.school})
      });
      if (res.ok) { setGen(await res.json()); setStep(4); }
      else throw new Error("API error");
    } catch {
      setGen({objectives:"تحقيق الأهداف التعليمية\nتعزيز مشاركة الطلاب\nتوثيق النشاط",steps:"التهيئة\nتقديم المهمة\nالتنفيذ\nعرض النتائج\nالتقييم",outcomes:"تحقيق الأهداف\nمشاركة إيجابية\nتوثيق رسمي",tools:"الكتاب المدرسي - السبورة - أوراق العمل",evaluation:"نشاط تعليمي متميز حقق أهدافه."});
      setStep(4);
    }
    setLoading(false);
  };

  const save = async () => {
    if (photos.length === 0) { toast.error("يجب إضافة صورة واحدة على الأقل"); return; }
    setSaving(true);
    try {
      // 1. Create report in DB
      const reportRes = await fetch("/api/reports",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          title:form.title, date:form.date, grade:form.grade,
          subject:form.subject, activity_type:form.activityType,
          description:form.description, ...gen,
          criteria_id:selC?.id||"", criteria_label:selC?.label||"",
        })
      });
      if (!reportRes.ok) throw new Error(await reportRes.text());
      const report = await reportRes.json();

      // 2. Upload images
      await Promise.all(blurred.map((img, i) =>
        fetch("/api/upload-image",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({imageBase64:img,reportId:report.id,sortOrder:i,isBlurred:blurOn})
        })
      ));

      addReport({...report, report_images:blurred.map((_,i)=>({sort_order:i})), photos:blurred });
      setPage("reports"); toast.success("تم حفظ التقرير بنجاح ✓");
    } catch (e:any) {
      toast.error("فشل الحفظ: " + e.message);
    }
    setSaving(false);
  };

  const pct = ((step-1)/3)*100;

  return (
    <Shell ctx={ctx} title="تقرير جديد">
      <div style={{padding:16}} className="fi">
        {/* Progress */}
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            {STEPS.map((s,i)=><span key={i} style={{fontSize:11,fontWeight:700,color:i+1<=step?T.primary:T.sub}}>{s}</span>)}
          </div>
          <div style={{height:5,borderRadius:99,background:dark?"#334155":"#e2e8f0"}}>
            <div style={{height:"100%",borderRadius:99,background:`linear-gradient(90deg,${T.primary},${T.primaryMd})`,width:`${pct}%`,transition:"width .4s ease"}}/>
          </div>
        </div>

        {/* Step 1 */}
        {step===1&&<div>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,background:"#fef3c7",border:"1px solid #fde68a",marginBottom:14}}>
            <span style={{fontSize:16}}>📸</span>
            <p style={{fontWeight:700,fontSize:13,color:"#92400e"}}>الصور مطلوبة — لا يمكن إنشاء تقرير بدون صور (1–{MAX_PHOTOS})</p>
          </div>
          <div onClick={()=>fileRef.current?.click()} className="bt"
            style={{padding:36,borderRadius:16,border:`2px dashed ${dark?"#334155":T.border}`,textAlign:"center",background:dark?"#1e293b":"#f8fafc",marginBottom:12}}>
            <Ic n="upload" s={40} col={T.sub}/>
            <p style={{fontWeight:700,color:T.sub,marginTop:10}}>{photos.length>=MAX_PHOTOS?"وصلت للحد الأقصى":"انقر لرفع الصور"}</p>
            <p style={{fontSize:11,color:T.sub,marginTop:3}}>{photos.length}/{MAX_PHOTOS} صور</p>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={onFiles}/>
          </div>
          {photos.length>0&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderRadius:14,background:cardBg,border:`1px solid ${bdr}`,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Ic n="shield" s={18} col={blurOn?T.primary:T.sub}/>
              <div><p style={{fontWeight:700,fontSize:13}}>تمويه ذكي للوجوه</p><p style={{fontSize:11,color:T.sub}}>كشف الوجوه تلقائياً</p></div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {blurring&&<span style={{fontSize:10,color:"#d97706",fontWeight:600}}>جارٍ...</span>}
              <button onClick={()=>toggleBlur(!blurOn)} disabled={blurring}
                style={{width:50,height:26,borderRadius:99,border:"none",cursor:"pointer",position:"relative",background:blurOn?T.primary:"#cbd5e1"}}>
                <span style={{position:"absolute",top:3,width:20,height:20,background:"#fff",borderRadius:"50%",boxShadow:"0 2px 4px rgba(0,0,0,.15)",transition:"all .2s",right:blurOn?"3px":"auto",left:blurOn?"auto":"3px"}}/>
              </button>
            </div>
          </div>}
          {blurred.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:14}}>
            {blurred.map((p,i)=>(
              <div key={i} style={{position:"relative",borderRadius:12,overflow:"hidden",border:`1px solid ${bdr}`}}>
                <img src={p} alt="" style={{width:"100%",height:140,objectFit:"contain",background:"#f8fafc",display:"block"}}/>
                {blurOn&&<div style={{position:"absolute",top:4,right:4,background:T.primary,color:"#fff",fontSize:9,padding:"2px 6px",borderRadius:99,fontWeight:700}}>🔒</div>}
                <button onClick={()=>removePhoto(i)} style={{position:"absolute",top:4,left:4,width:22,height:22,borderRadius:"50%",background:"#ef4444",color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} className="bt">
                  <Ic n="x" s={11} col="white"/>
                </button>
              </div>
            ))}
          </div>}
          <button onClick={()=>{if(photos.length===0){toast.error("يجب إضافة صورة أولاً");return;}setStep(2);}} className="bt"
            style={{width:"100%",padding:14,borderRadius:14,background:T.primary,color:"#fff",fontWeight:800,fontSize:15,border:"none"}}>
            التالي ← اختيار معيار التقييم
          </button>
        </div>}

        {/* Step 2 */}
        {step===2&&<div>
          <p style={{fontSize:12,color:T.sub,fontWeight:600,marginBottom:10}}>اختر معيار التقييم (اختياري):</p>
          {CRITERIA.map(c=>{
            const isOpen=openC===c.id,isSel=selC?.id===c.id;
            return (
              <div key={c.id} style={{borderRadius:14,border:`1px solid ${isSel?T.primary:bdr}`,overflow:"hidden",marginBottom:8,background:cardBg}}>
                <button onClick={()=>setOpenC(isOpen?null:c.id)} className="bt"
                  style={{width:"100%",padding:"11px 13px",display:"flex",alignItems:"center",justifyContent:"space-between",border:"none",background:"transparent",textAlign:"right"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:30,height:30,borderRadius:8,background:isSel?T.primary:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Ic n="tag" s={13} col={isSel?"white":T.sub}/>
                    </div>
                    <p style={{fontWeight:700,fontSize:12,color:isSel?T.primary:T.text}}>{c.label}</p>
                  </div>
                  <Ic n={isOpen?"chevU":"chevD"} s={15} col={T.sub}/>
                </button>
                {isOpen&&<div style={{borderTop:`1px solid ${bdr}`,padding:"8px 10px"}}>
                  {c.suggestions.map((s,si)=>(
                    <button key={si} onClick={()=>applySug(c,s)} className="bt"
                      style={{width:"100%",textAlign:"right",padding:"9px 11px",borderRadius:10,border:`1px solid ${bdr}`,background:dark?"#0f172a":"#f8fafc",marginBottom:5,cursor:"pointer"}}>
                      <p style={{fontWeight:700,fontSize:12}}>{s.title}</p>
                      <p style={{fontSize:11,color:T.sub}}>{s.desc}</p>
                    </button>
                  ))}
                  <button onClick={()=>{setSelC(c);setOpenC(null);setStep(3);}} className="bt"
                    style={{width:"100%",padding:9,borderRadius:10,border:`1px solid ${bdr}`,background:"transparent",cursor:"pointer",fontSize:12,color:T.sub,fontWeight:600}}>
                    اختيار يدوياً →
                  </button>
                </div>}
              </div>
            );
          })}
          <div style={{display:"flex",gap:10,marginTop:10}}>
            <button onClick={()=>setStep(1)} className="bt" style={{flex:1,padding:13,borderRadius:14,background:dark?"#334155":"#f1f5f9",color:T.text,fontWeight:700,border:"none"}}>← رجوع</button>
            <button onClick={()=>setStep(3)} className="bt" style={{flex:1,padding:13,borderRadius:14,background:T.primary,color:"#fff",fontWeight:700,border:"none"}}>تخطي ←</button>
          </div>
        </div>}

        {/* Step 3 */}
        {step===3&&<div>
          {[{l:"عنوان النشاط *",f:"title",t:"text",p:"مثال: تجربة خصائص الماء"},{l:"تاريخ النشاط *",f:"date",t:"date"},{l:"وصف",f:"description",t:"textarea",p:"اكتب وصفاً..."}].map(({l,f,t,p}:any)=>(
            <div key={f} style={{marginBottom:12}}>
              <label style={{display:"block",fontSize:12,fontWeight:600,color:T.sub,marginBottom:5}}>{l}</label>
              {t==="textarea"
                ? <textarea value={(form as any)[f]} onChange={e=>setForm((p:any)=>({...p,[f]:e.target.value}))} placeholder={p} rows={3} style={{width:"100%",padding:"10px 13px",borderRadius:12,border:`1px solid ${bdr}`,background:inp,fontSize:13,outline:"none",resize:"none"}}/>
                : <input type={t} value={(form as any)[f]} onChange={e=>setForm((p:any)=>({...p,[f]:e.target.value}))} placeholder={p||""} style={{width:"100%",padding:"10px 13px",borderRadius:12,border:`1px solid ${bdr}`,background:inp,fontSize:13,outline:"none"}}/>
              }
            </div>
          ))}
          {[{l:"الصف *",f:"grade",opts:GRADES},{l:"المادة *",f:"subject",opts:SUBJECTS},{l:"نوع النشاط *",f:"activityType",opts:ACT_TYPES}].map(({l,f,opts})=>(
            <div key={f} style={{marginBottom:12}}>
              <label style={{display:"block",fontSize:12,fontWeight:600,color:T.sub,marginBottom:5}}>{l}</label>
              <select value={(form as any)[f]} onChange={e=>setForm((p:any)=>({...p,[f]:e.target.value}))} style={{width:"100%",padding:"10px 13px",borderRadius:12,border:`1px solid ${bdr}`,background:inp,fontSize:13,outline:"none"}}>
                <option value="">-- اختر --</option>
                {opts.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {fErr&&<div style={{padding:"9px 13px",borderRadius:10,background:"#fee2e2",color:"#dc2626",fontSize:12,marginBottom:10}}>{fErr}</div>}
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setStep(2)} className="bt" style={{flex:1,padding:13,borderRadius:14,background:dark?"#334155":"#f1f5f9",color:T.text,fontWeight:700,border:"none"}}>← رجوع</button>
            <button onClick={generate} disabled={loading} className="bt" style={{flex:1,padding:13,borderRadius:14,background:"#f59e0b",color:"#fff",fontWeight:700,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {loading?<><span style={{width:14,height:14,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 1s linear infinite"}}/>توليد...</>:"✨ توليد بالذكاء الاصطناعي"}
            </button>
          </div>
        </div>}

        {/* Step 4 */}
        {step===4&&gen&&<div>
          <div style={{padding:13,borderRadius:14,background:cardBg,border:`1px solid ${bdr}`,marginBottom:12}}>
            <h3 style={{fontSize:12,fontWeight:800,color:"#f59e0b",marginBottom:12}}>✨ التقرير المُولَّد — يمكنك التعديل</h3>
            {[{l:"الأهداف",f:"objectives"},{l:"خطوات التنفيذ",f:"steps"},{l:"النتائج",f:"outcomes"},{l:"الأدوات",f:"tools"},{l:"التقييم",f:"evaluation"}].map(({l,f})=>(
              <div key={f} style={{marginBottom:9}}>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:T.sub,marginBottom:3}}>{l}</label>
                <textarea value={gen[f]||""} onChange={e=>setGen((p:any)=>({...p,[f]:e.target.value}))} rows={3}
                  style={{width:"100%",padding:"9px 11px",borderRadius:10,border:`1px solid ${bdr}`,background:inp,fontSize:12,outline:"none",resize:"none"}}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setStep(3)} className="bt" style={{flex:1,padding:13,borderRadius:14,background:dark?"#334155":"#f1f5f9",color:T.text,fontWeight:700,border:"none"}}>← رجوع</button>
            <button onClick={save} disabled={saving} className="bt" style={{flex:1,padding:13,borderRadius:14,background:T.primary,color:"#fff",fontWeight:700,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {saving?<><span style={{width:14,height:14,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 1s linear infinite"}}/>حفظ...</>:<><Ic n="check" s={15} col="white"/> حفظ التقرير</>}
            </button>
          </div>
        </div>}
      </div>
    </Shell>
  );
}

// ── Preview ────────────────────────────────────────────────────
function Preview({ ctx }: any) {
  const { cur:r, setPage, updateReport, dark } = ctx;
  if (!r) return null;
  const isFemale = r.teacher_gender === "female";

  const handleShare = async () => {
    const text = `تقرير تعليمي: ${r.title}\nالمادة: ${r.subject} | الصف: ${r.grade}`;
    if (navigator.share) { try { await navigator.share({title:r.title,text}); return; } catch{} }
    try { await navigator.clipboard.writeText(text); toast.success("تم نسخ التقرير"); } catch { toast.error("تعذّر النسخ"); }
  };
  const handlePDF = () => { toast.info("سيفتح مربع الطباعة — اختر حفظ كـ PDF"); setTimeout(()=>window.print(),500); };

  const SECS = [
    {l:"وصف النشاط",f:"description",col:"#0d9488"},{l:"الأهداف التعليمية",f:"objectives",col:"#0d9488"},
    {l:"خطوات التنفيذ",f:"steps",col:"#2563eb"},{l:"النتائج",f:"outcomes",col:"#059669"},
    {l:"الأدوات",f:"tools",col:"#d97706"},{l:"التقييم",f:"evaluation",col:"#7c3aed"},
  ].filter(s=>(r as any)[s.f]);

  // photos come as base64 strings (from frontend state) or storage paths (from DB)
  const photosSrc: string[] = r.photos || [];

  return (
    <div style={{minHeight:"100vh",background:dark?"#0f172a":"#f1f5f9"}}>
      {/* Action bar */}
      <div className="no-print" style={{position:"sticky",top:0,zIndex:50,background:T.primary,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}>
        <button onClick={()=>setPage("reports")} className="bt" style={{display:"flex",alignItems:"center",gap:6,color:"#fff",background:"rgba(255,255,255,.18)",padding:"8px 13px",borderRadius:10,border:"none",fontWeight:600,fontSize:13}}>
          <Ic n="back" s={14} col="white"/> رجوع
        </button>
        <div style={{display:"flex",gap:7}}>
          <button onClick={handleShare} className="bt" style={{display:"flex",alignItems:"center",gap:4,padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,.18)",color:"#fff",border:"1px solid rgba(255,255,255,.3)",fontWeight:700,fontSize:12}}>
            <Ic n="share" s={13} col="white"/> مشاركة
          </button>
          <button onClick={()=>window.print()} className="bt" style={{display:"flex",alignItems:"center",gap:4,padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,.18)",color:"#fff",border:"1px solid rgba(255,255,255,.3)",fontWeight:700,fontSize:12}}>
            <Ic n="print" s={13} col="white"/> طباعة
          </button>
          <button onClick={handlePDF} className="bt" style={{display:"flex",alignItems:"center",gap:4,padding:"8px 12px",borderRadius:10,background:"#fff",color:T.primary,border:"none",fontWeight:800,fontSize:12}}>
            <Ic n="pdf" s={13} col={T.primary}/> PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div style={{padding:14,maxWidth:700,margin:"0 auto"}}>
        <div className="print-doc" style={{background:"#fff",borderRadius:18,boxShadow:"0 4px 24px rgba(0,0,0,.1)",overflow:"hidden"}}>
          {/* Header */}
          <div style={{background:T.primary,padding:"18px 22px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}} dir="rtl">
              <div style={{textAlign:"right"}}>
                <p style={{color:"rgba(255,255,255,.95)",fontSize:14,fontWeight:700}}>المملكة العربية السعودية</p>
                <p style={{color:"rgba(255,255,255,.8)",fontSize:12}}>وزارة التعليم</p>
                <p style={{color:"rgba(255,255,255,.75)",fontSize:12}}>{r.schoolNameOverride||r.school||teacher?.school||""}</p>
              </div>
              <div style={{flex:1,display:"flex",justifyContent:"center"}}>
                <div style={{background:"#fff",borderRadius:10,padding:"5px 8px"}}>
                  <div style={{width:80,height:50,display:"flex",alignItems:"center",justifyContent:"center",color:T.primary,fontWeight:900,fontSize:11,textAlign:"center"}}>وزارة<br/>التعليم<br/>رؤية 2030</div>
                </div>
              </div>
              <div style={{minWidth:80}}/>
            </div>
            <div style={{borderTop:"1px solid rgba(255,255,255,.2)",paddingTop:14,textAlign:"center"}}>
              <h1 style={{color:"#fff",fontSize:20,fontWeight:900,lineHeight:1.3}}>
                {r.activity_type?`${r.activity_type}: ${r.title}`:r.title}
              </h1>
              <p style={{color:"rgba(255,255,255,.75)",fontSize:13,marginTop:5}}>تقرير توثيق نشاط تعليمي</p>
              {r.criteria_label&&<span style={{display:"inline-block",marginTop:7,padding:"3px 13px",borderRadius:99,background:"rgba(255,255,255,.2)",color:"#ccfbf1",fontSize:12,fontWeight:700}}>📋 {r.criteria_label}</span>}
            </div>
          </div>

          <div dir="rtl" style={{padding:"16px 20px"}}>
            {/* Meta */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:14,borderRadius:12,background:"#f0fdfa",border:"1px solid #ccfbf1",marginBottom:18}}>
              {[["التاريخ",r.date],["الصف",r.grade],["المادة",r.subject],["نوع النشاط",r.activity_type],["المعلم/ة",r.teacherNameOverride||r.teacher?.name]].map(([k,v])=>(
                <div key={k as string}><span style={{display:"block",fontSize:10,color:T.sub,fontWeight:700,marginBottom:1}}>{k}</span><span style={{fontWeight:800,color:T.text,fontSize:13}}>{v||"—"}</span></div>
              ))}
            </div>

            {/* Content */}
            {SECS.map(s=>(
              <section key={s.f} style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8,paddingBottom:6,borderBottom:`2px solid ${s.col}33`}}>
                  <div style={{width:4,height:18,borderRadius:2,background:s.col}}/>
                  <h2 style={{fontSize:15,fontWeight:900,color:s.col}}>{s.l}</h2>
                </div>
                <div style={{fontSize:13,lineHeight:1.9,color:"#334155",whiteSpace:"pre-line",paddingRight:10,borderRight:`2px solid ${s.col}22`}}>{(r as any)[s.f]}</div>
              </section>
            ))}

            {/* Photos */}
            {photosSrc.length>0&&(
              <section style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10,paddingBottom:6,borderBottom:`2px solid ${T.primary}33`}}>
                  <div style={{width:4,height:18,borderRadius:2,background:T.primary}}/>
                  <h2 style={{fontSize:15,fontWeight:900,color:T.primary}}>الشواهد المصورة</h2>
                </div>
                <div style={{display:"grid",gridTemplateColumns:photosSrc.length===1?"1fr":photosSrc.length===2?"1fr 1fr":"1fr 1fr",gap:8}}>
                  {photosSrc.map((p,i)=>(
                    <div key={i} style={{borderRadius:10,overflow:"hidden",border:`1px solid ${T.border}`,background:"#f8fafc"}}>
                      <img src={p} alt={`شاهد ${i+1}`} style={{width:"100%",height:photosSrc.length===1?240:160,objectFit:"contain",display:"block"}}/>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Signatures */}
            <div style={{marginTop:22,paddingTop:14,borderTop:`1px solid ${T.border}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
              {[isFemale?"توقيع المعلمة":"توقيع المعلم", isFemale?"توقيع المديرة":"توقيع المدير"].map(label=>(
                <div key={label} style={{textAlign:"center"}}>
                  <p style={{fontSize:13,fontWeight:700,color:T.sub,marginBottom:36}}>{label}</p>
                  <div style={{borderBottom:`1px solid ${T.border}`,marginBottom:4}}/>
                  <p style={{fontSize:10,color:T.sub}}>الاسم والتوقيع والتاريخ</p>
                </div>
              ))}
            </div>

            {/* Watermark */}
            <div style={{marginTop:14,paddingTop:10,borderTop:`1px solid ${T.border}22`,textAlign:"center"}}>
              <p style={{fontSize:9,color:T.primary,opacity:0.35,letterSpacing:"0.05em",fontWeight:600}}>
                تقرير رسمي صادر من منصة شواهد تعليمية • {new Date(r.created_at||Date.now()).toLocaleDateString("ar-SA",{year:"numeric",month:"long",day:"numeric"})}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Settings ───────────────────────────────────────────────────
function Settings({ ctx }: any) {
  const { teacher, setTeacher, dark, setDark, logout } = ctx;
  const [form, setForm] = useState<any>(teacher||{});
  const [saving, setSaving] = useState(false);
  const cardBg=dark?"#1e293b":"#fff"; const inp=dark?"#0f172a":"#f8fafc"; const bdr=dark?"#334155":T.border;

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/teacher",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    if (res.ok) { setTeacher(await res.json()); toast.success("تم الحفظ ✓"); }
    else { toast.error("فشل الحفظ"); }
    setSaving(false);
  };

  return (
    <Shell ctx={ctx} title="حسابي">
      <div style={{padding:16}} className="fi">
        <div style={{padding:18,borderRadius:20,background:cardBg,border:`1px solid ${bdr}`,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
            <div style={{width:56,height:56,borderRadius:16,background:T.primary,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,flexShrink:0}}>
              {teacher?.name?.charAt(0)||"م"}
            </div>
            <div>
              <p style={{fontWeight:800,fontSize:15}}>{teacher?.name}</p>
              <p style={{fontSize:12,color:T.sub}}>{teacher?.email}</p>
              {teacher?.phone&&<p style={{fontSize:11,color:T.primary,fontWeight:600}}>📱 +966{teacher.phone}</p>}
            </div>
          </div>
          {[{l:"الاسم",f:"name"},{l:"المدرسة",f:"school"},{l:"المادة",f:"subject"}].map(({l,f})=>(
            <div key={f} style={{marginBottom:10}}>
              <label style={{display:"block",fontSize:11,fontWeight:600,color:T.sub,marginBottom:4}}>{l}</label>
              <input type="text" value={form[f]||""} onChange={e=>setForm((p:any)=>({...p,[f]:e.target.value}))}
                style={{width:"100%",padding:"10px 13px",borderRadius:12,border:`1px solid ${bdr}`,background:inp,fontSize:13,outline:"none"}}/>
            </div>
          ))}
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:T.sub,marginBottom:6}}>الجنس</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["male","ذكر 👨‍🏫"],["female","أنثى 👩‍🏫"]].map(([v,l])=>(
                <button key={v} onClick={()=>setForm((p:any)=>({...p,gender:v}))} className="bt"
                  style={{padding:10,borderRadius:12,border:`2px solid ${form.gender===v?T.primary:bdr}`,background:form.gender===v?T.primaryLt:"transparent",fontWeight:700,color:form.gender===v?T.primary:T.sub,fontSize:13}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button onClick={save} disabled={saving} className="bt" style={{width:"100%",padding:12,borderRadius:12,background:T.primary,color:"#fff",fontWeight:700,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {saving?<><span style={{width:12,height:12,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 1s linear infinite"}}/>حفظ...</>:"حفظ التغييرات"}
          </button>
        </div>
        <div style={{padding:"14px 16px",borderRadius:16,background:cardBg,border:`1px solid ${bdr}`,display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Ic n={dark?"moon":"sun"} s={20} col={dark?"#60a5fa":"#f59e0b"}/>
            <p style={{fontWeight:700,fontSize:14}}>الوضع الليلي</p>
          </div>
          <button onClick={()=>setDark((d:boolean)=>!d)} style={{width:48,height:25,borderRadius:99,border:"none",cursor:"pointer",position:"relative",background:dark?T.primary:"#cbd5e1"}}>
            <span style={{position:"absolute",top:2.5,width:20,height:20,background:"#fff",borderRadius:"50%",transition:"all .2s",right:dark?"3px":"auto",left:dark?"auto":"3px"}}/>
          </button>
        </div>
        <div style={{padding:"12px 14px",borderRadius:14,background:"#f0fdfa",border:`1px solid ${T.primary}44`,marginBottom:14}}>
          <p style={{fontSize:11,color:T.primaryDk,fontWeight:700,marginBottom:3}}>🔒 الخصوصية والأمان</p>
          <p style={{fontSize:11,color:T.primaryDk,lineHeight:1.6}}>بياناتك محفوظة في Supabase مع RLS كامل. الصور في bucket خاص. جميع الاتصالات مشفرة عبر HTTPS.</p>
        </div>
        <button onClick={logout} className="bt" style={{width:"100%",padding:13,borderRadius:16,color:"#ef4444",fontWeight:700,fontSize:14,background:dark?"rgba(239,68,68,.08)":"#fff5f5",border:"2px solid #fca5a5"}}>
          تسجيل الخروج
        </button>
      </div>
    </Shell>
  );
}
