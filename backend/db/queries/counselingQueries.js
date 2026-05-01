/**
 * db/queries/counselingQueries.js
 * SQL execution functions for Counseling Workspace management
 * Uses parameterized queries to prevent SQL injection
 * All functions operate at the database level with no business logic
 */

import pool from '../pool.js';

const assignedLeadMatchSql = `
  EXISTS (
    SELECT 1
    FROM app_user u
    WHERE u.id = $2
      AND u.school_id = $1
      AND (
        l.assigned_to = u.id::text
        OR LOWER(TRIM(COALESCE(l.assigned_to, ''))) = LOWER(TRIM(COALESCE(u.name, '')))
      )
  )
`;

const safeCountQuery = async (label, sql, params) => {
  try {
    console.log(`Executing query (${label}):`, sql, params);
    const result = await pool.query(sql, params);
    return result?.rows?.[0]?.count ? Number.parseInt(result.rows[0].count, 10) : 0;
  } catch (error) {
    console.error(`${label} query failed:`, error.message);
    return 0;
  }
};

/**
 * getDashboardStats(schoolId, counselorId)
 * Get dashboard statistics: assigned leads count, upcoming visits, pending tasks
 * Uses Promise.all() for parallel execution
 * @param {Number} schoolId - School ID
 * @param {Number} counselorId - Counselor user ID
 * @returns {Promise<Object>} { assignedLeads: 0, upcomingVisits: 0, pendingTasks: 0 }
 */
export const getDashboardStats = async (schoolId, counselorId) => {
  try {
    // Validate inputs
    if (!schoolId || !counselorId) {
      console.warn('getDashboardStats: Missing schoolId or counselorId');
      return { assignedLeads: 0, upcomingVisits: 0, pendingTasks: 0 };
    }

    const [assignedLeads, upcomingVisits, pendingTasks] = await Promise.all([
      safeCountQuery(
        'leads count',
        `SELECT COUNT(*) as count FROM lead l WHERE l.school_id = $1 AND ${assignedLeadMatchSql}`,
        [schoolId, counselorId]
      ),
      safeCountQuery(
        'upcoming visits',
        'SELECT COUNT(*) as count FROM campus_visit WHERE school_id = $1 AND assigned_to = $2 AND visit_date >= CURRENT_DATE',
        [schoolId, counselorId]
      ),
      safeCountQuery(
        'pending tasks',
        'SELECT COUNT(*) as count FROM task WHERE school_id = $1 AND assigned_to = $2 AND is_done = FALSE',
        [schoolId, counselorId]
      ),
    ]);

    return { assignedLeads, upcomingVisits, pendingTasks };
  } catch (error) {
    console.error('getDashboardStats Error:', error.message, error.stack);
    throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
  }
};

/**
 * getVisitsForCounselor(schoolId, counselorId, filterToday = false)
 * Fetch all campus visits for the counselor
 * @param {Number} schoolId - School ID
 * @param {Number} counselorId - Counselor user ID
 * @param {Boolean} filterToday - If true, only return today's visits
 * @returns {Promise<Array>} Array of visit records with lead and student info
 */
export const getVisitsForCounselor = async (schoolId, counselorId, filterToday = false) => {
  try {
    // Validate inputs
    if (!schoolId || !counselorId) {
      console.warn('getVisitsForCounselor: Missing schoolId or counselorId');
      return [];
    }

    let sql = `
      SELECT 
        cv.id,
        cv.lead_id,
        cv.student_name,
        cv.visitor_name,
        cv.visitor_phone,
        cv.visit_date,
        cv.start_time,
        cv.end_time,
        cv.status,
        cv.internal_notes,
        cv.tour_preferences,
        cv.grade,
        cv.number_of_visitors,
        cv.visit_type,
        l.first_name,
        l.last_name,
        l.phone,
        l.email,
        l.desired_class
      FROM campus_visit cv
      LEFT JOIN lead l ON cv.lead_id = l.id AND l.school_id = cv.school_id
      WHERE cv.school_id = $1 AND cv.assigned_to = $2
    `;

    const params = [schoolId, counselorId];

    if (filterToday) {
      sql += ` AND DATE(cv.visit_date) = CURRENT_DATE`;
    }

    sql += ` ORDER BY cv.visit_date ASC, cv.start_time ASC`;

    console.log('Executing query (visits for counselor):', sql, params);
    const result = await pool.query(sql, params);

    // Defensive check
    if (!result || !Array.isArray(result.rows)) {
      console.warn('getVisitsForCounselor: No rows returned');
      return [];
    }

    return result.rows;
  } catch (error) {
    console.error('getVisitsForCounselor Error:', error.message, error.stack);
    throw new Error(`Failed to fetch visits: ${error.message}`);
  }
};

