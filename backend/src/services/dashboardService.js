import pool from '../../config/db.js';

// Helper to log and return 0 if null
const safeNumber = (val) => (val === null ? 0 : Number(val));

const dashboardService = {
  async getTotalInquiries(schoolId) {
    try {
      const { rows } = await pool.query(
        'SELECT COUNT(*) AS total FROM lead WHERE school_id = $1',[schoolId]
      );
      console.log('[Dashboard] getTotalInquiries:', rows[0].total);
      // console.log(rows[0].total);
      return safeNumber(rows[0].total);
    } catch (err) {
      console.error('Error in getTotalInquiries:', err);
      throw err;
    }
  },

  async getConversionRate(schoolId) {
    try {
      const { rows } = await pool.query(
        `SELECT ROUND((COUNT(DISTINCT a.lead_id)::decimal / NULLIF(COUNT(DISTINCT l.id),0)) * 100, 2) AS conversion_rate
         FROM lead l
         LEFT JOIN application a ON a.lead_id = l.id
         WHERE l.school_id = $1`,
        [schoolId]
      );
      const rate = rows[0].conversion_rate;
      console.log('[Dashboard] getConversionRate:', rate);
      return safeNumber(rate);
    } catch (err) {
      console.error('Error in getConversionRate:', err);
      throw err;
    }
  },

  async getActiveLeads(schoolId) {
    try {
      const { rows } = await pool.query(
        "SELECT COUNT(*) AS total FROM lead WHERE follow_up_status IN ('pending', 'contacted', 'interested') AND school_id = $1",
        [schoolId]
      );
      console.log('[Dashboard] getActiveLeads:', rows[0].total);
      return safeNumber(rows[0].total);
    } catch (err) {
      console.error('Error in getActiveLeads:', err);
      throw err;
    }
  },

  async getEnrolledStudents(schoolId) {
    try {
      const { rows } = await pool.query(
        "SELECT COUNT(*) AS total FROM application WHERE status = 'approved' AND school_id = $1",
        [schoolId]
      );
      console.log('[Dashboard] getEnrolledStudents:', rows[0].total);
      return safeNumber(rows[0].total);
    } catch (err) {
      console.error('Error in getEnrolledStudents:', err);
      throw err;
    }
  },

  async getPendingApplications(schoolId) {
    try {
      const { rows } = await pool.query(
        "SELECT COUNT(*) AS total FROM application WHERE status = 'in_progress' AND school_id = $1",
        [schoolId]
      );
      console.log('[Dashboard] getPendingApplications:', rows[0].total);
      return safeNumber(rows[0].total);
    } catch (err) {
      console.error('Error in getPendingApplications:', err);
      throw err;
    }
  },

  async getOffersSent(schoolId) {
    try {
      const { rows } = await pool.query(
        "SELECT COUNT(*) AS total FROM application WHERE status = 'approved' AND school_id = $1",
        [schoolId]
      );
      console.log('[Dashboard] getOffersSent:', rows[0].total);
      return safeNumber(rows[0].total);
    } catch (err) {
      console.error('Error in getOffersSent:', err);
      throw err;
    }
  },

  async getFeesCollected(schoolId) {
    try {
      const { rows } = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) AS total FROM payment WHERE status = 'successful' AND school_id = $1",
        [schoolId]
      );
      console.log('[Dashboard] getFeesCollected:', rows[0].total);
      return safeNumber(rows[0].total);
    } catch (err) {
      console.error('Error in getFeesCollected:', err);
      throw err;
    }
  },
};

export default dashboardService;
