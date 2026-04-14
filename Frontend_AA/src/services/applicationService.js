import { getAuthHeader, getUserData } from '../utils/authToken.js';

const BASE_URL = '/api/admission';

const STEP_TO_NUMBER = {
  student: 1,
  parent: 2,
  academic: 3,
  documents: 5,
  review: 6,
};

const NUMBER_TO_STEP = {
  1: 'student',
  2: 'parent',
  3: 'academic',
  4: 'documents',
  5: 'documents',
  6: 'review',
};

const resolveAdmissionId = (candidateId) => {
  if (candidateId !== undefined && candidateId !== null && String(candidateId).trim() !== '') {
    return Number(candidateId);
  }

  const storedId = sessionStorage.getItem('activeAdmissionId');
  if (storedId && storedId.trim() !== '') {
    return Number(storedId);
  }

  return null;
};

const request = async (url, options = {}) => {
  const authHeaders = getAuthHeader() || {};
  const mergedHeaders = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const serverMessage = data?.message || data?.error;
    throw new Error(serverMessage || `HTTP ${response.status}: ${response.statusText}`);
  }

  return data;
};

/**
 * Create a new application from a lead
 */
export async function createApplicationFromLead(leadId, academicYearId) {
  const data = await request(`${BASE_URL}/start`, {
    method: 'POST',
    body: JSON.stringify({ lead_id: leadId, academic_year_id: academicYearId }),
  });

  return {
    id: data.data.admission_id,
    admission_id: data.data.admission_id,
    current_step: STEP_TO_NUMBER[data.data.current_step] || 1,
    status: data.data.status,
    resumed: Boolean(data.data.resumed),
  };
}

/**
 * Get application progress and step status
 */
export async function getApplicationProgress(applicationId) {
  const data = await request(`${BASE_URL}/${applicationId}`, {
    method: 'GET',
  });

  const currentStepKey = data?.data?.admission?.current_step || data?.data?.current_step || 'student';
  const currentStep = STEP_TO_NUMBER[currentStepKey] || 1;

  return {
    current_step: currentStep,
    current_step_key: currentStepKey,
    status: data?.data?.admission?.status,
    steps: {
      student_info: currentStep > 1 ? 'completed' : 'pending',
      parent_info: currentStep > 2 ? 'completed' : 'pending',
      academic_info: currentStep > 3 ? 'completed' : 'pending',
      photos: currentStep > 4 ? 'completed' : 'pending',
      documents: currentStep > 5 ? 'completed' : 'pending',
      review: data?.data?.admission?.is_completed ? 'completed' : 'pending',
    },
  };
}

/**
 * Get application details for prefill
 */
export async function getApplicationDetails(applicationId) {
  const data = await request(`${BASE_URL}/${applicationId}`, {
    method: 'GET',
  });

  return {
    application: data.data.admission,
    student_info: data.data.student || {},
    parent_info: data.data.parent || {},
    academic_info: data.data.academic || {},
    photos: data.data.photos || {},
    documents: data.data.documents || {},
    current_step: data.data.current_step,
  };
}

/**
 * Save student info (Step 1)
 */
export async function saveStudentInfo(applicationId, studentData) {
  const admissionId = resolveAdmissionId(applicationId);
  if (!admissionId || Number.isNaN(admissionId)) {
    throw new Error('Admission ID is missing. Please restart the application flow from Create Application.');
  }

  return request(`${BASE_URL}/save-step`, {
    method: 'POST',
    body: JSON.stringify({
      admission_id: admissionId,
      step: 'student',
      data: studentData,
    }),
  });
}

/**
 * Save parent info (Step 2)
 */
export async function saveParentInfo(applicationId, parentData) {
  const admissionId = resolveAdmissionId(applicationId);
  if (!admissionId || Number.isNaN(admissionId)) {
    throw new Error('Admission ID is missing. Please restart the application flow from Create Application.');
  }

  return request(`${BASE_URL}/save-step`, {
    method: 'POST',
    body: JSON.stringify({
      admission_id: admissionId,
      step: 'parent',
      data: parentData,
    }),
  });
}

/**
 * Save academic info (Step 3)
 */
export async function saveAcademicInfo(applicationId, academicData) {
  const resolvedApplicationId = Number(academicData?.application_id ?? resolveAdmissionId(applicationId));
  if (!resolvedApplicationId || Number.isNaN(resolvedApplicationId)) {
    throw new Error('Application ID is missing. Please restart the application flow from Create Application.');
  }

  const userData = getUserData() || {};
  const resolvedSchoolId = Number(academicData?.school_id ?? userData.school_id);
  if (!resolvedSchoolId || Number.isNaN(resolvedSchoolId)) {
    throw new Error('School ID is missing from session. Please login again and retry.');
  }

  const payload = {
    application_id: resolvedApplicationId,
    school_id: resolvedSchoolId,
    desired_class: academicData?.desired_class || '',
    previous_school: academicData?.previous_school || null,
    previous_class: academicData?.previous_class || null,
    marks_percentage: academicData?.marks_percentage === '' ? null : academicData?.marks_percentage ?? null,
    board_name: academicData?.board_name || null,
    academic_year: academicData?.academic_year || null,
    additional_qualifications: academicData?.additional_qualifications || null,
    extracurricular_activities: academicData?.extracurricular_activities || null,
    achievements: academicData?.achievements || null,
  };

  return request(`/api/applications/${resolvedApplicationId}/academic-info`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Save documents (Step 5)
 */
export async function saveDocuments(applicationId, documents) {
  const admissionId = resolveAdmissionId(applicationId);
  if (!admissionId || Number.isNaN(admissionId)) {
    throw new Error('Admission ID is missing. Please restart the application flow from Create Application.');
  }

  return request(`${BASE_URL}/save-step`, {
    method: 'POST',
    body: JSON.stringify({
      admission_id: admissionId,
      step: 'documents',
      data: documents,
    }),
  });
}

/**
 * Submit application (Step 6 - Final)
 */
export async function submitApplication(applicationId) {
  return request(`${BASE_URL}/complete`, {
    method: 'POST',
    body: JSON.stringify({ admission_id: applicationId }),
  });
}

export function mapStepNumberToKey(stepNumber) {
  return NUMBER_TO_STEP[stepNumber] || 'student';
}
