import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  User,
  Users,
  BookOpen,
  Camera,
  File,
  CheckCircle,
  Loader,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useApplication } from "../hooks/useApplication";
import "../style.css";
import ParentForm from "./ParentForm";
/**
 * MultiStepApplication Component
 * Complete 6-step application form with auto-fill from lead data
 * Step 1: Student Information
 * Step 2: Parent/Guardian Information
 * Step 3: Academic Information
 * Step 4: Photos
 * Step 5: Documents
 * Step 6: Review & Submit
 */
export function MultiStepApplication() {
  const { id: applicationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Load application data with custom hook
  const {
    applicationId: appId,
    progress,
    details,
    loading,
    error: hookError,
    currentStep,
    isStepCompleted,
    handleSaveStudentInfo,
    handleSaveParentInfo,
    handleSaveAcademicInfo,
    handleSaveDocuments,
    handleSubmitApplication,
  } = useApplication(applicationId);

  // Step tracking and form state
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [moveError, setMoveError] = useState("");

  // Step 1: Student Information
  const [studentForm, setStudentForm] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    aadhar_number: "",
    student_phone: "",
    student_email: "",
  });

  // Step 2: Parent Information (handled by ParentForm component)

  // Step 3: Academic Information
  const [academicForm, setAcademicForm] = useState({
    previous_school: "",
    previous_class: "",
    percentage: "",
    subjects: "",
    strengths: "",
    areas_to_improve: "",
  });

  // Step 4 & 5: Files
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Initialize forms from application details and lead data (auto-fill)
  useEffect(() => {
    if (details) {
      // 1. First priority: Existing saved student info
      if (details.student_info && details.student_info.first_name) {
        const si = details.student_info;
        setStudentForm({
          first_name: si.first_name || "",
          last_name: si.last_name || "",
          middle_name: si.middle_name || "",
          date_of_birth: si.date_of_birth ? si.date_of_birth.split("T")[0] : "",
          gender: si.gender || "",
          blood_group: si.blood_group || "",
          aadhar_number: si.aadhar_number || "",
          student_phone: si.phone || details.application?.phone || "",
          student_email: si.email || details.application?.email || "",
        });
      }
      // 2. Second priority: Lead data from the application record
      else if (details.application) {
        const app = details.application;
        // Split lead name if it's stored as first_name/last_name or full name
        setStudentForm((p) => ({
          ...p,
          first_name: app.first_name || "",
          last_name: app.last_name || "",
          student_email: app.email || "",
          student_phone: app.phone || "",
        }));
      }
    }
  }, [details]);

  // Update step from progress when loaded
  useEffect(() => {
    if (progress && progress.current_step) {
      setStep(progress.current_step);
    }
  }, [progress]);

  // Handle moving to next step
  const handleNextStep = async () => {
    setMoveError("");
    setSaving(true);

    try {
      // Validate and save current step
      if (step === 1) {
        if (
          !studentForm.first_name ||
          !studentForm.last_name ||
          !studentForm.date_of_birth ||
          !studentForm.gender
        ) {
          setMoveError(
            "Please fill in first name, last name, date of birth and gender.",
          );
          setSaving(false);
          return;
        }

        // Map frontend phone/email to backend expects if needed, or just send current form
        // Backend saveStudentInfo expects: first_name, last_name, middle_name, date_of_birth, gender, blood_group, aadhar_number
        await handleSaveStudentInfo({
          ...studentForm,
          // Explicitly ensure important fields are mapped to what backend expects
          dob: studentForm.date_of_birth,
        });
      } else if (step === 2) {
        // Step 2 is handled by ParentForm component's own submit button
        return;
      } else if (step === 3) {
        if (!academicForm.previous_school || !academicForm.previous_class) {
          setMoveError("Please fill in all required academic fields");
          setSaving(false);
          return;
        }
        await handleSaveAcademicInfo(academicForm);
      }

      // Move to next step (handled by hook usually, but we advance state here too)
      setStep((s) => s + 1);
    } catch (err) {
      setMoveError(err.message || "Failed to save step. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle moving to previous step
  const handlePrevStep = () => {
    setMoveError("");
    setStep((s) => Math.max(1, s - 1));
  };

  // Handle submission
  const handleSubmit = async () => {
    setMoveError("");
    setSaving(true);
    try {
      await handleSubmitApplication();
      // Redirect to applications list
      setTimeout(() => {
        navigate("/applications", {
          state: { message: "Application submitted successfully!" },
        });
      }, 1500);
    } catch (err) {
      setMoveError(err.message || "Failed to submit application");
    } finally {
      setSaving(false);
    }
  };

  // File upload handlers
  const handlePhotoUpload = (e) => {
    setPhotos([...photos, ...Array.from(e.target.files)]);
  };

  const handleDocumentUpload = (e) => {
    setDocuments([...documents, ...Array.from(e.target.files)]);
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="page-sm"
        style={{ maxWidth: 700, textAlign: "center", padding: "60px 20px" }}
      >
        <Loader
          size={32}
          className="animate-spin"
          style={{ color: "var(--primary)" }}
        />
        <p style={{ marginTop: 20, color: "var(--gray-600)" }}>
          Loading application...
        </p>
      </div>
    );
  }

  // Error state
  if (hookError || !appId) {
    return (
      <div className="page-sm" style={{ maxWidth: 700 }}>
        <button className="back-btn" onClick={() => navigate("/applications")}>
          <ArrowLeft size={16} /> Back
        </button>
        <div
          className="card"
          style={{ borderColor: "var(--red)", borderWidth: 2 }}
        >
          <div
            className="card-body"
            style={{ padding: "30px 20px", textAlign: "center" }}
          >
            <AlertCircle
              size={40}
              style={{ color: "var(--red)", marginBottom: 16 }}
            />
            <h3 style={{ marginBottom: 8 }}>Application Not Found</h3>
            <p style={{ fontSize: 13, color: "var(--gray-600)" }}>
              {hookError || "Unable to load this application"}
            </p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => navigate("/applications")}
            >
              Return to Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-sm" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button className="back-btn" onClick={() => navigate("/applications")}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ fontSize: 13, color: "var(--gray-600)" }}>
          Application # {applicationId}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="progress-steps">
          {[
            { num: 1, label: "Student", icon: User },
            { num: 2, label: "Parent", icon: Users },
            { num: 3, label: "Academic", icon: BookOpen },
            { num: 4, label: "Photos", icon: Camera },
            { num: 5, label: "Documents", icon: File },
            { num: 6, label: "Review", icon: CheckCircle },
          ].map((s) => {
            const Icon = s.icon;
            const isCompleted = isStepCompleted(s.num);
            const isCurrent = s.num === step;

            return (
              <div
                key={s.num}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isCompleted
                      ? "var(--green)"
                      : isCurrent
                        ? "var(--primary)"
                        : "var(--gray-200)",
                    color:
                      isCompleted || isCurrent ? "white" : "var(--gray-600)",
                    fontSize: 18,
                    marginBottom: 8,
                    border: isCurrent ? "3px solid var(--primary)" : "none",
                    fontWeight: isCurrent ? 600 : 400,
                    boxShadow: isCurrent
                      ? "0 0 0 4px rgba(59, 130, 246, 0.1)"
                      : "none",
                  }}
                >
                  {isCompleted ? <CheckCircle size={24} /> : <Icon size={18} />}
                </div>
                <div
                  style={{ fontSize: 12, fontWeight: isCurrent ? 600 : 400 }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Messages */}
      {moveError && (
        <div className="info-box info-box-red mb-6">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div className="info-box-text">{moveError}</div>
        </div>
      )}

      {/* Step Content */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Student Information</div>
            <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
              Step 1 of 6
            </div>
          </div>
          <div className="card-body">
            <div className="grid-2 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">
                  First Name <span className="req">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="Enter first name"
                  value={studentForm.first_name}
                  onChange={(e) =>
                    setStudentForm((p) => ({
                      ...p,
                      first_name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Last Name <span className="req">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="Enter last name"
                  value={studentForm.last_name}
                  onChange={(e) =>
                    setStudentForm((p) => ({
                      ...p,
                      last_name: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid-2 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">
                  Date of Birth <span className="req">*</span>
                </label>
                <input
                  className="form-input"
                  type="date"
                  value={studentForm.date_of_birth}
                  onChange={(e) =>
                    setStudentForm((p) => ({
                      ...p,
                      date_of_birth: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Gender <span className="req">*</span>
                </label>
                <select
                  className="form-select"
                  value={studentForm.gender}
                  onChange={(e) =>
                    setStudentForm((p) => ({ ...p, gender: e.target.value }))
                  }
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid-3 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  className="form-select"
                  value={studentForm.blood_group}
                  onChange={(e) =>
                    setStudentForm((p) => ({
                      ...p,
                      blood_group: e.target.value,
                    }))
                  }
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Aadhar Number (Optional)</label>
                <input
                  className="form-input"
                  placeholder="12-digit Aadhar number"
                  value={studentForm.aadhar_number}
                  onChange={(e) =>
                    setStudentForm((p) => ({
                      ...p,
                      aadhar_number: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid-2 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">Student Phone</label>
                <input
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={studentForm.student_phone}
                  onChange={(e) =>
                    setStudentForm((p) => ({
                      ...p,
                      student_phone: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="student@email.com"
                  value={studentForm.student_email}
                  onChange={(e) =>
                    setStudentForm((p) => ({
                      ...p,
                      student_email: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="info-box info-box-blue">
              <Clock size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div className="info-box-text">
                Your information has been pre-filled from your lead record.
                Please review and update as needed.
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <ParentForm
          applicationId={applicationId}
          lead={details?.lead || details?.application}
          onSuccess={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Academic Information</div>
            <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
              Step 3 of 6
            </div>
          </div>
          <div className="card-body">
            <div className="grid-2 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">
                  Previous School <span className="req">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="School name"
                  value={academicForm.previous_school}
                  onChange={(e) =>
                    setAcademicForm((p) => ({
                      ...p,
                      previous_school: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Last Class Studied <span className="req">*</span>
                </label>
                <select
                  className="form-select"
                  value={academicForm.previous_class}
                  onChange={(e) =>
                    setAcademicForm((p) => ({
                      ...p,
                      previous_class: e.target.value,
                    }))
                  }
                >
                  <option value="">Select class</option>
                  {["VI", "VII", "VIII", "IX", "X", "XI", "XII"].map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Last Year Percentage / GPA</label>
              <input
                className="form-input"
                placeholder="e.g., 85.5 or 3.8"
                type="number"
                step="0.01"
                value={academicForm.percentage}
                onChange={(e) =>
                  setAcademicForm((p) => ({ ...p, percentage: e.target.value }))
                }
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Main Subjects Studied</label>
              <input
                className="form-input"
                placeholder="e.g., Math, Science, English, Social Studies"
                value={academicForm.subjects}
                onChange={(e) =>
                  setAcademicForm((p) => ({ ...p, subjects: e.target.value }))
                }
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Academic Strengths</label>
              <textarea
                className="form-input"
                style={{ height: 80, resize: "vertical" }}
                placeholder="Describe academic strengths..."
                value={academicForm.strengths}
                onChange={(e) =>
                  setAcademicForm((p) => ({ ...p, strengths: e.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Areas for Improvement</label>
              <textarea
                className="form-input"
                style={{ height: 80, resize: "vertical" }}
                placeholder="Describe areas needing support..."
                value={academicForm.areas_to_improve}
                onChange={(e) =>
                  setAcademicForm((p) => ({
                    ...p,
                    areas_to_improve: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Student Photos</div>
            <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
              Step 4 of 6
            </div>
          </div>
          <div className="card-body">
            <div className="form-group mb-4">
              <label className="form-label">Upload Student Photos</label>
              <div
                style={{
                  border: "2px dashed var(--gray-300)",
                  borderRadius: 8,
                  padding: 40,
                  textAlign: "center",
                  cursor: "pointer",
                  background: "var(--gray-50)",
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.background = "var(--blue-50)";
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.background = "var(--gray-50)";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.background = "var(--gray-50)";
                  setPhotos([...photos, ...Array.from(e.dataTransfer.files)]);
                }}
              >
                <Camera
                  size={32}
                  style={{ color: "var(--primary)", marginBottom: 12 }}
                />
                <p style={{ marginBottom: 4 }}>
                  <strong>Click to browse</strong> or drag photos here
                </p>
                <p style={{ fontSize: 12, color: "var(--gray-500)" }}>
                  JPG, PNG up to 5MB each
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                    opacity: 0,
                  }}
                />
              </div>
            </div>

            {photos.length > 0 && (
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}
                >
                  {photos.length} file(s) selected
                </div>
                <div className="grid-3 gap-3">
                  {photos.map((file, i) => (
                    <div
                      key={i}
                      style={{
                        padding: 12,
                        background: "var(--gray-50)",
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    >
                      <div className="text-truncate">{file.name}</div>
                      <div style={{ color: "var(--gray-500)" }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="info-box info-box-blue mt-4">
              <Camera size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div className="info-box-text">
                Upload clear, recent photographs. Passport photo format or
                full-length photo recommended.
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Supporting Documents</div>
            <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
              Step 5 of 6
            </div>
          </div>
          <div className="card-body">
            <div className="form-group mb-4">
              <label className="form-label">Upload Documents</label>
              <div
                style={{
                  border: "2px dashed var(--gray-300)",
                  borderRadius: 8,
                  padding: 40,
                  textAlign: "center",
                  cursor: "pointer",
                  background: "var(--gray-50)",
                }}
              >
                <File
                  size={32}
                  style={{ color: "var(--primary)", marginBottom: 12 }}
                />
                <p style={{ marginBottom: 4 }}>
                  <strong>Click to browse</strong> or drag documents here
                </p>
                <p style={{ fontSize: 12, color: "var(--gray-500)" }}>
                  PDF, DOC, JPG up to 10MB each
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                    opacity: 0,
                  }}
                />
              </div>
            </div>

            {documents.length > 0 && (
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}
                >
                  {documents.length} file(s) selected
                </div>
                <div className="space-y-2">
                  {documents.map((file, i) => (
                    <div
                      key={i}
                      style={{
                        padding: 12,
                        background: "var(--gray-50)",
                        borderRadius: 6,
                        fontSize: 12,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div className="text-truncate">{file.name}</div>
                        <div style={{ color: "var(--gray-500)" }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      <button
                        className="btn btn-sm"
                        style={{
                          background: "var(--red-50)",
                          color: "var(--red)",
                          border: "1px solid var(--red-200)",
                        }}
                        onClick={() =>
                          setDocuments(documents.filter((_, idx) => idx !== i))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="info-box info-box-blue mt-4">
              <File size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div className="info-box-text">
                Upload previous marks cards, disability certificates, or any
                other supporting documents.
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Review & Submit</div>
            <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
              Step 6 of 6
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div
                style={{
                  padding: 16,
                  background: "var(--green-50)",
                  borderRadius: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle size={20} style={{ color: "var(--green)" }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>All Steps Completed</div>
                    <div style={{ fontSize: 13, color: "var(--gray-600)" }}>
                      Your application is ready for final submission
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}
                >
                  Application Summary
                </div>
                <div className="grid-2 gap-4">
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {studentForm.first_name || studentForm.last_name
                        ? `${studentForm.first_name} ${studentForm.last_name}`
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
                      Parent Name
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {details?.parent_info?.primary_contact_person ||
                        details?.parent_info?.father_name ||
                        "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
                      Previous School
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {academicForm.previous_school || "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
                      Photos Uploaded
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {photos.length} file(s)
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>
                      Documents
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {documents.length} file(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6" style={{ gap: 12 }}>
        <button
          className="btn btn-outline"
          onClick={handlePrevStep}
          disabled={step === 1 || saving}
        >
          <ArrowLeft size={14} /> Previous
        </button>

        {step !== 2 ? (
          <button
            className="btn btn-primary"
            onClick={step === 6 ? handleSubmit : handleNextStep}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader size={14} className="animate-spin" />{" "}
                {step === 6 ? "Submitting..." : "Saving..."}
              </>
            ) : step === 6 ? (
              <>
                <CheckCircle size={14} /> Submit Application
              </>
            ) : (
              <>
                Next <ArrowRight size={14} />
              </>
            )}
          </button>
        ) : (
          <div
            style={{
              fontSize: 13,
              color: "var(--gray-500)",
              fontStyle: "italic",
            }}
          >
            Please use the button inside the form above to continue.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div
        style={{
          marginTop: 40,
          padding: 16,
          background: "var(--gray-50)",
          borderRadius: 8,
          fontSize: 12,
          textAlign: "center",
          color: "var(--gray-600)",
        }}
      >
        <Clock size={14} style={{ display: "inline-block", marginRight: 6 }} />
        Your progress is automatically saved at each step. You can close this
        form and return later to resume.
      </div>
    </div>
  );
}
