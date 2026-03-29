// ── Counseling.jsx ──────────────────────────────────────────
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Clock, CheckSquare } from "lucide-react";
import "../style.css";

const assignedLeads = [
  { id:1, name:"Aarav Sharma", grade:"Grade 5", priority:"high",   nextAction:"Follow-up call", dueDate:"Today"    },
  { id:2, name:"Diya Patel",   grade:"Grade 3", priority:"medium", nextAction:"Send brochure",  dueDate:"Tomorrow" },
  { id:3, name:"Arjun Kumar",  grade:"Grade 8", priority:"high",   nextAction:"Campus tour",    dueDate:"Mar 5"    },
];
const visits = [
  { id:1, student:"Ananya Singh", grade:"Grade 1", date:"Mar 3, 2026", time:"10:00 AM" },
  { id:2, student:"Vihaan Reddy", grade:"Grade 6", date:"Mar 5, 2026", time:"2:00 PM"  },
];
const tasks = [
  { id:1, task:"Follow-up with 5 hot leads",          priority:"high",   done:false },
  { id:2, task:"Prepare tour schedule for next week", priority:"medium", done:false },
  { id:3, task:"Send weekly report",                  priority:"low",    done:true  },
];

export function Counseling() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Counselor Workspace</h1><p className="page-sub">Manage your leads and schedule</p></div>
      </div>

      <div className="grid-3 mb-5">
        <div className="stat-card"><div className="stat-label">Assigned Leads</div><div className="stat-value">{assignedLeads.length}</div></div>
        <div className="stat-card"><div className="stat-label">Pending Tasks</div><div className="stat-value" style={{color:"var(--orange)"}}>{tasks.filter(t=>!t.done).length}</div></div>
        <div className="stat-card"><div className="stat-label">This Week's Tours</div><div className="stat-value" style={{color:"var(--blue)"}}>{visits.length}</div></div>
      </div>

      <div className="grid-2 mb-5">
        <div className="card">
          <div className="card-header"><div className="card-title">My Assigned Leads</div></div>
          <div className="card-body">
            {assignedLeads.map(l => (
              <div className="assigned-lead-card" key={l.id}>
                <div className="assigned-lead-top">
                  <div><div className="assigned-lead-name">{l.name}</div><div className="assigned-lead-grade">{l.grade}</div></div>
                  <span className={`badge ${l.priority==="high"?"badge-red":"badge-yellow"}`}>{l.priority}</span>
                </div>
                <div className="assigned-lead-action"><CheckSquare size={14} />{l.nextAction}<span style={{marginLeft:"auto",fontSize:12,color:"var(--gray-400)"}}>{l.dueDate}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Upcoming Campus Visits</div>
            <button className="btn btn-primary btn-sm" onClick={()=>navigate("/counseling/schedule-visit")}><Plus size={14}/> Schedule Visit</button>
          </div>
          <div className="card-body">
            {visits.map(v => (
              <div className="visit-card" key={v.id}>
                <div className="visit-name">{v.student}</div>
                <div className="visit-grade">{v.grade}</div>
                <div className="visit-meta">
                  <span><Calendar size={13}/> {v.date}</span>
                  <span><Clock size={13}/> {v.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header"><div className="card-title">Follow-up Tasks</div></div>
        <div className="card-body">
          {tasks.map(t => (
            <div className="task-row" key={t.id}>
              <CheckSquare size={18} className={`task-check ${t.done?"done":""}`} />
              <span className={`task-label ${t.done?"done":""}`}>{t.task}</span>
              <span className={`badge ${t.priority==="high"?"badge-red":t.priority==="medium"?"badge-yellow":"badge-blue"}`}>{t.priority}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-blue" onClick={()=>navigate("/leads/add")}><Plus size={15}/> Add New Lead</button>
    </div>
  );
}