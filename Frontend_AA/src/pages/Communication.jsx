import { useState } from "react";
import { Plus, Mail, MessageSquare, Eye, BarChart2, X } from "lucide-react";
import "../style.css";

const emails = [{ recipient:"Rajesh Sharma", subject:"Welcome to Sacred Tree", status:"delivered", date:"2 hours ago" }];
const sms    = [{ recipient:"Priya Patel",   message:"Campus tour scheduled",  status:"delivered", date:"5 hours ago" }];
const whatsapp=[{ recipient:"Amit Kumar",   message:"Application status update",status:"read",     date:"1 day ago" }];
const campaigns=[
  { name:"March Admission Drive",  type:"Email",    audience:234, sent:234, opened:189, clicked:67,  status:"completed", date:"Mar 1, 2026" },
  { name:"Campus Tour Reminders",  type:"SMS",      audience:45,  sent:45,  opened:45,  clicked:12,  status:"active",    date:"Today" },
  { name:"Grade 1 Applications",   type:"WhatsApp", audience:156, sent:0,   opened:0,   clicked:0,   status:"scheduled", date:"Mar 5, 2026" },
];
const templates=[
  { name:"Welcome Email",           desc:"Welcome to Sacred Tree International School", tag:"Onboarding", last:"2 days ago" },
  { name:"Campus Tour Invitation",  desc:"Schedule Your Campus Visit",                  tag:"Follow-up",  last:"1 day ago" },
  { name:"Application Reminder",    desc:"Complete Your Application",                   tag:"Reminder",   last:"3 hours ago" },
  { name:"Fee Structure",           desc:"2026-27 Fee Structure Details",               tag:"Information",last:"Yesterday" },
];

const tagColor = t => ({
  Onboarding:"badge-blue", "Follow-up":"badge-orange", Reminder:"badge-yellow", Information:"badge-gray"
}[t] || "badge-gray");

const statusColor = s => ({ completed:"badge-green", active:"badge-blue", scheduled:"badge-orange" }[s] || "badge-gray");
const msgStatusColor = s => ({ delivered:"badge-green", read:"badge-blue", sent:"badge-teal" }[s] || "badge-gray");

