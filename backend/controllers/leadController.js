import pool from '../config/db.js';
import { createLeadService } from '../services/lead.service.js';

/**
 * Lead Controller
 * Handles all lead-related endpoints for prospective students
 */

// Get all leads for a school
const getAllLeads = async (req, res) => {
  const { school_id, status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `SELECT 
      l.id,
      l.first_name,
      l.last_name,
      l.email,
      l.phone,
      l.desired_class,
      l.source,
      l.follow_up_status,
      l.assigned_to,
      l.last_contacted_at,
      sh.name as school_name,
      ay.year_name as academic_year,
      l.created_at
    FROM lead l
    JOIN school sh ON l.school_id = sh.id
    JOIN academic_year ay ON l.academic_year_id = ay.id
    WHERE 1=1`;

    const params = [];

    if (school_id) {
      query += ` AND l.school_id = $${params.length + 1}`;
      params.push(school_id);
    }

    if (status) {
      query += ` AND l.follow_up_status = $${params.length + 1}`;
      params.push(status);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM (${query.replace('SELECT l.id, l.first_name,', 'SELECT 1')}) as cnt`;
    const countResult = await pool.query(countQuery, params);
    const totalLeads = parseInt(countResult.rows[0].count);

    // Get paginated data
    query += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      message: 'Leads retrieved successfully',
      data: result.rows,
      pagination: {
        total: totalLeads,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalLeads / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
      error: error.message,
    });
  }
};

// Search leads by name, email, or phone
const searchLeads = async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ success: false, message: 'Search query is required' });
  }

  try {
    const query = `
      SELECT 
        l.*,
        sh.name as school_name,
        ay.year_name as academic_year
      FROM lead l
      JOIN school sh ON l.school_id = sh.id
      JOIN academic_year ay ON l.academic_year_id = ay.id
      WHERE 
        l.first_name ILIKE $1 
        OR l.last_name ILIKE $1
        OR CONCAT(l.first_name, ' ', l.last_name) ILIKE $1
        OR l.email ILIKE $1 
        OR l.phone ILIKE $1
      ORDER BY l.created_at DESC
      LIMIT 20
    `;
    const searchTerm = `%${q}%`;
    const result = await pool.query(query, [searchTerm]);

    res.status(200).json({
      success: true,
      message: 'Search completed',
      data: result.rows
    });
  } catch (error) {
    console.error('Error searching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching leads',
      error: error.message
    });
  }
};

// Get lead by ID
const getLeadById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT l.*, sh.name as school_name, ay.year_name
       FROM lead l
       JOIN school sh ON l.school_id = sh.id
       JOIN academic_year ay ON l.academic_year_id = ay.id
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead retrieved successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lead',
      error: error.message,
    });
  }
};

// Create new lead
const createLead = async (req, res) => {
  try {
    const createdLead = await createLeadService(req.body);
    res.status(201).json({
      success: true,
      data: {
        id: createdLead.id,
        message: 'Lead created successfully',
      },
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating lead',
      error: error.message,
    });
  }
};

// Update lead follow-up status
const updateLeadStatus = async (req, res) => {
  const { id } = req.params;
  const { follow_up_status, notes, assigned_to } = req.body;

  if (!follow_up_status) {
    return res.status(400).json({
      success: false,
      message: 'follow_up_status is required',
    });
  }

  try {
    const result = await pool.query(
      `UPDATE lead 
       SET follow_up_status = $1, notes = COALESCE($2, notes), assigned_to = COALESCE($3, assigned_to), last_contacted_at = NOW(), updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [follow_up_status, notes, assigned_to, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead status updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating lead status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lead status',
      error: error.message,
    });
  }
};

export {
  getAllLeads,
  searchLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
};
