import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Save, CheckCircle, Upload, AlertTriangle, FileText } from "lucide-react";
import "../style.css";

const STEPS = ["Student Info","Parent Info","Academic Details","Photos & ID","Documents","Review & Submit"];

const docItems = [
  { name:"Birth Certificate",      sub:"PDF, JPG, or PNG (Max 5MB)",                              req:true  },
  { name:"Previous School Records",sub:"PDF, JPG, or PNG (Max 5MB)",                              req:true  },
  { name:"Address Proof",          sub:"PDF, JPG, or PNG (Max 5MB)",                              req:true  },
  { name:"Transfer Certificate",   sub:"Required for transfer students (PDF, JPG, PNG - Max 5MB)",req:false },
];

const photoGroups = [
  { label:"Student", items:[{name:"Student Photograph",sub:"Passport size (JPG, PNG - Max 5MB)"},{name:"Student Aadhar Card",sub:"Both sides (JPG, PNG, PDF - Max 5MB)"}]},
  { label:"Father",  items:[{name:"Father's Photograph",sub:"Passport size (JPG, PNG - Max 5MB)"},{name:"Father's Aadhar Card",sub:"Both sides (JPG, PNG, PDF - Max 5MB)"}]},
  { label:"Mother",  items:[{name:"Mother's Photograph",sub:"Passport size (JPG, PNG - Max 5MB)"},{name:"Mother's Aadhar Card",sub:"Both sides (JPG, PNG, PDF - Max 5MB)"}]},
];

const fileSummary = ["Student Photo","Father Photo","Mother Photo","Birth Certificate","Address Proof","Student Aadhar","Father Aadhar","Mother Aadhar","Previous Records"];

