import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Search } from "lucide-react";
import "../style.css";

const leads = [
  { id:"1", name:"Aarav Sharma", grade:"Grade 5", contact:"+91 98765 43210", email:"sharma.father@email.com", score:85, status:"interested"   },
  { id:"2", name:"Diya Patel",   grade:"Grade 3", contact:"+91 98765 43211", email:"patel.mother@email.com",  score:72, status:"contacted"    },
  { id:"3", name:"Arjun Kumar",  grade:"Grade 8", contact:"+91 98765 43212", email:"kumar.father@email.com",  score:91, status:"campus_visit" },
];
const statusColor = s => ({ interested:"badge-blue", contacted:"badge-purple", campus_visit:"badge-teal" }[s]||"badge-gray");
const statusLabel = s => s.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
const scoreColor  = s => s>=80?"var(--green)":s>=60?"var(--orange)":"var(--red)";

export function CreateApplication() {
  const navigate = useNavigate();
  const [step, setStep]   = useState("select");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ year:"2026-27", type:"", prevSchool:"", reason:"" });

  const filtered = leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase()) || l.contact.includes(search));

  if (step === "select") return (
    <div className="page-sm" style={{maxWidth:1000}}>
      <button className="back-btn" onClick={()=>navigate("/applications")}><ArrowLeft size={16}/> Back to Applications</button>
      <h1 className="page-title mb-1">Create New Application</h1>
      <p className="page-sub mb-5">Select an existing lead or create a new application</p>

      <div className="card mb-5">
        <div className="card-body" style={{paddingTop:14}}>
          <div className="flex gap-3">
            <div className="input-wrap flex-1"><Search className="input-icon" size={15}/><input className="form-input" placeholder="Search by name, email, or phone..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <button className="btn btn-primary" onClick={()=>{setSelected(null);setStep("create");}}><FileText size={15}/> Create Without Lead</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Select from Existing Leads</div></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Student Name</th><th>Grade</th><th>Parent Contact</th><th>Email</th><th>Lead Score</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(l=>(
                <tr key={l.id}>
                  <td className="td-bold">{l.name}</td><td>{l.grade}</td><td>{l.contact}</td>
                  <td style={{fontSize:13}}>{l.email}</td>
                  <td>
                    <div className="lead-score-bar">
                      <div className="bar"><div className="fill" style={{width:`${l.score}%`,background:scoreColor(l.score)}}/></div>
                      <span style={{fontWeight:700,color:scoreColor(l.score)}}>{l.score}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${statusColor(l.status)}`}>{statusLabel(l.status)}</span></td>
                  <td><button className="btn btn-primary btn-sm" onClick={()=>{setSelected(l);setStep("create");}}>Select</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-sm" style={{maxWidth:700}}>
      <button className="back-btn" onClick={()=>{setStep("select");setSelected(null);}}><ArrowLeft size={16}/> Back</button>
      <h1 className="page-title mb-1">Application Setup</h1>
      <p className="page-sub mb-5">Configure basic application details before proceeding to the full form</p>

      <form onSubmit={e=>{e.preventDefault();navigate("/applications/new");}} className="space-y-4">
        {selected && (
          <div className="card" style={{border:"2px solid var(--primary)"}}>
            <div className="card-header"><div className="card-title">Selected Lead</div></div>
            <div className="card-body">
              <div className="grid-2 gap-3">
                <div><div style={{fontSize:13,color:"var(--gray-500)"}}>Student Name</div><div style={{fontWeight:600}}>{selected.name}</div></div>
                <div><div style={{fontSize:13,color:"var(--gray-500)"}}>Grade</div><div style={{fontWeight:600}}>{selected.grade}</div></div>
                <div><div style={{fontSize:13,color:"var(--gray-500)"}}>Parent Contact</div><div style={{fontWeight:600}}>{selected.contact}</div></div>
                <div><div style={{fontSize:13,color:"var(--gray-500)"}}>Email</div><div style={{fontWeight:600}}>{selected.email}</div></div>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header"><div className="card-title">Application Information</div></div>
          <div className="card-body">
            <div className="grid-2 gap-3 mb-3">
              <div className="form-group">
                <label className="form-label">Academic Year <span className="req">*</span></label>
                <select className="form-select" value={form.year} onChange={e=>setForm(p=>({...p,year:e.target.value}))}>
                  <option>2026-27</option><option>2027-28</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Admission Type <span className="req">*</span></label>
                <select className="form-select" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} required>
                  <option value="">Select admission type</option>
                  <option value="new">New Admission</option><option value="transfer">Transfer</option>
                  <option value="sibling">Sibling Admission</option><option value="re">Re-admission</option>
                </select>
              </div>
            </div>
            {form.type==="transfer" && (
              <>
                <div className="form-group mb-3"><label className="form-label">Previous School Name</label><input className="form-input" placeholder="Enter previous school name" value={form.prevSchool} onChange={e=>setForm(p=>({...p,prevSchool:e.target.value}))}/></div>
                <div className="form-group"><label className="form-label">Reason for Change</label><input className="form-input" placeholder="Brief reason for changing school" value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))}/></div>
              </>
            )}
          </div>
        </div>

        <div className="info-box info-box-blue">
          <FileText size={18} style={{color:"var(--blue)",flexShrink:0,marginTop:2}}/>
          <div><div className="info-box-title">Next Steps</div><div className="info-box-text">After creating this application, you'll be redirected to the complete multi-step application form where you can fill in detailed student information, academic records, upload documents, and complete the application process.</div></div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-outline" onClick={()=>navigate("/applications")}>Cancel</button>
          <button type="submit" className="btn btn-primary"><FileText size={14}/> Continue to Full Application</button>
        </div>
      </form>
    </div>
  );
}