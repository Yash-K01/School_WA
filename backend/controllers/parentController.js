import pool from '../config/db.js';

// Get parent by ID
export const getParentById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM parent_detail WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching parent:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parent',
      error: error.message
    });
  }
};

// Save parent information
export const saveParent = async (req, res) => {
  const {
    school_id,
    student_id,
    relation,
    first_name,
    last_name,
    email,
    phone,
    occupation
  } = req.body;

  try {
    // Check if parent details exist
    const checkResult = await pool.query(
      `SELECT id FROM parent_detail WHERE student_id = $1 AND relation = $2`,
      [student_id, relation || 'Father']
    );

    let result;
    if (checkResult.rows.length > 0) {
      // Update existing
      result = await pool.query(
        `UPDATE parent_detail 
         SET first_name = $1, last_name = $2, email = $3, phone = $4, occupation = $5, updated_at = NOW()
         WHERE student_id = $6 AND relation = $7
         RETURNING *`,
        [first_name, last_name, email, phone, occupation, student_id, relation || 'Father']
      );
    } else {
      // Insert new
      result = await pool.query(
        `INSERT INTO parent_detail 
         (school_id, student_id, relation, first_name, last_name, email, phone, occupation)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [school_id, student_id, relation || 'Father', first_name, last_name, email, phone, occupation]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Parent information saved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving parent:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving parent',
      error: error.message
    });
  }
};
