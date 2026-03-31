/**
 * db/queries/leadQueries.js
 * SQL execution functions for Lead management
 * Uses parameterized queries ($1, $2, etc.) to prevent SQL injection
 * All functions operate at the database level with no business logic
 */

import pool from '../pool.js';

/**
 * createLead(data)
 * INSERT into lead table and return the new row
 * @param {Object} data - Lead data (school_id, academic_year_id, first_name, last_name, 
 *                        email, phone, desired_class, source, notes, assigned_to, 
 *                        follow_up_date, created_by)
 * @returns {Object} The newly created lead row
 */
export const createLead = async (data) => {
  const { 
    school_id, academic_year_id, first_name, last_name, email, phone, 
    desired_class, source, follow_up_status, notes, assigned_to, follow_up_date, created_by 
  } = data;
  
  const sql = `
    INSERT INTO lead (
      school_id, academic_year_id, first_name, last_name, email, 
      phone, desired_class, source, follow_up_status, notes, assigned_to, 
      follow_up_date, created_by, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
    RETURNING *;
  `;
  
  const result = await pool.query(sql, [
    school_id, academic_year_id, first_name, last_name, email, 
    phone, desired_class, source, follow_up_status || 'pending', notes, assigned_to, 
    follow_up_date, created_by
  ]);
  
  return result.rows[0];
};

/**
 * getAllLeads(school_id, filters)
 * SELECT all leads for a school with optional filters (follow_up_status, desired_class, assigned_to)
 * @param {Number} school_id - School identifier
 * @param {Object} filters - Optional filters { follow_up_status, desired_class, assigned_to }
 * @returns {Array} Array of lead records
 */
export const getAllLeads = async (school_id, filters = {}) => {
  const { follow_up_status, desired_class, assigned_to } = filters;
  
  let sql = 'SELECT * FROM lead WHERE school_id = $1';
  const params = [school_id];

  if (follow_up_status) {
    params.push(follow_up_status);
    sql += ` AND follow_up_status = $${params.length}`;
  }
  if (desired_class) {
    params.push(desired_class);
    sql += ` AND desired_class = $${params.length}`;
  }
  if (assigned_to) {
    params.push(assigned_to);
    sql += ` AND assigned_to = $${params.length}`;
  }

  sql += ' ORDER BY created_at DESC';

  const result = await pool.query(sql, params);
  return result.rows;
};

/**
 * getLeadById(id, school_id)
 * SELECT a single lead by ID, scoped to school_id
 * @param {Number} id - Lead ID
 * @param {Number} school_id - School identifier (for tenant isolation)
 * @returns {Object|undefined} Lead record or undefined if not found
 */
export const getLeadById = async (id, school_id) => {
  const sql = 'SELECT * FROM lead WHERE id = $1 AND school_id = $2';
  const result = await pool.query(sql, [id, school_id]);
  return result.rows[0];
};

/**
 * updateLead(id, school_id, data)
 * UPDATE lead record with partial data (only provided fields are updated)
 * @param {Number} id - Lead ID
 * @param {Number} school_id - School identifier
 * @param {Object} data - Fields to update (partial)
 * @returns {Object|undefined} Updated lead record or undefined if not found
 */
export const updateLead = async (id, school_id, data) => {
  const { 
    first_name, last_name, email, phone, desired_class, source, 
    follow_up_status, notes, assigned_to, follow_up_date 
  } = data;
  
  const sql = `
    UPDATE lead 
    SET 
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      email = COALESCE($3, email),
      phone = COALESCE($4, phone),
      desired_class = COALESCE($5, desired_class),
      source = COALESCE($6, source),
      follow_up_status = COALESCE($7, follow_up_status),
      notes = COALESCE($8, notes),
      assigned_to = COALESCE($9, assigned_to),
      follow_up_date = COALESCE($10, follow_up_date),
      updated_at = NOW()
    WHERE id = $11 AND school_id = $12
    RETURNING *;
  `;
  
  const result = await pool.query(sql, [
    first_name, last_name, email, phone, desired_class, source, 
    follow_up_status, notes, assigned_to, follow_up_date, id, school_id
  ]);
  
  return result.rows[0];
};

/**
 * deleteLead(id, school_id)
 * DELETE a lead record by ID
 * @param {Number} id - Lead ID
 * @param {Number} school_id - School identifier
 * @returns {Boolean} True if deleted, false if not found
 */
export const deleteLead = async (id, school_id) => {
  const sql = 'DELETE FROM lead WHERE id = $1 AND school_id = $2';
  const result = await pool.query(sql, [id, school_id]);
  return result.rowCount > 0;
};
