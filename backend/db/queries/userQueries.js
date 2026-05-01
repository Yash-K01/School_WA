import pool from '../pool.js';

export const getUsersBySchoolId = async (schoolId) => {
  const sql = 'SELECT id, school_id, name, email, role, status, created_at FROM app_user WHERE school_id = $1 ORDER BY created_at DESC';
  const result = await pool.query(sql, [schoolId]);
  return result.rows;
};

export const updatePassword = async (userId, password_hash) => {
  const sql = 'UPDATE app_user SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id';
  const result = await pool.query(sql, [password_hash, userId]);
  return result.rows[0];
};