export function Communication() {
  const [tab,   setTab]    = useState("email");
  const [compose,setCompose]=useState(false);
  const [campaign,setCampaign]=useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Communication Hub</h1>
          <p className="page-sub">Manage all parent communications in one place</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCompose(true)}><Plus size={15} /> New Message</button>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-5">
        {[
          { label:"Emails Sent",  value:"1,234", icon:Mail,          color:"var(--blue-bg)",   ic:"var(--blue)"   },
          { label:"SMS Sent",     value:"567",   icon:MessageSquare, color:"var(--green-bg)",  ic:"var(--green)"  },
          { label:"Open Rate",    value:"68%",   icon:Eye,           color:"var(--purple-bg)", ic:"var(--purple)" },
          { label:"Click Rate",   value:"24%",   icon:BarChart2,     color:"var(--orange-bg)", ic:"var(--orange)" },
        ].map((s,i) => {
          const Icon = s.icon;
          return (
            <div className="stat-card" key={i}>
              <div className="stat-wide">
                <div className="stat-icon" style={{ background:s.color }}><Icon size={20} style={{ color:s.ic }} /></div>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.value}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="comm-tabs">
        {["email","sms","whatsapp","campaigns"].map(t => (
          <div key={t} className={`comm-tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </div>
        ))}
      </div>

      {/* Tab content */}
      {tab !== "campaigns" ? (
        <div className="flex gap-5" style={{ flexWrap:"wrap" }}>
          {/* Messages */}
          <div className="card flex-1" style={{ minWidth:300 }}>
            <div className="card-header"><div className="card-title">{tab==="email"?"Recent Messages":tab==="sms"?"SMS Messages":"WhatsApp Messages"}</div></div>
            <div className="card-body">
              <table className="table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>{tab==="email"?"Subject":"Message"}</th>
                    <th>Status</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(tab==="email"?emails:tab==="sms"?sms:whatsapp).map((m,i)=>(
                    <tr key={i}>
                      <td className="td-bold">{m.recipient}</td>
                      <td>{m.subject||m.message}</td>
                      <td><span className={`badge ${msgStatusColor(m.status)}`} style={{textTransform:"capitalize"}}>{m.status}</span></td>
                      <td style={{fontSize:13,color:"var(--gray-500)"}}>{m.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Templates */}
          <div className="card" style={{ width:300 }}>
            <div className="card-header">
              <div className="card-title">Templates</div>
              <button className="btn btn-ghost btn-icon"><Plus size={16} /></button>
            </div>
            <div className="card-body">
              {templates.map((t,i) => (
                <div className="template-card" key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="template-name">{t.name}</span>
                    <span className={`badge ${tagColor(t.tag)}`} style={{fontSize:11}}>{t.tag}</span>
                  </div>
                  <div className="template-desc">{t.desc}</div>
                  <div className="template-meta">Last used: {t.last}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="card-title"></div>
            <button className="btn btn-primary" onClick={()=>setCampaign(true)}><Plus size={15} /> Create Campaign</button>
          </div>
          <div className="card-body">
            <table className="table">
              <thead><tr><th>Campaign Name</th><th>Type</th><th>Audience</th><th>Sent</th><th>Opened</th><th>Clicked</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {campaigns.map((c,i)=>(
                  <tr key={i}>
                    <td className="td-bold">{c.name}</td>
                    <td><span className={`badge ${c.type==="Email"?"badge-blue":c.type==="SMS"?"badge-green":"badge-teal"}`}>{c.type}</span></td>
                    <td>{c.audience}</td><td>{c.sent}</td><td>{c.opened}</td><td>{c.clicked}</td>
                    <td><span className={`badge ${statusColor(c.status)}`} style={{textTransform:"capitalize"}}>{c.status}</span></td>
                    <td style={{fontSize:13,color:"var(--gray-500)"}}>{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {compose && (
        <div className="modal-backdrop" onClick={()=>setCompose(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Compose Email</div>
                <div style={{fontSize:13,color:"var(--gray-500)"}}>Send email to parents or leads</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={()=>setCompose(false)}><X size={18}/></button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group"><label className="form-label">To <span className="req">*</span></label><input className="form-input" placeholder="Enter email addresses (comma separated)" /></div>
              <div className="form-group"><label className="form-label">Template</label><select className="form-select"><option value="">Select a template (optional)</option>{templates.map(t=><option key={t.name}>{t.name}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Subject <span className="req">*</span></label><input className="form-input" placeholder="Email subject" /></div>
              <div className="form-group"><label className="form-label">Message <span className="req">*</span></label><textarea className="form-textarea" rows={4} placeholder="Type your message..." /></div>
              <div className="flex gap-3"><button className="btn btn-outline" style={{fontSize:13}}>Attach Files</button><button className="btn btn-outline" style={{fontSize:13}}>Insert Variable</button></div>
              <div className="flex justify-end gap-3">
                <button className="btn btn-outline" onClick={()=>setCompose(false)}>Cancel</button>
                <button className="btn btn-outline">⬡ Schedule</button>
                <button className="btn btn-primary">✈ Send Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {campaign && (
        <div className="modal-backdrop" onClick={()=>setCampaign(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Create Campaign</div>
                <div style={{fontSize:13,color:"var(--gray-500)"}}>Set up a new communication campaign</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={()=>setCampaign(false)}><X size={18}/></button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group"><label className="form-label">Campaign Name <span className="req">*</span></label><input className="form-input" placeholder="Enter campaign name" /></div>
              <div className="form-group"><label className="form-label">Channel <span className="req">*</span></label><select className="form-select"><option value="">Select channel</option><option>Email</option><option>SMS</option><option>WhatsApp</option></select></div>
              <div className="form-group"><label className="form-label">Audience Filter <span className="req">*</span></label><select className="form-select"><option value="">Select audience</option><option>All Leads</option><option>New Leads</option><option>Interested</option><option>All Parents</option></select></div>
              <div className="form-group"><label className="form-label">Schedule</label><select className="form-select"><option>Send immediately</option><option>Schedule for later</option></select></div>
              <div className="flex justify-end gap-3">
                <button className="btn btn-outline" onClick={()=>setCampaign(false)}>Cancel</button>
                <button className="btn btn-primary">Create Campaign</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}