/**
 * searchLeads(schoolId, counselorId, query)
 * Search leads by name or lead number (lead ID)
 * Returns lead_id, student_name, parent_name, phone
 * CRITICAL: Prevent crash from undefined query
 * @param {Number} schoolId - School ID
 * @param {Number} counselorId - Counselor user ID (for assigned leads)
 * @param {String} query - Search term (name or lead ID)
 * @returns {Promise<Array>} Array of matching leads
 */
export const searchLeads = async (schoolId, counselorId, query) => {
  try {
    if (!schoolId || !counselorId) {
      console.warn('searchLeads: Missing schoolId or counselorId');
      return [];
    }

    const queryStr = String(query || '').trim();
    console.log('searchLeads: Incoming query:', { query, queryStr });

    const isNumeric = /^\d+$/.test(queryStr);
    if (queryStr.length > 0 && !isNumeric && queryStr.length < 2) {
      console.log('searchLeads: Query too short, returning empty array');
      return [];
    }

    const searchTerm = `%${queryStr}%`;

    let sql = `
      SELECT DISTINCT
        l.id as lead_id,
        CONCAT(COALESCE(l.first_name, ''), ' ', COALESCE(l.last_name, ''))::varchar as student_name,
        l.phone,
        l.email,
        l.desired_class,
        NULL::varchar as parent_name,
        NULL::varchar as parent_phone,
        l.follow_up_status,
        l.created_at
      FROM lead l
      LEFT JOIN campus_visit cv ON cv.lead_id = l.id AND cv.school_id = l.school_id
      WHERE l.school_id = $1 AND ${assignedLeadMatchSql}
    `;

    const params = [schoolId, counselorId];

    if (queryStr.length === 0) {
      console.log('searchLeads: Empty query, returning recent assigned leads');
    } else if (isNumeric) {
      sql += ` AND l.id = $3`;
      params.push(Number.parseInt(queryStr, 10));
      console.log('searchLeads: Searching by lead ID');
    } else {
      sql += ` AND (
        l.first_name ILIKE $3
        OR l.last_name ILIKE $3
        OR CONCAT(COALESCE(l.first_name, ''), ' ', COALESCE(l.last_name, '')) ILIKE $3
        OR l.phone ILIKE $3
        OR cv.visitor_name ILIKE $3
        OR cv.student_name ILIKE $3
      )`;
      params.push(searchTerm);
      console.log('searchLeads: Searching by name');
    }

    sql += ` ORDER BY l.created_at DESC LIMIT 20`;

    console.log('Executing query (search leads):', sql, params);
    const result = await pool.query(sql, params);

    if (!result || !Array.isArray(result.rows)) {
      console.warn('searchLeads: No rows returned');
      return [];
    }

    console.log(`searchLeads: Found ${result.rows.length} results`);
    return result.rows;
  } catch (error) {
    console.error('searchLeads Error:', error.message, error.stack);
    return [];
  }
};

/**
 * createCampusVisit(data)
 * Create a new campus visit with unique_counselor_slot constraint check
 * Constraint: One counselor can't have multiple visits at the same time
 * Validates all required fields before insert
 * @param {Object} data - Visit data { school_id, lead_id, assigned_to, visitor_name, visitor_phone,
 *                        student_name, grade, number_of_visitors, visit_date, start_time, end_time,
 *                        visit_type, internal_notes, tour_preferences }
 * @returns {Promise<Object>} The newly created visit record
 */
