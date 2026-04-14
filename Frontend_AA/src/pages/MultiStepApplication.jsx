import { useState, useEffect, useRef } from "react";
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

const CLASS_OPTIONS = [
  "Nursery",
  "Jr KG",
  "Sr KG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

const BOARD_OPTIONS = ["CBSE", "ICSE", "State", "IB", "Other"];

const REQUIRED_DOCUMENT_TYPES = [
  "birth_certificate",
  "aadhaar_card",
  "passport_photos",
  "transfer_certificate",
  "previous_report_card",
  "address_proof",
  "parent_id_proof",
];

const REQUIRED_PHOTO_TYPES = ["student_photo"];
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
  const [invalidFields, setInvalidFields] = useState({});

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
    desired_class: "",
    previous_school: "",
    previous_class: "Nursery",
    marks_percentage: "",
    board_name: "CBSE",
    academic_year: "",
    additional_qualifications: "",
    extracurricular_activities: "",
    achievements: "",
  });

  // Step 4 & 5: Files
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState({});

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

  useEffect(() => {
    const academicInfo = details?.academic_info || details?.academic;
    if (!academicInfo) {
      return;
    }

    setAcademicForm((prev) => ({
      ...prev,
      desired_class: academicInfo.desired_class || prev.desired_class,
      previous_school: academicInfo.previous_school || "",
      previous_class: academicInfo.previous_class || prev.previous_class,
      marks_percentage:
        academicInfo.marks_percentage === null ||
        academicInfo.marks_percentage === undefined
          ? ""
          : String(academicInfo.marks_percentage),
      board_name: academicInfo.board_name || prev.board_name,
      academic_year: academicInfo.academic_year || "",
      additional_qualifications: academicInfo.additional_qualifications || "",
      extracurricular_activities: academicInfo.extracurricular_activities || "",
      achievements: academicInfo.achievements || "",
    }));
  }, [details]);

  // Update step from progress ONLY on initial load (not after saves)
  const initialStepLoaded = useRef(false);
  useEffect(() => {
    if (progress && progress.current_step && !initialStepLoaded.current) {
      setStep(progress.current_step);
      initialStepLoaded.current = true;
    }
  }, [progress]);

  useEffect(() => {
    if (applicationId) {
      sessionStorage.setItem("activeAdmissionId", String(applicationId));
    }
  }, [applicationId]);

  useEffect(() => {
    if (details?.photos?.student_photo) {
      setPhotos((prev) =>
        prev.some((item) => item.type === "student_photo")
          ? prev
          : [
              ...prev,
              {
                type: "student_photo",
                name: details.photos.student_photo,
                fromServer: true,
              },
            ],
      );
    }

    if (details?.documents) {
      const nextDocs = {};
      REQUIRED_DOCUMENT_TYPES.forEach((docType) => {
        if (details.documents[docType]) {
          nextDocs[docType] = {
            name: details.documents[docType],
            fromServer: true,
          };
        }
      });

      if (Object.keys(nextDocs).length) {
        setDocuments((prev) => ({ ...nextDocs, ...prev }));
      }
    }
  }, [details]);

  const focusField = (fieldId) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.focus();
    }
  };

  const markInvalidAndFocus = (fields) => {
    setInvalidFields(fields);
    const firstInvalidField = Object.keys(fields).find((key) => fields[key]);
    if (firstInvalidField) {
      focusField(firstInvalidField);
    }
  };

  // Handle moving to next step
  const handleNextStep = async () => {
    setMoveError("");
    setInvalidFields({});
    setSaving(true);

    try {
      // Validate and save current step
      if (step === 1) {
        const studentErrors = {
          student_first_name: !studentForm.first_name?.trim(),
          student_last_name: !studentForm.last_name?.trim(),
          student_date_of_birth: !studentForm.date_of_birth,
          student_gender: !studentForm.gender,
        };

        const hasStudentError = Object.values(studentErrors).some(Boolean);
        if (hasStudentError) {
          markInvalidAndFocus(studentErrors);
          setMoveError("Please fill all mandatory student fields.");
          setSaving(false);
          return;
        }

        const today = new Date();
        const maxDate = new Date(
          today.getFullYear() - 4,
          today.getMonth(),
          today.getDate(),
        );

        if (new Date(studentForm.date_of_birth) > maxDate) {
          markInvalidAndFocus({ student_date_of_birth: true });
          setMoveError("Minimum age should be 4 years.");
          setSaving(false);
          return;
        }

        await handleSaveStudentInfo({
          ...studentForm,
          dob: studentForm.date_of_birth,
        });
      } else if (step === 2) {
        // Step 2 is handled by ParentForm component's own submit button
        return;
      } else if (step === 3) {
        const academicErrors = {
          academic_desired_class: !academicForm.desired_class,
        };

        const marksValue =
          academicForm.marks_percentage === "" ||
          academicForm.marks_percentage === null
            ? null
            : Number(academicForm.marks_percentage);

        if (
          marksValue !== null &&
          (Number.isNaN(marksValue) || marksValue < 0 || marksValue > 100)
        ) {
          academicErrors.academic_marks_percentage = true;
        }

        const hasAcademicError = Object.values(academicErrors).some(Boolean);
        if (hasAcademicError) {
          markInvalidAndFocus(academicErrors);
          setMoveError(
            "Please provide desired class and ensure marks are between 0 and 100.",
          );
          setSaving(false);
          return;
        }

        const payloadApplicationId = details?.application?.application_id || null;
        const payloadSchoolId =
          details?.application?.school_id ||
          details?.application?.schoolId ||
          null;

        await handleSaveAcademicInfo({
          application_id: payloadApplicationId,
          school_id: payloadSchoolId,
          desired_class: academicForm.desired_class,
          previous_school: academicForm.previous_school,
          previous_class: academicForm.previous_class,
          marks_percentage:
            academicForm.marks_percentage === ""
              ? null
              : Number(academicForm.marks_percentage),
          board_name: academicForm.board_name,
          academic_year: academicForm.academic_year,
          additional_qualifications: academicForm.additional_qualifications,
          extracurricular_activities: academicForm.extracurricular_activities,
          achievements: academicForm.achievements,
        });
      } else if (step === 4) {
        const hasAllRequiredPhotos = REQUIRED_PHOTO_TYPES.every((photoType) =>
          photos.some((photo) => photo.type === photoType),
        );

        if (!hasAllRequiredPhotos) {
          setMoveError("Student photo is mandatory before moving ahead.");
          setSaving(false);
          return;
        }

        await handleSaveDocuments({
          photos: {
            student_photo:
              photos.find((p) => p.type === "student_photo")?.name || "",
            passport_photos:
              photos.find((p) => p.type === "passport_photos")?.name || "",
          },
          documents: {},
        });
      } else if (step === 5) {
        const missingDocType = REQUIRED_DOCUMENT_TYPES.find(
          (docType) => !documents[docType],
        );

        if (missingDocType) {
          focusField(`document_${missingDocType}`);
          setMoveError("Please upload all mandatory documents.");
          setSaving(false);
          return;
        }

        await handleSaveDocuments({
          photos: {
            student_photo:
              photos.find((p) => p.type === "student_photo")?.name || "",
            passport_photos:
              photos.find((p) => p.type === "passport_photos")?.name || "",
          },
          documents: Object.fromEntries(
            Object.entries(documents).map(([key, value]) => [
              key,
              value?.name || "",
            ]),
          ),
        });
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
      sessionStorage.removeItem("activeAdmissionId");
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
  const handlePhotoUpload = (photoType, file) => {
    if (!file) {
      return;
    }

    setPhotos((prev) => {
      const next = prev.filter((item) => item.type !== photoType);
      next.push({ type: photoType, name: file.name, file });
      return next;
    });
  };

  const handleDocumentUpload = (docType, file) => {
    if (!file) {
      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [docType]: { name: file.name, file },
    }));
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
                  id="student_first_name"
                  className="form-input"
                  style={
                    invalidFields.student_first_name
                      ? { borderColor: "var(--red)" }
                      : undefined
                  }
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
                  id="student_last_name"
                  className="form-input"
                  style={
                    invalidFields.student_last_name
                      ? { borderColor: "var(--red)" }
                      : undefined
                  }
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
                  id="student_date_of_birth"
                  className="form-input"
                  type="date"
                  max={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 4),
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                  style={
                    invalidFields.student_date_of_birth
                      ? { borderColor: "var(--red)" }
                      : undefined
                  }
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
                  id="student_gender"
                  className="form-select"
                  style={
                    invalidFields.student_gender
                      ? { borderColor: "var(--red)" }
                      : undefined
                  }
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
          applicationId={appId || applicationId}
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
                  Desired Class <span className="req">*</span>
                </label>
                <select
                  id="academic_desired_class"
                  className="form-select"
                  style={
                    invalidFields.academic_desired_class
                      ? { borderColor: "var(--red)" }
                      : undefined
                  }
                  value={academicForm.desired_class}
                  onChange={(e) =>
                    setAcademicForm((p) => ({
                      ...p,
                      desired_class: e.target.value,
                    }))
                  }
                >
                  <option value="">Select desired class</option>
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Board Name</label>
                <select
                  className="form-select"
                  value={academicForm.board_name}
                  onChange={(e) =>
                    setAcademicForm((p) => ({
                      ...p,
                      board_name: e.target.value,
                    }))
                  }
                >
                  {BOARD_OPTIONS.map((board) => (
                    <option key={board} value={board}>
                      {board}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">Previous School</label>
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
                <label className="form-label">Previous Class</label>
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
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Marks Percentage (0-100)</label>
              <input
                id="academic_marks_percentage"
                className="form-input"
                style={
                  invalidFields.academic_marks_percentage
                    ? { borderColor: "var(--red)" }
                    : undefined
                }
                placeholder="e.g. 86.5"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={academicForm.marks_percentage}
                onChange={(e) =>
                  setAcademicForm((p) => ({
                    ...p,
                    marks_percentage: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Academic Year</label>
              <input
                className="form-input"
                placeholder="e.g. 2026-27"
                value={academicForm.academic_year}
                onChange={(e) =>
                  setAcademicForm((p) => ({
                    ...p,
                    academic_year: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Additional Qualifications</label>
              <textarea
                className="form-input"
                style={{ height: 80, resize: "vertical" }}
                placeholder="Mention certifications, language courses, etc."
                value={academicForm.additional_qualifications}
                onChange={(e) =>
                  setAcademicForm((p) => ({
                    ...p,
                    additional_qualifications: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Extracurricular Activities</label>
              <textarea
                className="form-input"
                style={{ height: 80, resize: "vertical" }}
                placeholder="Sports, arts, clubs, competitions..."
                onChange={(e) =>
                  setAcademicForm((p) => ({
                    ...p,
                    extracurricular_activities: e.target.value,
                  }))
                }
                value={academicForm.extracurricular_activities}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Achievements</label>
              <textarea
                className="form-input"
                style={{ height: 80, resize: "vertical" }}
                placeholder="Academic, sports, or other notable achievements..."
                value={academicForm.achievements}
                onChange={(e) =>
                  setAcademicForm((p) => ({
                    ...p,
                    achievements: e.target.value,
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
              <label className="form-label">
                Student Photo <span className="req">*</span>
              </label>
              <input
                id="photo_student_photo"
                type="file"
                className="form-input"
                accept="image/*"
                onChange={(e) =>
                  handlePhotoUpload("student_photo", e.target.files?.[0])
                }
              />
              <div
                style={{ marginTop: 6, fontSize: 12, color: "var(--gray-500)" }}
              >
                {photos.find((p) => p.type === "student_photo")?.name ||
                  "No file selected"}
              </div>
            </div>

            <div className="form-group mb-2">
              <label className="form-label">Passport Photos</label>
              <input
                id="photo_passport_photos"
                type="file"
                className="form-input"
                accept="image/*"
                onChange={(e) =>
                  handlePhotoUpload("passport_photos", e.target.files?.[0])
                }
              />
              <div
                style={{ marginTop: 6, fontSize: 12, color: "var(--gray-500)" }}
              >
                {photos.find((p) => p.type === "passport_photos")?.name ||
                  "Optional"}
              </div>
            </div>

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
            {[
              { key: "birth_certificate", label: "Birth Certificate" },
              { key: "aadhaar_card", label: "Aadhaar Card" },
              { key: "passport_photos", label: "Passport Photos" },
              { key: "transfer_certificate", label: "Transfer Certificate" },
              { key: "previous_report_card", label: "Previous Report Card" },
              { key: "address_proof", label: "Address Proof" },
              { key: "parent_id_proof", label: "Parent ID Proof" },
            ].map((doc) => (
              <div className="form-group mb-3" key={doc.key}>
                <label className="form-label">
                  {doc.label} <span className="req">*</span>
                </label>
                <input
                  id={`document_${doc.key}`}
                  type="file"
                  className="form-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleDocumentUpload(doc.key, e.target.files?.[0])
                  }
                />
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "var(--gray-500)",
                  }}
                >
                  {documents[doc.key]?.name || "No file selected"}
                </div>
              </div>
            ))}

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
                      {Object.keys(documents).length} file(s)
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 12,
                    color: "var(--gray-600)",
                  }}
                >
                  <div>
                    Student: {studentForm.first_name || "-"}{" "}
                    {studentForm.last_name || "-"}
                  </div>
                  <div>
                    Parent Contact:{" "}
                    {details?.parent_info?.phone ||
                      details?.parent_info?.primary_contact_phone ||
                      "-"}
                  </div>
                  <div>Desired Class: {academicForm.desired_class || "-"}</div>
                  <div>
                    Marks Percentage: {academicForm.marks_percentage || "-"}
                  </div>
                  <div>Current Step: {progress?.current_step || step}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6" style={{ gap: 12 }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={handlePrevStep}
          disabled={step === 1 || saving}
        >
          <ArrowLeft size={14} /> Previous
        </button>

        {step !== 2 ? (
          <button
            type="button"
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
