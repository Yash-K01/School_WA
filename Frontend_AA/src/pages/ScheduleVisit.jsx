import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, X } from "lucide-react";
import "../style.css";

const areas = ["Classrooms","Science Labs","Computer Labs","Library","Sports Facilities","Arts & Music Room","Cafeteria","Playgrounds","Auditorium"];

export function ScheduleVisit() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    parentName:"", studentName:"", email:"", phone:"", grade:"", visitors:"2",
    date:"", time:"", visitType:"", guide:"",
    interests:[], requirements:"", notes:""
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const toggleArea = (a) => setForm(p=>({ ...p, interests: p.interests.includes(a) ? p.interests.filter(x=>x!==a) : [...p.interests,a] }));

  const handleSubmit = (e) => { e.preventDefault(); navigate("/counseling"); };

  return (
    <div className="page-sm" style={{maxWidth:860}}>
      <button className="back-btn" onClick={()=>navigate(-1)}><ArrowLeft size={16}/> Back</button>
      <h1 className="page-title mb-1">Schedule Campus Visit</h1>
      <p className="page-sub mb-5">Arrange a personalized tour of Sacred Tree International School</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Visitor Info */}
        <div className="card">
          <div className="card-body">
            <div className="form-section-title flex items-center gap-2"><Users size={16} style={{color:"var(--primary)"}}/>Visitor Information</div>
            <div className="grid-2 gap-3 mb-3">
              <div className="form-group"><label className="form-label">Parent/Guardian Name <span className="req">*</span></label><input className="form-input" placeholder="Enter full name" value={form.parentName} onChange={e=>set("parentName",e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Student Name</label><input className="form-input" placeholder="Enter student name" value={form.studentName} onChange={e=>set("studentName",e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="parent@email.com" value={form.email} onChange={e=>set("email",e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Phone <span className="req">*</span></label><input className="form-input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e=>set("phone",e.target.value)} required /></div>
              <div className="form-group">
                <label className="form-label">Grade of Interest</label>
                <select className="form-select" value={form.grade} onChange={e=>set("grade",e.target.value)}>
                  <option value="">Select grade</option>
                  {["Nursery","LKG","UKG","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"].map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Number of Visitors</label><input className="form-input" type="number" min="1" max="10" value={form.visitors} onChange={e=>set("visitors",e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* Visit Schedule */}
        <div className="card">
          <div className="card-body">
            <div className="form-section-title flex items-center gap-2"><Calendar size={16} style={{color:"var(--primary)"}}/>Visit Schedule</div>
            <div className="grid-2 gap-3 mb-3">
              <div className="form-group"><label className="form-label">Preferred Date <span className="req">*</span></label><input className="form-input" type="date" value={form.date} onChange={e=>set("date",e.target.value)} required min={new Date().toISOString().split("T")[0]} /></div>
              <div className="form-group">
                <label className="form-label">Preferred Time <span className="req">*</span></label>
                <select className="form-select" value={form.time} onChange={e=>set("time",e.target.value)} required>
                  <option value="">Select time slot</option>
                  {["09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Visit Type</label>
              <select className="form-select" value={form.visitType} onChange={e=>set("visitType",e.target.value)}>
                <option value="">Select visit type</option>
                <option>Guided Campus Tour</option><option>Tour + Counselor Meeting</option>
                <option>Tour + Principal Meeting</option><option>Classroom Observation</option>
                <option>Comprehensive Visit (All)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assign Tour Guide</label>
              <select className="form-select" value={form.guide} onChange={e=>set("guide",e.target.value)}>
                <option value="">Select guide</option>
                {["Priya Sharma","Amit Patel","Neha Kumar","Rahul Singh","Anjali Gupta"].map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Tour Preferences */}
        <div className="card">
          <div className="card-body">
            <div className="form-section-title flex items-center gap-2"><MapPin size={16} style={{color:"var(--primary)"}}/>Tour Preferences</div>
            <label className="form-label mb-2">Areas of Interest (Select all that apply)</label>
            <div className="grid-3 gap-2 mb-4">
              {areas.map(a => (
                <label key={a} className="checkbox-wrap">
                  <input type="checkbox" checked={form.interests.includes(a)} onChange={()=>toggleArea(a)} />
                  {a}
                </label>
              ))}
            </div>
            <div className="form-group mb-3"><label className="form-label">Special Requirements or Questions</label><textarea className="form-textarea" rows={3} placeholder="Any accessibility needs, specific questions, or areas you'd like to focus on..." value={form.requirements} onChange={e=>set("requirements",e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Internal Notes (Not visible to visitor)</label><textarea className="form-textarea" rows={2} placeholder="Any internal notes for the tour guide..." value={form.notes} onChange={e=>set("notes",e.target.value)} /></div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-outline" onClick={()=>navigate(-1)}><X size={15}/> Cancel</button>
          <button type="submit" className="btn btn-primary"><Calendar size={15}/> Schedule Visit</button>
        </div>
      </form>
    </div>
  );
}