export const createCampusVisit = async (data) => {
  try {
    const {
      school_id,
      lead_id,
      assigned_to,
      visitor_name,
      visitor_phone,
      student_name,
      grade,
      number_of_visitors,
      visit_date,
      start_time,
      end_time,
      visit_type,
      internal_notes,
      tour_preferences,
    } = data;

    // CRITICAL: Validate required fields
    const missingFields = [];
    if (!school_id) missingFields.push('school_id');
    if (!assigned_to) missingFields.push('assigned_to');
    if (!visit_date) missingFields.push('visit_date');
    if (!start_time) missingFields.push('start_time');
    if (!visitor_name) missingFields.push('visitor_name');
    if (!visitor_phone) missingFields.push('visitor_phone');

    if (missingFields.length > 0) {
      const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
      error.code = 'MISSING_FIELDS';
      console.error('createCampusVisit Validation Error:', error.message);
      throw error;
    }

    console.log('createCampusVisit: Validating input data', {
      school_id,
      assigned_to,
      visit_date,
      start_time,
    });

    // Check for double-booking: counselor already has a visit at this time
    const checkSql = `
      SELECT id FROM campus_visit
      WHERE school_id = $1 
        AND assigned_to = $2 
        AND visit_date = $3 
        AND start_time = $4
        AND status NOT IN ('cancelled', 'no_show')
      LIMIT 1
    `;

    console.log('Executing query (check double-booking):', checkSql, [
      school_id,
      assigned_to,
      visit_date,
      start_time,
    ]);

    const checkResult = await pool.query(checkSql, [
      school_id,
      assigned_to,
      visit_date,
      start_time,
    ]);

    if (checkResult.rows && checkResult.rows.length > 0) {
      const error = new Error('Counselor is already booked for this time slot');
      error.code = 'DOUBLE_BOOKING';
      console.warn('createCampusVisit Warning:', error.message);
      throw error;
    }

    // Insert new visit
    const insertSql = `
      INSERT INTO campus_visit (
        school_id, lead_id, assigned_to, visitor_name, visitor_phone, student_name,
        grade, number_of_visitors, visit_date, start_time, end_time, visit_type,
        status, internal_notes, tour_preferences, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *
    `;

    const insertParams = [
      school_id,
      lead_id || null,
      assigned_to,
      visitor_name,
      visitor_phone,
      student_name || null,
      grade || null,
      number_of_visitors || 1,
      visit_date,
      start_time,
      end_time,
      visit_type || null,
      'scheduled',
      internal_notes || null,
      tour_preferences ? JSON.stringify(tour_preferences) : null,
    ];

    console.log('Executing query (create campus visit):', insertSql, insertParams);
    const result = await pool.query(insertSql, insertParams);

    // Defensive check
    if (!result || !result.rows || result.rows.length === 0) {
      throw new Error('Failed to create campus visit - no record returned');
    }

    console.log('createCampusVisit: Successfully created visit with ID', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('createCampusVisit Error:', error.message, error.stack);
    throw error;
  }
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
  try {
    // Validate inputs
    if (!id || !schoolId || !counselorId) {
      console.warn('getCampusVisitById: Missing id, schoolId, or counselorId');
      return undefined;
    }

    const sql = `
      SELECT * FROM campus_visit 
      WHERE id = $1 AND school_id = $2 AND assigned_to = $3
    `;

    console.log('Executing query (get campus visit by id):', sql, [id, schoolId, counselorId]);
    const result = await pool.query(sql, [id, schoolId, counselorId]);

    // Defensive check
    if (!result || !result.rows || result.rows.length === 0) {
      console.log('getCampusVisitById: Visit not found with ID', id);
      return undefined;
    }

    return result.rows[0];
  } catch (error) {
    console.error('getCampusVisitById Error:', error.message, error.stack);
    throw new Error(`Failed to fetch visit: ${error.message}`);
  }
};

/**
 * updateCampusVisit(id, schoolId, counselorId, updates)
 * Update a campus visit
 * Prevents update with no fields and validates allowed fields
 * @param {Number} id - Visit ID
 * @param {Number} schoolId - School ID
 * @param {Number} counselorId - Counselor ID (assigned_to)
 * @param {Object} updates - Fields to update { visitor_name, visitor_phone, student_name, grade,
 *                           number_of_visitors, visit_date, start_time, end_time, assigned_to,
 *                           visit_type, status, internal_notes, tour_preferences }
 * @returns {Promise<Object>} Updated visit record
 */
export const updateCampusVisit = async (id, schoolId, counselorId, updates) => {
  try {
    // Validate inputs
    if (!id || !schoolId || !counselorId) {
      const error = new Error('Missing id, schoolId, or counselorId');
      error.code = 'MISSING_PARAMS';
      throw error;
    }

    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
      const error = new Error('No fields to update');
      error.code = 'NO_UPDATES';
      throw error;
    }

    const allowedFields = [
      'visitor_name',
      'visitor_phone',
      'student_name',
      'grade',
      'number_of_visitors',
      'visit_date',
      'start_time',
      'end_time',
      'assigned_to',
      'visit_type',
      'status',
      'internal_notes',
      'tour_preferences',
    ];

    const updateFields = [];
    const params = [id, schoolId, counselorId];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        params.push(value);
        updateFields.push(`${key} = $${params.length}`);
      }
    }

    if (updateFields.length === 0) {
      const error = new Error('No valid fields to update');
      error.code = 'NO_VALID_UPDATES';
      console.warn('updateCampusVisit Warning:', error.message, 'Allowed fields:', allowedFields);
      throw error;
    }

    const sql = `
      UPDATE campus_visit
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $1 AND school_id = $2 AND assigned_to = $3
      RETURNING *
    `;

    console.log('Executing query (update campus visit):', sql, params);
    const result = await pool.query(sql, params);

    // Defensive check
    if (!result || !result.rows || result.rows.length === 0) {
      const error = new Error('Visit not found or not authorized to update');
      error.code = 'UPDATE_FAILED';
      throw error;
    }

    console.log('updateCampusVisit: Successfully updated visit with ID', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('updateCampusVisit Error:', error.message, error.stack);
    throw error;
  }
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
  try {
    // Validate inputs
    if (!id || !schoolId || !counselorId) {
      throw new Error('Missing id, schoolId, or counselorId');
    }

    const sql = `
      UPDATE campus_visit
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1 AND school_id = $2 AND assigned_to = $3
    `;

    console.log('Executing query (delete campus visit):', sql, [id, schoolId, counselorId]);
    const result = await pool.query(sql, [id, schoolId, counselorId]);

    // Defensive check
    if (!result || result.rowCount === 0) {
      console.warn('deleteCampusVisit: Visit not found or not authorized to delete', { id, schoolId, counselorId });
    } else {
      console.log('deleteCampusVisit: Successfully cancelled visit with ID', id);
    }
  } catch (error) {
    console.error('deleteCampusVisit Error:', error.message, error.stack);
    throw new Error(`Failed to delete visit: ${error.message}`);
  }
};