export function NewApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showBulk, setShowBulk] = useState(false);
  const [form, setForm] = useState({
    firstName:"", lastName:"", dob:"", gender:"", blood:"", nationality:"", religion:"",
    fatherName:"", fatherOcc:"", fatherPhone:"", fatherEmail:"",
    motherName:"", motherOcc:"", motherPhone:"", motherEmail:"",
    gradeFor:"", acYear:"2026-2027", prevSchool:"", prevGrade:"",
    street:"", city:"", state:"", pin:""
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const pct = Math.round((step/(STEPS.length-1))*100);

  const renderStep = () => {
    switch(step) {
      case 0: return (
        <div className="card">
          <div className="card-body">
            <div className="form-section-title">Student Information</div>
            <div className="grid-2 gap-3 mb-3">
              <div className="form-group"><label className="form-label">First Name <span className="req">*</span></label><input className="form-input" value={form.firstName} onChange={e=>set("firstName",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Last Name <span className="req">*</span></label><input className="form-input" value={form.lastName} onChange={e=>set("lastName",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Date of Birth <span className="req">*</span></label><input className="form-input" type="date" value={form.dob} onChange={e=>set("dob",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Gender <span className="req">*</span></label><select className="form-select" value={form.gender} onChange={e=>set("gender",e.target.value)}><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select></div>
              <div className="form-group"><label className="form-label">Blood Group</label><select className="form-select" value={form.blood} onChange={e=>set("blood",e.target.value)}><option value="">Select blood group</option>{["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(b=><option key={b}>{b}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Nationality <span className="req">*</span></label><input className="form-input" value={form.nationality} onChange={e=>set("nationality",e.target.value)}/></div>
            </div>
            <div className="form-group"><label className="form-label">Religion</label><input className="form-input" value={form.religion} onChange={e=>set("religion",e.target.value)}/></div>
          </div>
        </div>
      );
      case 1: return (
        <div className="card">
          <div className="card-body">
            <div className="form-section-title">Parent/Guardian Information</div>
            <div style={{fontWeight:600,fontSize:13,color:"var(--gray-600)",marginBottom:10}}>Father's Details</div>
            <div className="grid-2 gap-3 mb-4">
              <div className="form-group"><label className="form-label">Full Name <span className="req">*</span></label><input className="form-input" value={form.fatherName} onChange={e=>set("fatherName",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Occupation</label><input className="form-input" value={form.fatherOcc} onChange={e=>set("fatherOcc",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Phone Number <span className="req">*</span></label><input className="form-input" value={form.fatherPhone} onChange={e=>set("fatherPhone",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Email Address <span className="req">*</span></label><input className="form-input" type="email" value={form.fatherEmail} onChange={e=>set("fatherEmail",e.target.value)}/></div>
            </div>
            <div style={{fontWeight:600,fontSize:13,color:"var(--gray-600)",marginBottom:10}}>Mother's Details</div>
            <div className="grid-2 gap-3">
              <div className="form-group"><label className="form-label">Full Name <span className="req">*</span></label><input className="form-input" value={form.motherName} onChange={e=>set("motherName",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Occupation</label><input className="form-input" value={form.motherOcc} onChange={e=>set("motherOcc",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Phone Number <span className="req">*</span></label><input className="form-input" value={form.motherPhone} onChange={e=>set("motherPhone",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Email Address <span className="req">*</span></label><input className="form-input" type="email" value={form.motherEmail} onChange={e=>set("motherEmail",e.target.value)}/></div>
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="card">
          <div className="card-body">
            <div className="form-section-title">Academic Details</div>
            <div className="grid-2 gap-3 mb-3">
              <div className="form-group"><label className="form-label">Grade Applying For <span className="req">*</span></label><select className="form-select" value={form.gradeFor} onChange={e=>set("gradeFor",e.target.value)}><option value="">Select grade</option>{["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"].map(g=><option key={g}>{g}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Academic Year <span className="req">*</span></label><input className="form-input" value={form.acYear} readOnly style={{background:"var(--gray-50)"}}/></div>
              <div className="form-group"><label className="form-label">Previous School</label><input className="form-input" value={form.prevSchool} onChange={e=>set("prevSchool",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Previous Grade</label><input className="form-input" value={form.prevGrade} onChange={e=>set("prevGrade",e.target.value)}/></div>
            </div>
            <div className="form-section-title mt-4">Address</div>
            <div className="form-group mb-3"><label className="form-label">Street Address <span className="req">*</span></label><textarea className="form-textarea" rows={2} value={form.street} onChange={e=>set("street",e.target.value)}/></div>
            <div className="grid-2 gap-3 mb-3">
              <div className="form-group"><label className="form-label">City <span className="req">*</span></label><input className="form-input" value={form.city} onChange={e=>set("city",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">State <span className="req">*</span></label><input className="form-input" value={form.state} onChange={e=>set("state",e.target.value)}/></div>
            </div>
            <div className="form-group" style={{maxWidth:200}}><label className="form-label">Pincode <span className="req">*</span></label><input className="form-input" value={form.pin} onChange={e=>set("pin",e.target.value)}/></div>
          </div>
        </div>
      );
      case 3: return (
        <div className="card">
          <div className="card-body">
            <div className="form-section-title">Photographs & Identity Verification</div>
            <p style={{fontSize:13,color:"var(--gray-500)",marginBottom:16}}>Upload recent passport-size photographs and Aadhar card copies for verification purposes.</p>
            {photoGroups.map(g => (
              <div key={g.label}>
                <div className="photo-group-title"><FileText size={15} style={{color:"var(--primary)"}}/>{g.label}</div>
                <div className="photo-grid mb-4">
                  {g.items.map(item => (
                    <div className="photo-box" key={item.name}>
                      <div className="photo-box-name"><FileText size={13}/>{item.name} <span className="req">*</span></div>
                      <div className="photo-box-sub">{item.sub}</div>
                      <button type="button" className="btn btn-outline btn-sm"><Upload size={13}/> Choose File</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="info-box info-box-orange mt-2">
              <AlertTriangle size={16} style={{color:"var(--orange)",flexShrink:0,marginTop:2}}/>
              <div className="info-box-text"><strong>Note:</strong> All photographs should be recent, clear passport-size images with white background. Aadhar cards should show both front and back clearly.</div>
            </div>
          </div>
        </div>
      );
      case 4: return (
        <div className="card">
          <div className="card-body">
            <div className="form-section-title">Supporting Documents</div>
            <p style={{fontSize:13,color:"var(--gray-500)",marginBottom:16}}>Upload required documents for admission processing</p>
            {docItems.map(d => (
              <div className="doc-row" key={d.name}>
                <div className="doc-row-info">
                  <div className="doc-name">{d.name}{d.req && <span className="req"> *</span>}</div>
                  <div className="doc-sub">{d.sub}</div>
                </div>
                <button type="button" className="btn btn-outline btn-sm"><Upload size={13}/> Upload</button>
              </div>
            ))}
          </div>
        </div>
      );
      case 5: return (
        <div className="space-y-4">
          <div className="review-section">
            <div className="review-section-title">Student Information</div>
            <div style={{fontSize:13,color:"var(--gray-600)"}}>{form.firstName||"·"} {form.lastName}</div>
          </div>
          <div className="review-section">
            <div className="review-section-title">Parent Information</div>
            <div style={{fontSize:13,color:"var(--gray-600)"}}>Father: {form.fatherName||"·"}</div>
            <div style={{fontSize:13,color:"var(--gray-600)"}}>Mother: {form.motherName||"·"}</div>
          </div>
          <div className="review-section">
            <div className="review-section-title">Academic Information</div>
            <div style={{fontSize:13,color:"var(--gray-600)"}}>Grade: {form.gradeFor||"·"} &nbsp; Year: {form.acYear}</div>
          </div>
          <div className="review-section">
            <div className="review-section-title">Uploaded Files Summary</div>
            <div className="grid-2 gap-2">
              {fileSummary.map(f=>(
                <div className="file-missing" key={f}><AlertTriangle size={13}/>{f} - Missing</div>
              ))}
            </div>
          </div>
          <div className="info-box info-box-green">
            <CheckCircle size={16} style={{color:"var(--green)",flexShrink:0}}/>
            <div className="info-box-text">✓ All information verified. Ready to submit.</div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="page-sm" style={{maxWidth:800}}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button className="back-btn" style={{margin:0}} onClick={()=>navigate("/applications")}><ArrowLeft size={16}/></button>
          <div>
            <h1 className="page-title" style={{fontSize:22}}>New Application</h1>
            <p className="page-sub">Complete all steps to submit</p>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={()=>setShowBulk(!showBulk)}><FileText size={14}/> Bulk Upload</button>
      </div>

      {/* Bulk Upload panel */}
      {showBulk && (
        <div className="card mb-4" style={{border:"2px solid var(--primary)"}}>
          <div className="card-body">
            <div style={{fontWeight:600,fontSize:14,color:"var(--primary)",marginBottom:4,display:"flex",alignItems:"center",gap:6}}><FileText size={15}/>Bulk Data Upload</div>
            <p style={{fontSize:13,color:"var(--gray-500)",marginBottom:12}}>Upload a CSV or Excel file containing multiple application data. This will auto-populate form fields for faster data entry.</p>
            <div className="upload-box">
              <Upload size={28} style={{color:"var(--gray-400)",margin:"0 auto"}}/>
              <div className="upload-box-title">Choose CSV or Excel file</div>
              <div className="upload-box-sub">or drag and drop here</div>
            </div>
            <p style={{fontSize:12,color:"var(--gray-500)",marginTop:10}}><strong>Template format:</strong> Download our sample template to ensure your data is formatted correctly. <span style={{color:"var(--primary)",cursor:"pointer"}}>Download Template</span></p>
          </div>
        </div>
      )}

      {/* Step bar */}
      <div className="step-bar mb-5">
        <div className="step-track"><div className="step-track-fill" style={{width:`${pct}%`}}/></div>
        <div className="step-labels">
          {STEPS.map((s,i) => (
            <div className="step-item" key={i}>
              <div className={`step-circle ${i<step?"done":i===step?"active":""}`}>
                {i<step ? <CheckCircle size={16}/> : i+1}
              </div>
              <span className={`step-name ${i===step?"active":""}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {renderStep()}

      {/* Nav */}
      <div className="flex items-center justify-between mt-5">
        <button className="back-btn" style={{margin:0}} onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}><ArrowLeft size={15}/> Previous</button>
        <div className="flex gap-3">
          <button className="btn btn-outline btn-sm"><Save size={13}/> Save Draft</button>
          {step < STEPS.length-1
            ? <button className="btn btn-primary btn-sm" onClick={()=>setStep(s=>Math.min(STEPS.length-1,s+1))}>Next <ArrowRight size={13}/></button>
            : <button className="btn btn-primary btn-sm" onClick={()=>navigate("/applications")}><CheckCircle size={13}/> Submit Application</button>
          }
        </div>
      </div>
    </div>
  );
}