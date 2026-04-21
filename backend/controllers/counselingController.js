/**
 * controllers/counselingController.js
 * Business logic and request/response handling for Counseling Workspace
 * All database operations delegated to counselingQueries
 * All file operations delegated to applicationService
 */

import * as counselingQueries from '../db/queries/counselingQueries.js';
import * as leadsQueries from '../db/queries/leadsQueries.js';
import pool from '../config/db.js';

/**
 * GET /api/counseling/stats
 * Get dashboard statistics for authenticated counselor
 * Returns: assignedLeads, upcomingVisits, pendingTasks
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { school_id } = req.user;
    const counselorId = req.user.id;

    const stats = await counselingQueries.getDashboardStats(school_id, counselorId);

    return res.json({
      success: true,
      data: {
        assignedLeads: stats.assignedLeads || 0,
        upcomingVisits: stats.upcomingVisits || 0,
        pendingTasks: stats.pendingTasks || 0,
      },
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
};

/**
 * GET /api/counseling/visits
 * Get all campus visits for the counselor
 * Query params: filterToday=true (optional, returns only today's visits)
 * Returns: Array of visit objects with lead information
 */
export const getVisits = async (req, res) => {
  try {
    const { school_id } = req.user;
    const counselorId = req.user.id;
    const filterToday = req.query.filterToday === 'true';

    const visits = await counselingQueries.getVisitsForCounselor(
      school_id,
      counselorId,
      filterToday
    );

    return res.json({
      success: true,
      data: visits || [],
    });
  } catch (error) {
    console.error('Error in getVisits:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch visits',
      error: error.message,
    });
  }
};

/**
 * GET /api/counseling/leads/search
 * Search assigned leads by name or lead ID
 * Query params: q=search_term (required, min 1 character)
 * Returns: Array of lead objects with student and parent information
 */
export const searchLeads = async (req, res) => {
  try {
    const { school_id } = req.user;
    const counselorId = req.user.id;
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query (q) is required',
      });
    }

    const leads = await counselingQueries.searchLeads(school_id, counselorId, q);

    return res.json({
      success: true,
      data: leads || [],
    });
  } catch (error) {
    console.error('Error in searchLeads:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search leads',
      error: error.message,
    });
  }
};

/**
 * POST /api/campus-visits
 * Create a new campus visit
 * Body: { lead_id, student_name, grade, visit_date, visit_time, notes (optional) }
 * Constraint: Counselor can't have multiple visits at the same time slot
 * Returns: Created visit object
 */
export const createCampusVisit = async (req, res) => {
  try {
    const { school_id } = req.user;
    const counselorId = req.user.id;
    const { lead_id, student_name, grade, visit_date, visit_time, notes } = req.body;

    // Validate required fields
    if (!lead_id || !student_name || !grade || !visit_date || !visit_time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: lead_id, student_name, grade, visit_date, visit_time',
      });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(visit_date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid visit_date format. Use YYYY-MM-DD',
      });
    }

    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(visit_time)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid visit_time format. Use HH:MM',
      });
    }

    // Validate that the visit date is not in the past
    const visitDateTime = new Date(`${visit_date}T${visit_time}`);
    if (visitDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule visits in the past',
      });
    }

    // Verify the lead belongs to this counselor
    const leadResult = await pool.query(
      'SELECT id FROM lead WHERE id = $1 AND school_id = $2 AND assigned_to = $3',
      [lead_id, school_id, counselorId]
    );

    if (leadResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Lead not found or not assigned to you',
      });
    }

    const visit = await counselingQueries.createCampusVisit({
      school_id,
      lead_id,
      counselor_id: counselorId,
      student_name,
      grade,
      visit_date,
      visit_time,
      notes: notes || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Campus visit created successfully',
      data: visit,
    });
  } catch (error) {
    console.error('Error in createCampusVisit:', error);

    // Handle double-booking error
    if (error.code === 'DOUBLE_BOOKING') {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create campus visit',
      error: error.message,
    });
  }
};

/**
 * GET /api/campus-visits/:id
 * Get a single campus visit by ID
 * Returns: Visit object with lead information
 */
export const getCampusVisit = async (req, res) => {
  try {
    const { school_id } = req.user;
    const counselorId = req.user.id;
    const { id } = req.params;

    const visit = await counselingQueries.getCampusVisitById(id, school_id, counselorId);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Campus visit not found',
      });
    }

    return res.json({
      success: true,
      data: visit,
    });
  } catch (error) {
    console.error('Error in getCampusVisit:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch campus visit',
      error: error.message,
    });
  }
};

/**
 * PUT /api/campus-visits/:id
 * Update a campus visit
 * Body: { student_name, grade, visit_date, visit_time, status, notes }
 * (Only provided fields will be updated)
 * Returns: Updated visit object
 */
export const updateCampusVisit = async (req, res) => {
  try {
    const { school_id } = req.user;
    const counselorId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Verify visit exists and belongs to this counselor
    const visit = await counselingQueries.getCampusVisitById(id, school_id, counselorId);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Campus visit not found',
      });
    }

    // Validate date and time if provided
    if (updates.visit_date && !/^\d{4}-\d{2}-\d{2}$/.test(updates.visit_date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid visit_date format. Use YYYY-MM-DD',
      });
    }

    if (updates.visit_time && !/^\d{2}:\d{2}$/.test(updates.visit_time)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid visit_time format. Use HH:MM',
      });
    }

    const updatedVisit = await counselingQueries.updateCampusVisit(
      id,
      school_id,
      counselorId,
      updates
    );

    return res.json({
      success: true,
      message: 'Campus visit updated successfully',
      data: updatedVisit,
    });
  } catch (error) {
    console.error('Error in updateCampusVisit:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update campus visit',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/campus-visits/:id
 * Delete a campus visit (soft delete via status = 'cancelled')
 * Returns: { success: true, message }
 */
export const deleteCampusVisit = async (req, res) => {
  try {
    const { school_id } = req.user;
    const counselorId = req.user.id;
    const { id } = req.params;

    // Verify visit exists and belongs to this counselor
    const visit = await counselingQueries.getCampusVisitById(id, school_id, counselorId);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Campus visit not found',
      });
    }

    await counselingQueries.deleteCampusVisit(id, school_id, counselorId);

    return res.json({
      success: true,
      message: 'Campus visit cancelled successfully',
    });
  } catch (error) {
    console.error('Error in deleteCampusVisit:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete campus visit',
      error: error.message,
    });
  }
};
