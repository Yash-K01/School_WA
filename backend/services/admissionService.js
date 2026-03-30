import pool from '../config/db.js';

/** 
 * Get admission statistics
 * Returns the total number of records from the admission table
 */
export const getAdmissionStats = async () => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE LOWER(status) = 'submitted') AS submitted,
        COUNT(*) FILTER (WHERE LOWER(status) = 'under_review') AS under_review,
        COUNT(*) FILTER (WHERE LOWER(status) = 'approved') AS approved,
        COUNT(*) FILTER (WHERE LOWER(status) = 'waitlisted') AS waitlisted
      FROM admission;
    `);
    
    const row = result.rows[0];
    return {
      total: parseInt(row.total || 0, 10),
      submitted: parseInt(row.submitted || 0, 10),
      under_review: parseInt(row.under_review || 0, 10),
      approved: parseInt(row.approved || 0, 10),
      waitlisted: parseInt(row.waitlisted || 0, 10)
    };
  } catch (error) {
    throw new Error(`Failed to fetch admission stats: ${error.message}`);
  }
};

/**
 * Search admissions by student name or parent contact
 * @param {string} query - Search query (student name or parent phone)
 * @returns {Array} Array of matching admissions
 */
export const searchAdmissions = async (query) => {
  try {
    const searchQuery = `%${query}%`;
    
    const result = await pool.query(`
      SELECT DISTINCT
        a.id as application_id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        sc.class_name as grade,
        COALESCE(pd.phone, 'N/A') as parent_contact,
        a.created_at as submitted_date,
        a.status
      FROM admission a
      JOIN student s ON a.student_id = s.id
      JOIN school_class sc ON a.class_id = sc.id
      LEFT JOIN parent_detail pd ON s.id = pd.student_id
      WHERE 
        s.first_name ILIKE $1 OR 
        s.last_name ILIKE $1 OR
        CONCAT(s.first_name, ' ', s.last_name) ILIKE $1 OR
        pd.phone ILIKE $1
      ORDER BY a.created_at DESC
      LIMIT 100
    `, [searchQuery]);
    
    // Format the response
    return result.rows.map(row => ({
      application_id: row.application_id,
      student_name: row.student_name,
      grade: row.grade,
      parent_contact: row.parent_contact || 'N/A',
      submitted_date: row.submitted_date ? row.submitted_date.toISOString().split('T')[0] : 'N/A',
      status: row.status
    }));
  } catch (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
};

/**
 * Get all admissions with pagination and filters
 * @param {number} limit - Number of records per page
 * @param {number} offset - Number of records to skip
 * @returns {Object} Admissions list and total count
 */
export const getAdmissions = async (limit = 10, offset = 0) => {
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM admission');
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(`
      SELECT 
        a.id as application_id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        sc.class_name as grade,
        COALESCE(pd.phone, 'N/A') as parent_contact,
        a.created_at as submitted_date,
        a.status
      FROM admission a
      JOIN student s ON a.student_id = s.id
      JOIN school_class sc ON a.class_id = sc.id
      LEFT JOIN parent_detail pd ON s.id = pd.student_id
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return {
      data: result.rows.map(row => ({
        application_id: row.application_id,
        student_name: row.student_name,
        grade: row.grade,
        parent_contact: row.parent_contact || 'N/A',
        submitted_date: row.submitted_date ? row.submitted_date.toISOString().split('T')[0] : 'N/A',
        status: row.status
      })),
      total,
      limit,
      offset
    };
  } catch (error) {
    throw new Error(`Failed to fetch admissions: ${error.message}`);
  }
};

/**
 * Get admission details by application ID
 * @param {string} applicationId - Application ID
 * @returns {Object} Admission details
 */
export const getAdmissionById = async (applicationId) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id as application_id,
        a.school_id,
        a.student_id,
        a.academic_year_id,
        a.class_id,
        a.section_id,
        a.admission_date,
        a.status,
        a.admission_type,
        a.registration_number,
        a.previous_school,
        s.id,
        s.first_name,
        s.last_name,
        s.date_of_birth,
        s.gender,
        s.aadhar_number,
        s.phone,
        s.email,
        sc.class_name,
        sec.section_name,
        pd.first_name as parent_first_name,
        pd.last_name as parent_last_name,
        pd.phone as parent_phone,
        pd.relation,
        pd.email as parent_email,
        pd.occupation
      FROM admission a
      JOIN student s ON a.student_id = s.id
      JOIN school_class sc ON a.class_id = sc.id
      JOIN section sec ON a.section_id = sec.id
      LEFT JOIN parent_detail pd ON s.id = pd.student_id
      WHERE a.id = $1
    `, [applicationId]);

    if (result.rows.length === 0) {
      throw new Error('Admission not found');
    }

    return result.rows[0];
  } catch (error) {
    throw new Error(`Failed to fetch admission details: ${error.message}`);
  }
};

export const createAdmission = async (studentData, parentData, admissionData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert into student
    const studentQuery = `
      INSERT INTO student (
        school_id, admission_number, first_name, last_name, date_of_birth, gender, email, phone, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
      RETURNING id
    `;
    const stdVals = [
      admissionData.school_id || 1, // Defaulting to 1 if not passed for MVP
      admissionData.admission_number || `ADM-${Date.now()}`,
      studentData.first_name,
      studentData.last_name,
      studentData.date_of_birth || null,
      studentData.gender || 'Other',
      studentData.email || null,
      studentData.phone || null
    ];
    const studentRes = await client.query(studentQuery, stdVals);
    const studentId = studentRes.rows[0].id;

    // 2. Insert into parent_detail
    const parentQuery = `
      INSERT INTO parent_detail (
        school_id, student_id, relation, first_name, last_name, email, phone, occupation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    const parentVals = [
      admissionData.school_id || 1,
      studentId,
      parentData.relation || 'Father', 
      parentData.first_name,
      parentData.last_name || null,
      parentData.email || null,
      parentData.phone,
      parentData.occupation || null
    ];
    await client.query(parentQuery, parentVals);

    // 3. Insert into admission
    const admissionInsertQuery = `
      INSERT INTO admission (
        school_id, student_id, academic_year_id, class_id, section_id, admission_date, status, admission_type
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active', 'new')
      RETURNING id
    `;
    const admissionVals = [
      admissionData.school_id || 1,
      studentId,
      admissionData.academic_year_id || 1, // Ensure default available IDs if front-end lacks dropdown configs initially
      admissionData.class_id || 1,
      admissionData.section_id || 1,
      admissionData.admission_date || new Date().toISOString().split('T')[0]
    ];
    const admissionRes = await client.query(admissionInsertQuery, admissionVals);
    const newAdmissionId = admissionRes.rows[0].id;

    await client.query('COMMIT');
    return newAdmissionId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Failed to create admission: ${error.message}`);
  } finally {
    client.release();
  }
};

export default {
  getAdmissionStats,
  searchAdmissions,
  getAdmissions,
  getAdmissionById,
  createAdmission
};
