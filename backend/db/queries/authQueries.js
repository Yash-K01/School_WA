/**
 * db/queries/authQueries.js
 * Database queries for authentication
 */

import pool from '../pool.js';

/**
 * getUserByEmail(email)
 * Fetch user by email
 */
export const getUserByEmail = async (email) => {
  const sql = 'SELECT * FROM app_user WHERE email = $1 AND status = $2';
  const result = await pool.query(sql, [email, 'active']);
  return result.rows[0];
};

/**
 * getUserById(id)
 * Fetch user by ID
 */
export const getUserById = async (id) => {
  const sql = 'SELECT id, school_id, name, email, role, status FROM app_user WHERE id = $1';
  const result = await pool.query(sql, [id]);
  return result.rows[0];
};

/**
 * createUser(data)
 * Create new user (for signup or admin creation)
 */
export const createUser = async (data) => {
  const { school_id, name, email, password_hash, role = 'counselor' } = data;
  const sql = `
    INSERT INTO app_user (school_id, name, email, password_hash, role, status)
    VALUES ($1, $2, $3, $4, $5, 'active')
    RETURNING id, school_id, name, email, role, created_at;
  `;
  const result = await pool.query(sql, [school_id, name, email, password_hash, role]);
  return result.rows[0];
};
