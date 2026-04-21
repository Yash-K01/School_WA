/**
 * CounselingService.js
 * Frontend API client for Counseling Workspace
 * Handles all HTTP communication with backend counseling endpoints
 */

import API_BASE_URL from '../constants/api';

class CounselingService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
  }

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} { success, data: { assignedLeads, upcomingVisits, pendingTasks } }
   */
  async getDashboardStats() {
    try {
      const response = await fetch(`${this.baseURL}/counseling/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching visits:', error);
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

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching leads:', error);
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

      const response = await fetch(`${this.baseURL}/campus-visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(visitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating campus visit:', error);
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
      const response = await fetch(`${this.baseURL}/campus-visits/${visitId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching campus visit:', error);
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
      const response = await fetch(`${this.baseURL}/campus-visits/${visitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating campus visit:', error);
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
      const response = await fetch(`${this.baseURL}/campus-visits/${visitId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error deleting campus visit:', error);
      throw error;
    }
  }
}

export default new CounselingService();
