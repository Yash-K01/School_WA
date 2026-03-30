import pool from '../config/db.js';

/**
 * School Controller
 * Handles all school-related endpoints
 */

// Get all schools
const getAllSchools = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        name, 
        email, 
        phone, 
        city, 
        state, 
        principal_name, 
        status,
        created_at 
      FROM school 
      ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      message: 'Schools retrieved successfully',
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schools',
      error: error.message,
    });
  }
};

// Get school by ID
const getSchoolById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM school WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'School not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'School retrieved successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching school',
      error: error.message,
    });
  }
};

// Create new school
const createSchool = async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    city,
    state,
    postal_code,
    country,
    established_year,
    principal_name,
  } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'School name is required',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO school 
      (name, email, phone, address, city, state, postal_code, country, established_year, principal_name, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [name, email, phone, address, city, state, postal_code, country, established_year, principal_name, 'active', 'admin']
    );

    res.status(201).json({
      success: true,
      message: 'School created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating school',
      error: error.message,
    });
  }
};

export {
  getAllSchools,
  getSchoolById,
  createSchool,
};
