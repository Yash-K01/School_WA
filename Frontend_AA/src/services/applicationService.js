import { getAuthHeader } from '../utils/authToken.js';

const BASE_URL = '/api/applications';

/**
 * Create a new application from a lead
 */
export async function createApplicationFromLead(leadId, academicYearId) {
  try {
    console.log('📝 Creating new application...');
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ lead_id: leadId, academic_year_id: academicYearId })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to create application');
    }

    console.log('✅ Application created:', data.data);
    return data.data;
  } catch (error) {
    console.error('❌ Error creating application:', error);
    throw error;
  }
}

/**
 * Get application progress and step status
 */
export async function getApplicationProgress(applicationId) {
  try {
    console.log(`📊 Fetching progress for application ${applicationId}...`);
    const response = await fetch(`${BASE_URL}/${applicationId}/progress`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch progress');
    }

    console.log('✅ Progress fetched:', data.data);
    return data.data;
  } catch (error) {
    console.error('❌ Error fetching progress:', error);
    throw error;
  }
}

/**
 * Get application details for prefill
 */
export async function getApplicationDetails(applicationId) {
  try {
    console.log(`📋 Fetching application details ${applicationId}...`);
    const response = await fetch(`${BASE_URL}/${applicationId}/details`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch details');
    }

    console.log('✅ Details fetched:', data.data);
    return data.data;
  } catch (error) {
    console.error('❌ Error fetching details:', error);
    throw error;
  }
}

/**
 * Save student info (Step 1)
 */
export async function saveStudentInfo(applicationId, studentData) {
  try {
    console.log('💾 Saving student info...');
    const response = await fetch(`${BASE_URL}/${applicationId}/student-info`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(studentData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to save student info');
    }

    console.log('✅ Student info saved');
    return data;
  } catch (error) {
    console.error('❌ Error saving student info:', error);
    throw error;
  }
}

/**
 * Save parent info (Step 2)
 */
export async function saveParentInfo(applicationId, parentData) {
  try {
    console.log('💾 Saving parent info...');
    const response = await fetch(`${BASE_URL}/${applicationId}/parent-info`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(parentData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to save parent info');
    }

    console.log('✅ Parent info saved');
    return data;
  } catch (error) {
    console.error('❌ Error saving parent info:', error);
    throw error;
  }
}

/**
 * Save academic info (Step 3)
 */
export async function saveAcademicInfo(applicationId, academicData) {
  try {
    console.log('💾 Saving academic info...');
    const response = await fetch(`${BASE_URL}/${applicationId}/academic-info`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(academicData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to save academic info');
    }

    console.log('✅ Academic info saved');
    return data;
  } catch (error) {
    console.error('❌ Error saving academic info:', error);
    throw error;
  }
}

/**
 * Save documents (Step 5)
 */
export async function saveDocuments(applicationId, documents) {
  try {
    console.log('💾 Saving documents...');
    const response = await fetch(`${BASE_URL}/${applicationId}/documents`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ documents })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to save documents');
    }

    console.log('✅ Documents saved');
    return data;
  } catch (error) {
    console.error('❌ Error saving documents:', error);
    throw error;
  }
}

/**
 * Submit application (Step 6 - Final)
 */
export async function submitApplication(applicationId) {
  try {
    console.log('🚀 Submitting application...');
    const response = await fetch(`${BASE_URL}/${applicationId}/submit`, {
      method: 'POST',
      headers: getAuthHeader()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to submit application');
    }

    console.log('✅ Application submitted successfully!');
    return data;
  } catch (error) {
    console.error('❌ Error submitting application:', error);
    throw error;
  }
}
