import { useNavigate } from "react-router-dom";
import { Users, TrendingUp, GraduationCap, FileText, Award, DollarSign, Clock, ArrowRight, AlertCircle, Plus, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import "../style.css";

const stats = [
  { label:"Total Inquiries",      value:"1234",   change:"+12%", pos:true,  icon:Users,         color:"var(--blue-bg)",   ic:"var(--blue)"   },
  { label:"Conversion Rate",      value:"34.5%",  change:"+5.2%",pos:true,  icon:TrendingUp,    color:"var(--green-bg)",  ic:"var(--green)"  },
  { label:"Active Leads",         value:"456",    change:"+8%",  pos:true,  icon:Users,         color:"var(--purple-bg)", ic:"var(--purple)" },
  { label:"Enrolled Students",    value:"234",    change:"+15%", pos:true,  icon:GraduationCap, color:"var(--green-bg)",  ic:"var(--green)"  },
  { label:"Pending Applications", value:"89",     change:"-5%",  pos:false, icon:FileText,      color:"var(--red-bg)",    ic:"var(--red)"    },
  { label:"Offers Sent",          value:"156",    change:"+22%", pos:true,  icon:Award,         color:"var(--yellow-bg)", ic:"var(--yellow)" },
  { label:"Fees Collected",       value:"₹45.2L", change:"+18%", pos:true,  icon:DollarSign,    color:"var(--green-bg)",  ic:"var(--green)"  },
];

const monthlyData = [
  {month:"Aug",inquiries:120,enrolled:45},{month:"Sep",inquiries:145,enrolled:52},
  {month:"Oct",inquiries:168,enrolled:61},{month:"Nov",inquiries:192,enrolled:68},
  {month:"Dec",inquiries:215,enrolled:75},{month:"Jan",inquiries:234,enrolled:82},
  {month:"Feb",inquiries:256,enrolled:89},
];

const funnelData = [
  {stage:"Inquiry",  count:1234,pct:"100%"},{stage:"Contacted",count:980, pct:"79%"},
  {stage:"Interested",count:756,pct:"61%"},{stage:"Visit",    count:535, pct:"43%"},
  {stage:"Applied",  count:423, pct:"34%"},{stage:"Enrolled", count:234, pct:"19%"},
];

const gradeData = [
  {label:"Grade 1",value:45,color:"#22c55e"},{label:"Grade 2",value:38,color:"#3b82f6"},
  {label:"Grade 3",value:42,color:"#8b5cf6"},{label:"Grade 4",value:35,color:"#ec4899"},
  {label:"Grade 5",value:40,color:"#f59e0b"},{label:"Grade 6",value:34,color:"#14b8a6"},
];

const followUps = [
  { name:"Aarav Sharma", sub:"Rajesh Sharma",  time:"10:00 AM", action:"Call",         actionCls:"action-call",      av:"AS", avBg:"#dbeafe", avC:"#1d4ed8" },
  { name:"Diya Patel",   sub:"Amit Patel",      time:"11:00 AM", action:"Campus Visit", actionCls:"action-visit",     av:"DP", avBg:"#f3e8ff", avC:"#7e22ce" },
  { name:"Arjun Kumar",  sub:"Amit Kumar",      time:"2:00 PM",  action:"Email",        actionCls:"action-email",     av:"AK", avBg:"#dcfce7", avC:"#15803d" },
  { name:"Ananya Singh", sub:"Vikram Singh",    time:"3:30 PM",  action:"Interview",    actionCls:"action-interview", av:"AS", avBg:"#fef9c3", avC:"#a16207" },
];

const alerts = [
  {name:"Rohan Verma", grade:"Grade 5",reason:"No response",         days:"15 days ago"},
  {name:"Meera Reddy", grade:"Grade 3",reason:"Awaiting documents",  days:"12 days ago"},
  {name:"Kabir Joshi", grade:"Grade 8",reason:"Payment pending",     days:"18 days ago"},
];

const counselors = [
  {name:"Priya Sharma",leads:45,conv:18,pct:40,clr:"#14b8a6"},
  {name:"Amit Patel",  leads:38,conv:12,pct:32,clr:"#3b82f6"},
  {name:"Neha Kumar",  leads:42,conv:15,pct:36,clr:"#8b5cf6"},
  {name:"Rahul Singh", leads:35,conv:9, pct:26,clr:"#f59e0b"},
];

const Tip = ({active,payload,label}) => active&&payload?.length ? (
  <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,padding:"10px 14px",boxShadow:"0 4px 12px rgba(0,0,0,.1)",fontSize:13}}>
    <p style={{fontWeight:700,color:"#111",marginBottom:4}}>{label}</p>
    {payload.map((p,i)=><p key={i} style={{color:p.color,fontWeight:500}}>{p.name} : {p.value}</p>)}
  </div>
) : null;

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:24,flexWrap:"wrap"}}>
        <div>
          <h1 className="page-title" style={{textAlign:"left"}}>Admissions Dashboard</h1>
          <p className="page-sub" style={{textAlign:"left"}}>Welcome back! Here's your admission overview</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <button className="btn btn-primary" onClick={()=>navigate("/leads/add")}><Plus size={15}/> Add Lead</button>
          <button className="btn btn-outline" onClick={()=>navigate("/applications/create")}><FileText size={15}/> Create Application</button>
          <button className="btn btn-outline" onClick={()=>navigate("/counseling/schedule-visit")}><Calendar size={15}/> Schedule Visit</button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="dashboard-stats-7" style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:12,marginBottom:24}}>
        {stats.map((s,i)=>{
          const Icon = s.icon;
          return (
            <div className="stat-card" key={i} style={{padding:"14px 14px"}}>
              <div className="stat-row">
                <span className="stat-label" style={{fontSize:11}}>{s.label}</span>
                <span className={`stat-badge ${s.pos?"positive":"negative"}`}>{s.change}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6}}>
                <span className="stat-value" style={{fontSize:22}}>{s.value}</span>
                <div className="stat-icon" style={{background:s.color,width:34,height:34}}><Icon size={16} style={{color:s.ic}}/></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel + Follow-ups */}
      <div className="grid-2 mb-5">
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Admission Funnel</div><div className="card-sub">Lead conversion through each stage</div></div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={funnelData} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false}/>
                <XAxis type="number" tick={{fill:"#9ca3af",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="stage" tick={{fill:"#6b7280",fontSize:12}} axisLine={false} tickLine={false} width={70}/>
                <Tooltip content={<Tip/>}/>
                <Bar dataKey="count" name="count" radius={[0,6,6,0]}>
                  {funnelData.map((e,i)=><Cell key={i} fill={i===2?"#d1d5db":"#14b8a6"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:10,flexWrap:"wrap",gap:8}}>
              {funnelData.map((s,i)=>(
                <div key={i} style={{textAlign:"center",fontSize:11}}>
                  <div style={{color:"var(--gray-500)"}}>{s.stage}</div>
                  <div style={{fontWeight:700,fontSize:13,color:"var(--gray-800)"}}>{s.pct}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Upcoming Follow-ups</div><div className="card-sub">Today's scheduled activities</div></div>
          </div>
          <div className="card-body">
            {followUps.map((f,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:i<followUps.length-1?"1px solid var(--gray-100)":""}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:f.avBg,color:f.avC,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,flexShrink:0}}>{f.av}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--gray-900)"}}>{f.name}</div>
                  <div style={{fontSize:12,color:"var(--gray-500)"}}>{f.sub}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"var(--gray-400)",flexShrink:0}}>
                  <Clock size={12}/>{f.time}
                  <span className={`action-tag ${f.actionCls}`}>{f.action}</span>
                </div>
              </div>
            ))}
            <div style={{display:"flex",alignItems:"center",gap:4,fontSize:13,fontWeight:600,color:"var(--primary)",marginTop:10,cursor:"pointer"}} onClick={()=>navigate("/communication")}>
              View All <ArrowRight size={14}/>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend + Grade Distribution */}
      <div className="grid-2 mb-5">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Monthly Trend</div><div className="card-sub">Inquiries vs enrollments over time</div></div></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                <XAxis dataKey="month" tick={{fill:"#9ca3af",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#9ca3af",fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<Tip/>}/>
                <Line type="monotone" dataKey="inquiries" stroke="#3b82f6" strokeWidth={2.5} dot={{r:4,fill:"#3b82f6"}} name="inquiries"/>
                <Line type="monotone" dataKey="enrolled"  stroke="#14b8a6" strokeWidth={2.5} dot={{r:4,fill:"#14b8a6"}} name="enrolled"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div><div className="card-title">Grade Distribution</div><div className="card-sub">Current applications by grade</div></div></div>
          <div className="card-body" style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={gradeData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {gradeData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip content={<Tip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:12,width:"100%"}}>
              {gradeData.map((g,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:13}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:g.color,flexShrink:0}}/>
                  <span style={{color:"var(--gray-600)"}}>{g.label}</span>
                  <span style={{fontWeight:700,marginLeft:"auto"}}>{g.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inactivity + Counselor */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Inactivity Alerts</div><div className="card-sub">Leads requiring immediate attention</div></div></div>
          <div className="card-body">
            {alerts.map((a,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:14,background:"#fff5f5",border:"1px solid #fecaca",borderRadius:"var(--r)",marginBottom:i<alerts.length-1?10:0}}>
                <div style={{width:32,height:32,background:"#fee2e2",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#dc2626"}}><AlertCircle size={15}/></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--gray-900)"}}>{a.name}</div>
                  <div style={{fontSize:12,color:"var(--gray-500)"}}>{a.grade}</div>
                  <div style={{fontSize:12,color:"var(--gray-400)"}}>{a.reason}</div>
                </div>
                <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:"var(--r-full)",background:"#fee2e2",color:"#dc2626",whiteSpace:"nowrap"}}>{a.days}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div><div className="card-title">Counselor Performance</div><div className="card-sub">Team conversion summary</div></div></div>
          <div className="card-body">
            {counselors.map((c,i)=>(
              <div key={i} style={{marginBottom:i<counselors.length-1?16:0}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:600,color:"var(--gray-900)"}}>{c.name}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"var(--gray-700)"}}>{c.pct}%</span>
                </div>
                <div style={{fontSize:12,color:"var(--gray-400)",marginBottom:6}}>{c.leads} leads &nbsp;•&nbsp; {c.conv} conversions</div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${c.pct}%`,background:c.clr}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline styles needed for follow-up action tags ───────────
const styleEl = document.createElement("style");
styleEl.textContent = `
  .stat-badge{display:inline-flex;align-items:center;padding:2px 7px;border-radius:9999px;font-size:11px;font-weight:600;}
  .stat-badge.positive{background:#dcfce7;color:#16a34a;}
  .stat-badge.negative{background:#fee2e2;color:#dc2626;}
  .action-tag{font-size:11px;font-weight:600;padding:2px 8px;border-radius:9999px;margin-left:6px;}
  .action-call{background:#dcfce7;color:#15803d;}
  .action-email{background:#dbeafe;color:#1d4ed8;}
  .action-visit{background:#f3e8ff;color:#7e22ce;}
  .action-interview{background:#fef9c3;color:#a16207;}
`;
if (!document.head.querySelector("[data-dashboard-styles]")) {
  styleEl.setAttribute("data-dashboard-styles","");
  document.head.appendChild(styleEl);
}