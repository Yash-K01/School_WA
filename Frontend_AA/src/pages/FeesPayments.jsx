// ── FeesPayments.jsx ────────────────────────────────────────
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import "../style.css";

const payments = [
  { id:"INV001", student:"Arjun Kumar",  grade:"Grade 8", amount:"₹1,25,000", status:"Paid",    date:"Mar 1, 2026"  },
  { id:"INV002", student:"Ananya Singh", grade:"Grade 1", amount:"₹1,10,000", status:"Pending", date:"Mar 2, 2026"  },
  { id:"INV003", student:"Vihaan Reddy", grade:"Grade 6", amount:"₹1,20,000", status:"Paid",    date:"Feb 28, 2026" },
];

export function FeesPayments() {
  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Fees & Payments</h1><p className="page-sub">Track admission fees and payment status</p></div>
      </div>

      <div className="grid-4 mb-5">
        {[
          { label:"Total Collected", value:"₹45.2L", icon:DollarSign,  color:"var(--green-bg)",  ic:"var(--green)"  },
          { label:"This Month",      value:"₹8.5L",  icon:TrendingUp,  color:"var(--blue-bg)",   ic:"var(--blue)"   },
          { label:"Pending",         value:"₹3.2L",  icon:AlertCircle, color:"var(--orange-bg)", ic:"var(--orange)" },
          { label:"Refunds",         value:"₹1.5L",  icon:CheckCircle, color:"var(--purple-bg)", ic:"var(--purple)" },
        ].map((s,i)=>{const Icon=s.icon;return(
          <div className="stat-card" key={i}>
            <div className="stat-wide">
              <div className="stat-icon" style={{background:s.color}}><Icon size={20} style={{color:s.ic}}/></div>
              <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div></div>
            </div>
          </div>
        );})}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Payment Transactions</div>
          <button className="btn btn-primary btn-sm">Generate Invoice</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Invoice ID</th><th>Student Name</th><th>Grade</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {payments.map(p=>(
                <tr key={p.id}>
                  <td className="td-bold">{p.id}</td><td>{p.student}</td><td>{p.grade}</td>
                  <td style={{fontWeight:700}}>{p.amount}</td>
                  <td><span className={`badge ${p.status==="Paid"?"badge-green":"badge-orange"}`}>{p.status}</span></td>
                  <td style={{fontSize:13}}>{p.date}</td>
                  <td><button className="btn btn-outline btn-sm">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}