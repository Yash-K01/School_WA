
/**
 * CounselingService.js
 * Frontend API client for Counseling Workspace
 * Handles all HTTP communication with backend counseling endpoints
 * Includes authentication, error handling, and 401 Unauthorized detection
 */

const TOKEN_KEY = 'token';

class CounselingService {
  constructor() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    this.baseURL = `${API_BASE_URL}/api`;
  }

  /**
   * Private helper: Make authenticated fetch request
   * Handles token retrieval, 401 errors, and error logging
   * @param {String} url - Full URL to fetch
   * @param {Object} options - Fetch options (method, body, etc.)
   * @returns {Promise<Response>} Fetch response
   */
  async authFetch(url, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);

    // Check if token exists
    if (!token) {
      console.error('❌ [AUTH ERROR] No authentication token found. Key:', TOKEN_KEY);
      const error = new Error('No authentication token. Please log in.');
      error.code = 'NO_TOKEN';
      error.status = 401;
      throw error;
    }

    // Build headers with Authorization
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    try {
      console.log(`🔐 [API] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error('❌ [AUTH ERROR] 401 Unauthorized - Token expired or invalid');
        console.log('📋 Response:', await response.clone().json().catch(() => ({})));
        
        // Clear invalid token
        localStorage.removeItem(TOKEN_KEY);
        
        const error = new Error('Authentication failed. Please log in again.');
        error.code = 'UNAUTHORIZED';
        error.status = 401;
        throw error;
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorData = await response.clone().json().catch(() => ({}));
        console.error(`❌ [API ERROR] HTTP ${response.status}:`, errorData.message || response.statusText);
        const error = new Error(errorData.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return response;
    } catch (error) {
      // Handle network errors
      if (error.message === 'Failed to fetch' || error instanceof TypeError) {
        console.error('❌ [NETWORK ERROR] Cannot reach API server at', url);
        error.code = 'NETWORK_ERROR';
      }
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} { success, data: { assignedLeads, upcomingVisits, pendingTasks } }
   */
  async getDashboardStats() {
    try {
      const response = await this.authFetch(`${this.baseURL}/counseling/stats`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error.message);
      throw error;
    }
  }

  /**
   * Get all campus visits for the counselor
   * @param {Boolean} filterToday - If true, only return today's visits
   * @returns {Promise<Object>} { success, data: Array<Visit> }
   */
  async getVisits(filterToday = false) {
    try {
      const url = new URL(`${this.baseURL}/counseling/visits`);
      if (filterToday) {
        url.searchParams.append('filterToday', 'true');
      }

      const response = await this.authFetch(url.toString(), {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching visits:', error.message);
      throw error;
    }
  }

  /**
   * Search assigned leads by name or lead ID
   * @param {String} query - Search term (name or lead ID)
   * @returns {Promise<Object>} { success, data: Array<Lead> }
   */
  async searchLeads(query) {
    try {
      if (!query || query.trim() === '') {
        return { success: true, data: [] };
      }

      const url = new URL(`${this.baseURL}/counseling/leads/search`);
      url.searchParams.append('q', query);

      const response = await this.authFetch(url.toString(), {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      console.error('Error searching leads:', error.message);
      throw error;
    }
  }

  /**
   * Create a new campus visit
   * @param {Object} visitData - { lead_id, student_name, grade, visit_date, visit_time, notes (optional) }
   * @returns {Promise<Object>} { success, data: CreatedVisit, message }
   */
  async createCampusVisit(visitData) {
    try {
      const requiredFields = ['lead_id', 'student_name', 'grade', 'visit_date', 'visit_time'];
      const missingFields = requiredFields.filter((field) => !(field in visitData));

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const response = await this.authFetch(`${this.baseURL}/campus-visits`, {
        method: 'POST',
        body: JSON.stringify(visitData),
      });

      return await response.json();
    } catch (error) {
      console.error('Error creating campus visit:', error.message);
      throw error;
    }
  }

  /**
   * Get a single campus visit by ID
   * @param {Number} visitId - Visit ID
   * @returns {Promise<Object>} { success, data: Visit }
   */
  async getCampusVisit(visitId) {
    try {
      const response = await this.authFetch(`${this.baseURL}/campus-visits/${visitId}`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching campus visit:', error.message);
      throw error;
    }
  }

  /**
   * Update a campus visit
   * @param {Number} visitId - Visit ID
   * @param {Object} updates - Fields to update { student_name, grade, visit_date, visit_time, status, notes }
   * @returns {Promise<Object>} { success, data: UpdatedVisit, message }
   */
  async updateCampusVisit(visitId, updates) {
    try {
      const response = await this.authFetch(`${this.baseURL}/campus-visits/${visitId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      return await response.json();
    } catch (error) {
      console.error('Error updating campus visit:', error.message);
      throw error;
    }
  }

  /**
   * Delete (cancel) a campus visit
   * @param {Number} visitId - Visit ID
   * @returns {Promise<Object>} { success, message }
   */
  async deleteCampusVisit(visitId) {
    try {
      const response = await this.authFetch(`${this.baseURL}/campus-visits/${visitId}`, {
        method: 'DELETE',
      });

      return await response.json();
    } catch (error) {
      console.error('Error deleting campus visit:', error.message);
      throw error;
    }
  }
}

export default new CounselingService();
