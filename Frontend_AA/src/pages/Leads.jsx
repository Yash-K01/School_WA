import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, MoreVertical, Phone, Mail } from "lucide-react";
import "../style.css";

const leadsData = [
  { id: 1, name: "Aarav Sharma",  grade: "Grade 5", contact: "+91 98765 43210", email: "sharma.father@email.com", source: "Website Form", score: 85, status: "interested",         counselor: "Priya Sharma",  lastActivity: "2 hours ago", tags: ["Hot Lead", "Follow-up Today"] },
  { id: 2, name: "Diya Patel",    grade: "Grade 3", contact: "+91 98765 43211", email: "patel.mother@email.com",  source: "Google Ads",   score: 72, status: "contacted",          counselor: "Amit Patel",    lastActivity: "1 day ago",   tags: ["Campus Visit Scheduled"] },
  { id: 3, name: "Arjun Kumar",   grade: "Grade 8", contact: "+91 98765 43212", email: "kumar.father@email.com",  source: "Referral",     score: 91, status: "campus_visit",       counselor: "Neha Kumar",    lastActivity: "3 hours ago", tags: ["Hot Lead", "High Priority"] },
  { id: 4, name: "Ananya Singh",  grade: "Grade 1", contact: "+91 98765 43213", email: "singh.mother@email.com",  source: "Facebook",     score: 58, status: "new",                counselor: "Rahul Singh",   lastActivity: "5 days ago",  tags: ["New Lead"] },
  { id: 5, name: "Vihaan Reddy",  grade: "Grade 6", contact: "+91 98765 43214", email: "reddy.father@email.com",  source: "Walk-in",      score: 78, status: "application_started",counselor: "Priya Sharma",  lastActivity: "Yesterday",   tags: ["Application in Progress"] },
];

const statusConfig = {
  new:                 { label: "New",                 cls: "badge-gray"   },
  contacted:           { label: "Contacted",           cls: "badge-purple" },
  interested:          { label: "Interested",          cls: "badge-blue"   },
  campus_visit:        { label: "Campus Visit",        cls: "badge-teal"   },
  application_started: { label: "Application Started", cls: "badge-orange" },
  not_interested:      { label: "Not Interested",      cls: "badge-red"    },
};

export function Leads() {
  const navigate = useNavigate();
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("all");
  const [grade, setGrade]     = useState("all");
  const [source, setSource]   = useState("all");
  const [showStatusDrop, setShowStatusDrop] = useState(false);

  const filtered = leadsData.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.contact.includes(q);
    const matchStatus = status === "all" || l.status === status;
    const matchGrade  = grade  === "all" || l.grade === grade;
    const matchSource = source === "all" || l.source === source;
    return matchSearch && matchStatus && matchGrade && matchSource;
  });

  const stats = {
    total:     leadsData.length,
    newLeads:  leadsData.filter(l => l.status === "new").length,
    contacted: leadsData.filter(l => l.status === "contacted").length,
    interested:leadsData.filter(l => l.status === "interested").length,
  };

  const scoreColor = s => s >= 80 ? "#22c55e" : s >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Lead Management</h1>
          <p className="page-sub">Manage and track all admission inquiries</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/leads/add")}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-5">
        {[
          { label: "Total Leads",  value: stats.total,     color: "var(--gray-900)" },
          { label: "New Leads",    value: stats.newLeads,  color: "var(--primary)"  },
          { label: "Contacted",    value: stats.contacted, color: "var(--blue)"     },
          { label: "Interested",   value: stats.interested,color: "var(--green)"    },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-5">
        <div className="card-body" style={{ paddingTop: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--gray-800)", marginBottom: 12 }}>Filters</div>
          <div className="flex gap-3 flex-wrap">
            <div className="input-wrap flex-1" style={{ minWidth: 200 }}>
              <Search className="input-icon" size={15} />
              <input className="form-input" placeholder="Search by name, email, or phone..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {/* Status dropdown */}
            <div style={{ position: "relative" }}>
              <button className="btn btn-outline" onClick={() => setShowStatusDrop(!showStatusDrop)}>
                ▽ &nbsp;{status === "all" ? "All Statuses" : statusConfig[status]?.label} &nbsp;✓
              </button>
              {showStatusDrop && (
                <div style={{ position: "absolute", top: "110%", left: 0, background: "#fff", border: "1px solid var(--gray-200)", borderRadius: "var(--r)", boxShadow: "var(--shadow-lg)", zIndex: 50, minWidth: 180 }}>
                  {[["all","All Statuses"],["new","New"],["contacted","Contacted"],["interested","Interested"],["campus_visit","Campus Visit"],["application_started","Application Started"],["not_interested","Not Interested"]].map(([v,l]) => (
                    <div key={v} style={{ padding: "10px 16px", cursor: "pointer", background: status===v ? "var(--gray-50)":"", fontWeight: status===v?600:400, display:"flex",justifyContent:"space-between" }} onClick={() => { setStatus(v); setShowStatusDrop(false); }}>
                      {l} {status===v && <span style={{color:"var(--primary)"}}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <select className="form-select" style={{ width: 140 }} value={grade} onChange={e => setGrade(e.target.value)}>
              <option value="all">All Grades</option>
              {["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8"].map(g => <option key={g}>{g}</option>)}
            </select>
            <select className="form-select" style={{ width: 140 }} value={source} onChange={e => setSource(e.target.value)}>
              <option value="all">All Sources</option>
              {["Website Form","Google Ads","Referral","Facebook","Walk-in"].map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-outline">↑ Export</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>Name</th><th>Grade</th><th>Contact</th><th>Source</th>
                <th>Lead Score</th><th>Status</th><th>Counselor</th>
                <th>Last Activity</th><th>Tags</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td><input type="checkbox" /></td>
                  <td className="td-bold">{l.name}</td>
                  <td>{l.grade}</td>
                  <td style={{ fontSize: 13 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:4 }}><Phone size={12} style={{color:"var(--gray-400)"}} />{l.contact}</div>
                    <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:2 }}><Mail size={12} style={{color:"var(--gray-400)"}} />{l.email}</div>
                  </td>
                  <td>{l.source}</td>
                  <td>
                    <div className="lead-score-bar">
                      <div className="bar"><div className="fill" style={{ width: `${l.score}%`, background: scoreColor(l.score) }} /></div>
                      <span style={{ fontWeight: 700, color: scoreColor(l.score) }}>★ {l.score}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${statusConfig[l.status]?.cls}`}>{statusConfig[l.status]?.label}</span></td>
                  <td style={{ fontSize: 13 }}>{l.counselor}</td>
                  <td style={{ fontSize: 13, color: "var(--gray-500)" }}>{l.lastActivity}</td>
                  <td>{l.tags.map((t,i)=><span key={i} className="lead-tag">{t}</span>)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-icon" title="View"><Eye size={15} /></button>
                      <button className="btn btn-ghost btn-icon" title="More"><MoreVertical size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}