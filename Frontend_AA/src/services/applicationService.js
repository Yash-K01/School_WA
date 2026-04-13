import { getAuthHeader } from '../utils/authToken.js';

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

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: getAuthHeader(),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`);
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

  const currentStepKey = data?.data?.current_step || 'student';
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
  return request(`${BASE_URL}/save-step`, {
    method: 'POST',
    body: JSON.stringify({
      admission_id: applicationId,
      step: 'student',
      data: studentData,
    }),
  });
}

/**
 * Save parent info (Step 2)
 */
export async function saveParentInfo(applicationId, parentData) {
  return request(`${BASE_URL}/save-step`, {
    method: 'POST',
    body: JSON.stringify({
      admission_id: applicationId,
      step: 'parent',
      data: parentData,
    }),
  });
}

/**
 * Save academic info (Step 3)
 */
export async function saveAcademicInfo(applicationId, academicData) {
  return request(`${BASE_URL}/save-step`, {
    method: 'POST',
    body: JSON.stringify({
      admission_id: applicationId,
      step: 'academic',
      data: academicData,
    }),
  });
}

/**
 * Save documents (Step 5)
 */
export async function saveDocuments(applicationId, documents) {
  return request(`${BASE_URL}/save-step`, {
    method: 'POST',
    body: JSON.stringify({
      admission_id: applicationId,
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