/**
 * getTimeSlotAvailability(schoolId, date)
 * Get time slot availability for a specific date
 * Groups visits by start_time and counts total visits at each slot
 * Excludes cancelled visits
 * @param {Number} schoolId - School ID
 * @param {String} date - Visit date (YYYY-MM-DD format)
 * @returns {Promise<Array>} Array of { start_time, total_visits }
 */
export const getTimeSlotAvailability = async (schoolId, date) => {
  try {
    // Validate inputs
    if (!schoolId || !date) {
      console.warn('getTimeSlotAvailability: Missing schoolId or date');
      return [];
    }

    const sql = `
      SELECT 
        start_time,
        COUNT(*) as total_visits
      FROM campus_visit
      WHERE school_id = $1
        AND visit_date = $2
        AND status != 'cancelled'
      GROUP BY start_time
      ORDER BY start_time ASC
    `;

    console.log('Executing query (time slot availability):', sql, [schoolId, date]);
    const result = await pool.query(sql, [schoolId, date]);

    // Defensive check - return empty array if no results
    if (!result || !Array.isArray(result.rows)) {
      console.log('getTimeSlotAvailability: No rows returned for date', date);
      return [];
    }

    console.log(`getTimeSlotAvailability: Found ${result.rows.length} slots with bookings`);
    return result.rows;
  } catch (error) {
    console.error('getTimeSlotAvailability Error:', error.message, error.stack);
    throw new Error(`Failed to fetch time slots: ${error.message}`);
  }
};

/**
 * getFutureVisits(schoolId, counselorId)
 * Get future visits (visit_date >= CURRENT_DATE and status = 'scheduled')
 * @param {Number} schoolId - School ID
 * @param {Number} counselorId - Counselor user ID
 * @returns {Promise<Array>} Array of upcoming visits
 */
