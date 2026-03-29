// ── Applications.jsx ────────────────────────────────────────
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Download } from "lucide-react";
import "../style.css";

const appsData = [
  { id:"APP001", name:"Aarav Sharma",  grade:"Grade 5", contact:"+91 98765 43210", submitted:"Feb 28, 2026", status:"under_review" },
  { id:"APP002", name:"Diya Patel",    grade:"Grade 3", contact:"+91 98765 43211", submitted:"Feb 27, 2026", status:"approved"     },
  { id:"APP003", name:"Arjun Kumar",   grade:"Grade 8", contact:"+91 98765 43212", submitted:"Feb 26, 2026", status:"waitlisted"   },
];
const statusMap = {
  submitted:    { label:"Submitted",    cls:"badge-blue"   },
  under_review: { label:"Under Review", cls:"badge-yellow" },
  approved:     { label:"Approved",     cls:"badge-green"  },
  rejected:     { label:"Rejected",     cls:"badge-red"    },
  waitlisted:   { label:"Waitlisted",   cls:"badge-purple" },
};

export function Applications() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showDrop, setShowDrop] = useState(false);

  const filtered = appsData.filter(a => {
    const q = search.toLowerCase();
    return (a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)) && (filter==="all"||a.status===filter);
  });

  const stats = { total:appsData.length, submitted:appsData.filter(a=>a.status==="submitted").length, underReview:appsData.filter(a=>a.status==="under_review").length, approved:appsData.filter(a=>a.status==="approved").length, waitlisted:appsData.filter(a=>a.status==="waitlisted").length };

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Applications</h1><p className="page-sub">Track and manage admission applications</p></div>
        <button className="btn btn-primary" onClick={()=>navigate("/applications/create")}><Plus size={15}/> New Application</button>
      </div>

      <div className="grid-5 mb-5">
        {[["Total",stats.total,"var(--gray-900)"],["Submitted",stats.submitted,"var(--blue)"],["Under Review",stats.underReview,"var(--yellow)"],["Approved",stats.approved,"var(--green)"],["Waitlisted",stats.waitlisted,"var(--purple)"]].map(([l,v,c],i)=>(
          <div className="stat-card" key={i}><div className="stat-label">{l}</div><div className="stat-value" style={{color:c}}>{v}</div></div>
        ))}
      </div>

      <div className="card mb-5">
        <div className="card-body" style={{paddingTop:14}}>
          <div style={{fontWeight:600,fontSize:15,color:"var(--gray-800)",marginBottom:12}}>Filters</div>
          <div className="flex gap-3 flex-wrap">
            <div className="input-wrap flex-1" style={{minWidth:200}}>
              <Search className="input-icon" size={15}/>
              <input className="form-input" placeholder="Search by student name or ID..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div style={{position:"relative"}}>
              <button className="btn btn-outline" onClick={()=>setShowDrop(!showDrop)}>▽ &nbsp;{filter==="all"?"All Statuses":statusMap[filter]?.label} &nbsp;✓</button>
              {showDrop && (
                <div style={{position:"absolute",top:"110%",left:0,background:"#fff",border:"1px solid var(--gray-200)",borderRadius:"var(--r)",boxShadow:"var(--shadow-lg)",zIndex:50,minWidth:180}}>
                  {[["all","All Statuses"],["submitted","Submitted"],["under_review","Under Review"],["approved","Approved"],["rejected","Rejected"],["waitlisted","Waitlisted"]].map(([v,l])=>(
                    <div key={v} style={{padding:"10px 16px",cursor:"pointer",background:filter===v?"var(--gray-50)":"",fontWeight:filter===v?600:400,display:"flex",justifyContent:"space-between"}} onClick={()=>{setFilter(v);setShowDrop(false);}}>
                      {l}{filter===v&&<span style={{color:"var(--purple)"}}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn-outline"><Download size={14}/> Export</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Application ID</th><th>Student Name</th><th>Grade</th><th>Parent Contact</th><th>Submitted Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(a=>(
                <tr key={a.id}>
                  <td className="td-bold">{a.id}</td><td>{a.name}</td><td>{a.grade}</td><td>{a.contact}</td><td style={{fontSize:13}}>{a.submitted}</td>
                  <td><span className={`badge ${statusMap[a.status]?.cls}`}>{statusMap[a.status]?.label}</span></td>
                  <td><button className="btn btn-ghost btn-icon"><Eye size={15}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}