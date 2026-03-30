import pool from '../config/db.js';

/**
 * Student Controller
 * Handles all student-related endpoints
 */

// Get all students with pagination
const getAllStudents = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) as count FROM student');
    const totalStudents = parseInt(countResult.rows[0].count);

    // Get paginated data
    const result = await pool.query(
      `SELECT 
        s.id,
        s.admission_number,
        CONCAT(s.first_name, ' ', COALESCE(s.middle_name, ''), ' ', s.last_name) as full_name,
        s.email,
        s.phone,
        s.gender,
        s.date_of_birth,
        s.status,
        sh.name as school_name,
        s.created_at
      FROM student s
      JOIN school sh ON s.school_id = sh.id
      ORDER BY s.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: result.rows,
      pagination: {
        total: totalStudents,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalStudents / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message,
    });
  }
};

// Get student by ID with details
const getStudentById = async (req, res) => {
  const { id } = req.params;

  try {
    // Get student details
    const studentResult = await pool.query(
      `SELECT s.*, sh.name as school_name 
       FROM student s
       JOIN school sh ON s.school_id = sh.id
       WHERE s.id = $1`,
      [id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Get parent details
    const parentResult = await pool.query(
      `SELECT id, relation, first_name, last_name, email, phone, occupation
       FROM parent_detail
       WHERE student_id = $1`,
      [id]
    );

    // Get admission details
    const admissionResult = await pool.query(
      `SELECT a.*, sc.class_name, sec.section_name, ay.year_name
       FROM admission a
       JOIN school_class sc ON a.class_id = sc.id
       JOIN section sec ON a.section_id = sec.id
       JOIN academic_year ay ON a.academic_year_id = ay.id
       WHERE a.student_id = $1
       ORDER BY a.academic_year_id DESC`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Student details retrieved successfully',
      data: {
        student: studentResult.rows[0],
        parents: parentResult.rows,
        admissions: admissionResult.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message,
    });
  }
};

// Create new student
const createStudent = async (req, res) => {
  const {
    school_id,
    admission_number,
    first_name,
    last_name,
    date_of_birth,
    gender,
    email,
    phone,
    address,
    city,
    state,
    postal_code,
    country,
    blood_group,
  } = req.body;

  // Validation
  if (!first_name || !admission_number || !school_id) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: first_name, admission_number, school_id',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO student 
      (school_id, admission_number, first_name, last_name, date_of_birth, gender, email, phone, address, city, state, postal_code, country, blood_group, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        school_id,
        admission_number,
        first_name,
        last_name,
        date_of_birth,
        gender,
        email,
        phone,
        address,
        city,
        state,
        postal_code,
        country,
        blood_group,
        'active',
        'admin',
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating student',
      error: error.message,
    });
  }
};

const saveStudent = async (req, res) => {
  const {
    school_id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    blood_group,
    email,
    phone,
    id // if id is passed, update, else create
  } = req.body;

  try {
    let result;
    if (id) {
       result = await pool.query(
         `UPDATE student 
          SET first_name = COALESCE($1, first_name),
              last_name = COALESCE($2, last_name),
              date_of_birth = COALESCE($3, date_of_birth),
              gender = COALESCE($4, gender),
              blood_group = COALESCE($5, blood_group),
              email = COALESCE($6, email),
              phone = COALESCE($7, phone),
              updated_at = NOW()
          WHERE id = $8 RETURNING *`,
         [first_name, last_name, date_of_birth, gender, blood_group, email, phone, id]
       );
    } else {
       // if not passing id, generate dummy admission_number for the time being
       const admission_number = 'ADM-' + Date.now();
       result = await pool.query(
         `INSERT INTO student 
          (school_id, admission_number, first_name, last_name, date_of_birth, gender, blood_group, email, phone, status, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *`,
         [school_id, admission_number, first_name, last_name, date_of_birth, gender, blood_group, email, phone, 'active', 'admin']
       );
    }

    res.status(200).json({
      success: true,
      message: 'Student saved successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error saving student:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving student',
      error: error.message,
    });
  }
};

export {
  getAllStudents,
  getStudentById,
  createStudent,
  saveStudent,
};
