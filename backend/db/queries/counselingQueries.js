/**
 * db/queries/counselingQueries.js
 * SQL execution functions for Counseling Workspace management
 * Uses parameterized queries to prevent SQL injection
 * All functions operate at the database level with no business logic
 */

import pool from '../pool.js';

/**
 * getDashboardStats(schoolId, counselorId)
 * Get dashboard statistics: assigned leads count, upcoming visits, pending tasks
 * Uses Promise.all() for parallel execution
 * @param {Number} schoolId - School ID
 * @param {Number} counselorId - Counselor user ID
 * @returns {Promise<Object>} { assignedLeads, upcomingVisits, pendingTasks }
 */
export const getDashboardStats = async (schoolId, counselorId) => {
  try {
    // Execute all three queries in parallel
    const [leadsResult, visitsResult, tasksResult] = await Promise.all([
      // Count assigned leads for this counselor
      pool.query(
        'SELECT COUNT(*) as count FROM lead WHERE school_id = $1 AND assigned_to = $2',
        [schoolId, counselorId]
      ),
      // Count upcoming visits (today and future) using idx_campus_visit_dashboard index
      pool.query(
        `SELECT COUNT(*) as count FROM campus_visit 
         WHERE school_id = $1 AND counselor_id = $2 AND visit_date >= CURRENT_DATE 
         ORDER BY visit_date ASC`,
        [schoolId, counselorId]
      ),
      // Count pending tasks (not completed)
      pool.query(
        `SELECT COUNT(*) as count FROM task 
         WHERE school_id = $1 AND assigned_to = $2 AND status != 'completed'`,
        [schoolId, counselorId]
      ),
    ]);

    return {
      assignedLeads: parseInt(leadsResult.rows[0].count, 10),
      upcomingVisits: parseInt(visitsResult.rows[0].count, 10),
      pendingTasks: parseInt(tasksResult.rows[0].count, 10),
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    throw error;
  }
};

/**
 * getVisitsForCounselor(schoolId, counselorId, filterToday = false)
 * Fetch all campus visits for the counselor
 * Uses idx_campus_visit_dashboard index for performance
 * @param {Number} schoolId - School ID
 * @param {Number} counselorId - Counselor user ID
 * @param {Boolean} filterToday - If true, only return today's visits
 * @returns {Promise<Array>} Array of visit records with lead and student info
 */
export const getVisitsForCounselor = async (schoolId, counselorId, filterToday = false) => {
  let sql = `
    SELECT 
      cv.id,
      cv.lead_id,
      cv.student_name,
      cv.grade,
      cv.visit_date,
      cv.visit_time,
      cv.status,
      cv.notes,
      l.first_name,
      l.last_name,
      l.phone,
      l.email,
      l.desired_class
    FROM campus_visit cv
    LEFT JOIN lead l ON cv.lead_id = l.id
    WHERE cv.school_id = $1 AND cv.counselor_id = $2
  `;

  const params = [schoolId, counselorId];

  if (filterToday) {
    sql += ` AND DATE(cv.visit_date) = CURRENT_DATE`;
  }

  sql += ` ORDER BY cv.visit_date ASC, cv.visit_time ASC`;

  const result = await pool.query(sql, params);
  return result.rows;
};

/**
 * searchLeads(schoolId, counselorId, query)
 * Search leads by name or lead number (lead ID)
 * Returns lead_id, student_name, parent_name, phone
 * @param {Number} schoolId - School ID
 * @param {Number} counselorId - Counselor user ID (for assigned leads)
 * @param {String} query - Search term (name or lead ID)
 * @returns {Promise<Array>} Array of matching leads
 */
export const searchLeads = async (schoolId, counselorId, query) => {
  if (!query || query.trim() === '') {
    return [];
  }

  const searchTerm = `%${query}%`;
  const isNumeric = /^\d+$/.test(query.trim());

  let sql = `
    SELECT 
      l.id as lead_id,
      CONCAT(COALESCE(l.first_name, ''), ' ', COALESCE(l.last_name, '')) as student_name,
      l.phone,
      l.email,
      l.desired_class,
      pd.parent_name,
      pd.parent_phone,
      l.follow_up_status,
      l.created_at
    FROM lead l
    LEFT JOIN parent_detail pd ON l.id = pd.lead_id
    WHERE l.school_id = $1 AND l.assigned_to = $2
  `;

  const params = [schoolId, counselorId];

  if (isNumeric) {
    // Search by lead ID
    sql += ` AND l.id = $3`;
    params.push(parseInt(query, 10));
  } else {
    // Search by name
    sql += ` AND (
      l.first_name ILIKE $3
      OR l.last_name ILIKE $3
      OR CONCAT(COALESCE(l.first_name, ''), ' ', COALESCE(l.last_name, '')) ILIKE $3
      OR pd.parent_name ILIKE $3
    )`;
    params.push(searchTerm);
  }

  sql += ` ORDER BY l.created_at DESC LIMIT 20`;

  const result = await pool.query(sql, params);
  return result.rows;
};

/**
 * createCampusVisit(data)
 * Create a new campus visit with unique_counselor_slot constraint check
 * Constraint: One counselor can't have multiple visits at the same time
 * @param {Object} data - Visit data { school_id, lead_id, counselor_id, student_name, grade, 
 *                        visit_date, visit_time, notes }
 * @returns {Promise<Object>} The newly created visit record
 */
export const createCampusVisit = async (data) => {
  const {
    school_id,
    lead_id,
    counselor_id,
    student_name,
    grade,
    visit_date,
    visit_time,
    notes,
  } = data;

  // Check for double-booking: counselor already has a visit at this time
  const checkSql = `
    SELECT id FROM campus_visit
    WHERE school_id = $1 
      AND counselor_id = $2 
      AND DATE(visit_date) = $3 
      AND visit_time = $4
      AND status NOT IN ('cancelled', 'no_show')
    LIMIT 1
  `;

  const checkResult = await pool.query(checkSql, [
    school_id,
    counselor_id,
    visit_date,
    visit_time,
  ]);

  if (checkResult.rows.length > 0) {
    const error = new Error('Counselor is already booked for this time slot');
    error.code = 'DOUBLE_BOOKING';
    throw error;
  }

  // Insert new visit
  const insertSql = `
    INSERT INTO campus_visit (
      school_id, lead_id, counselor_id, student_name, grade, 
      visit_date, visit_time, status, notes, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *;
  `;

  const result = await pool.query(insertSql, [
    school_id,
    lead_id,
    counselor_id,
    student_name,
    grade,
    visit_date,
    visit_time,
    'scheduled',
    notes,
  ]);

  return result.rows[0];
};

/**
 * getCampusVisitById(id, schoolId, counselorId)
 * Get a single campus visit by ID
 * @param {Number} id - Visit ID
 * @param {Number} schoolId - School ID
 * @param {Number} counselorId - Counselor ID (for authorization)
 * @returns {Promise<Object|undefined>} Visit record or undefined if not found
 */
export const getCampusVisitById = async (id, schoolId, counselorId) => {
  const sql = `
    SELECT * FROM campus_visit 
    WHERE id = $1 AND school_id = $2 AND counselor_id = $3
  `;

  const result = await pool.query(sql, [id, schoolId, counselorId]);
  return result.rows[0];
};

/**
 * updateCampusVisit(id, schoolId, counselorId, updates)
 * Update a campus visit
 * @param {Number} id - Visit ID
 * @param {Number} schoolId - School ID
 * @param {Number} counselorId - Counselor ID
 * @param {Object} updates - Fields to update { student_name, grade, visit_date, visit_time, status, notes }
 * @returns {Promise<Object>} Updated visit record
 */
export const updateCampusVisit = async (id, schoolId, counselorId, updates) => {
  const allowedFields = ['student_name', 'grade', 'visit_date', 'visit_time', 'status', 'notes'];
  const updateFields = [];
  const params = [id, schoolId, counselorId];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      params.push(value);
      updateFields.push(`${key} = $${params.length}`);
    }
  }

  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }

  const sql = `
    UPDATE campus_visit
    SET ${updateFields.join(', ')}, updated_at = NOW()
    WHERE id = $1 AND school_id = $2 AND counselor_id = $3
    RETURNING *;
  `;

  const result = await pool.query(sql, params);
  return result.rows[0];
};

/**
 * deleteCampusVisit(id, schoolId, counselorId)
 * Delete a campus visit (soft delete via status)
 * @param {Number} id - Visit ID
 * @param {Number} schoolId - School ID
 * @param {Number} counselorId - Counselor ID
 * @returns {Promise<void>}
 */
export const deleteCampusVisit = async (id, schoolId, counselorId) => {
  const sql = `
    UPDATE campus_visit
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = $1 AND school_id = $2 AND counselor_id = $3
  `;

  await pool.query(sql, [id, schoolId, counselorId]);
};