export const getFutureVisits = async (schoolId, counselorId) => {
  try {
    if (!schoolId || !counselorId) return [];
    
    const sql = `
      SELECT 
        cv.id, cv.lead_id, cv.student_name, cv.visitor_name, cv.visitor_phone,
        cv.visit_date, cv.start_time, cv.end_time, cv.status, cv.internal_notes,
        cv.tour_preferences, cv.grade, cv.number_of_visitors, cv.visit_type,
        l.first_name, l.last_name, l.phone, l.email, l.desired_class
      FROM campus_visit cv
      LEFT JOIN lead l ON cv.lead_id = l.id AND l.school_id = cv.school_id
      WHERE cv.school_id = $1 AND cv.assigned_to = $2
        AND cv.visit_date >= CURRENT_DATE AND cv.status = 'scheduled'
      ORDER BY cv.visit_date ASC, cv.start_time ASC
    `;

    console.log('Executing query (future visits):', sql, [schoolId, counselorId]);
    const result = await pool.query(sql, [schoolId, counselorId]);

    return result.rows || [];
  } catch (error) {
    console.error('getFutureVisits Error:', error.message, error.stack);
    throw new Error(`Failed to fetch future visits: ${error.message}`);
  }
};

/**
 * getMissedVisits(schoolId, counselorId)
 * Get missed visits (visit_date < CURRENT_DATE and status = 'scheduled')
 * @param {Number} schoolId - School ID
 * @param {Number} counselorId - Counselor user ID
 * @returns {Promise<Array>} Array of missed visits
 */
export const getMissedVisits = async (schoolId, counselorId) => {
  try {
    if (!schoolId || !counselorId) return [];
    
    const sql = `
      SELECT 
        cv.id, cv.lead_id, cv.student_name, cv.visitor_name, cv.visitor_phone,
        cv.visit_date, cv.start_time, cv.end_time, cv.status, cv.internal_notes,
        cv.tour_preferences, cv.grade, cv.number_of_visitors, cv.visit_type,
        l.first_name, l.last_name, l.phone, l.email, l.desired_class
      FROM campus_visit cv
      LEFT JOIN lead l ON cv.lead_id = l.id AND l.school_id = cv.school_id
      WHERE cv.school_id = $1 AND cv.assigned_to = $2
        AND cv.visit_date < CURRENT_DATE AND cv.status = 'scheduled'
      ORDER BY cv.visit_date DESC, cv.start_time DESC
    `;

    console.log('Executing query (missed visits):', sql, [schoolId, counselorId]);
    const result = await pool.query(sql, [schoolId, counselorId]);

    return result.rows || [];
  } catch (error) {
    console.error('getMissedVisits Error:', error.message, error.stack);
    throw new Error(`Failed to fetch missed visits: ${error.message}`);
  }
};

/**
 * updateVisitStatus(id, schoolId, counselorId, status)
 * Update a campus visit's status to 'visited' or 'cancelled'
 * @param {Number} id - Visit ID
 * @param {Number} schoolId - School ID
 * @param {Number} counselorId - Counselor user ID
 * @param {String} status - The new status
 * @returns {Promise<Object>} Updated visit record
 */
export const updateVisitStatus = async (id, schoolId, counselorId, status) => {
  try {
    if (!id || !schoolId || !counselorId || !status) {
      const error = new Error('Missing required parameters for status update');
      error.code = 'MISSING_PARAMS';
      throw error;
    }

    if (!['visited', 'cancelled'].includes(status)) {
      const error = new Error('Invalid status. Must be "visited" or "cancelled"');
      error.code = 'INVALID_STATUS';
      throw error;
    }

    const sql = `
      UPDATE campus_visit
      SET status = $4, updated_at = NOW()
      WHERE id = $1 AND school_id = $2 AND assigned_to = $3
      RETURNING *
    `;

    console.log('Executing query (update visit status):', sql, [id, schoolId, counselorId, status]);
    const result = await pool.query(sql, [id, schoolId, counselorId, status]);

    if (!result || !result.rows || result.rows.length === 0) {
      const error = new Error('Visit not found or not authorized to update');
      error.code = 'UPDATE_FAILED';
      throw error;
    }

    console.log('updateVisitStatus: Successfully updated visit status for ID', id);
    return result.rows[0];
  } catch (error) {
    console.error('updateVisitStatus Error:', error.message, error.stack);
    throw error;
  }
};
