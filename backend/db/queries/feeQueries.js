/**
 * db/queries/feeQueries.js
 * Database queries for fees and invoices
 */

import pool from '../pool.js';

/**
 * getDashboardStats(school_id)
 * Aggregate total_amount, paid_amount, and pending_amount from invoice table
 */
export const getDashboardStats = async (school_id) => {
  const sql = `
    SELECT
      COALESCE(SUM(total_amount), 0) as total_amount,
      COALESCE(SUM(paid_amount), 0) as paid_amount,
      COALESCE(SUM(pending_amount), 0) as pending_amount
    FROM invoice
    WHERE school_id = $1
  `;
  const result = await pool.query(sql, [school_id]);
  return result.rows[0];
};

/**
 * getTransactions(school_id)
 * Fetch invoices joined with student and school_class
 */
export const getTransactions = async (school_id) => {
  const sql = `
    SELECT
      i.id,
      i.invoice_number,
      i.invoice_date,
      i.due_date,
      i.total_amount,
      i.paid_amount,
      i.pending_amount,
      i.status,
      s.first_name,
      s.middle_name,
      s.last_name,
      sc.name as class_name,
      sc.grade
    FROM invoice i
    JOIN student s ON i.student_id = s.id
    JOIN admission a ON s.id = a.student_id
    JOIN school_class sc ON a.class_id = sc.id
    WHERE i.school_id = $1
    ORDER BY i.created_at DESC
  `;
  const result = await pool.query(sql, [school_id]);
  return result.rows;
};

/**
 * getInvoiceById(invoice_id, school_id)
 * Fetch full invoice details with school, student, parent, and payment history
 */
export const getInvoiceById = async (invoice_id, school_id) => {
  // First get invoice details
  const invoiceSql = `
    SELECT
      i.*,
      sch.name as school_name,
      sch.address as school_address,
      sch.phone as school_phone,
      sch.email as school_email,
      s.first_name,
      s.middle_name,
      s.last_name,
      s.email as student_email,
      s.phone as student_phone,
      s.date_of_birth,
      sc.name as class_name,
      sc.grade,
      pd.father_name,
      pd.mother_name,
      pd.parent_email,
      pd.parent_phone,
      pd.address as parent_address
    FROM invoice i
    JOIN school sch ON i.school_id = sch.id
    JOIN student s ON i.student_id = s.id
    JOIN admission a ON s.id = a.student_id
    JOIN school_class sc ON a.class_id = sc.id
    LEFT JOIN parent_detail pd ON s.id = pd.student_id
    WHERE i.id = $1 AND i.school_id = $2
  `;
  const invoiceResult = await pool.query(invoiceSql, [invoice_id, school_id]);
  const invoice = invoiceResult.rows[0];

  if (!invoice) return null;

  // Get payment history
  const paymentSql = `
    SELECT
      id,
      payment_number,
      amount,
      payment_date,
      payment_method,
      status,
      remarks,
      created_at
    FROM payment
    WHERE invoice_id = $1 AND school_id = $2
    ORDER BY created_at DESC
  `;
  const paymentResult = await pool.query(paymentSql, [invoice_id, school_id]);

  return {
    ...invoice,
    payments: paymentResult.rows
  };
};

/**
 * generateInvoiceNumber(school_id)
 * Generate unique invoice number
 */
export const generateInvoiceNumber = async (school_id) => {
  const sql = `
    SELECT COUNT(*) + 1 as next_number
    FROM invoice
    WHERE school_id = $1 AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
  `;
  const result = await pool.query(sql, [school_id]);
  const nextNumber = result.rows[0].next_number;
  const year = new Date().getFullYear();
  return `INV-${year}-${nextNumber.toString().padStart(4, '0')}`;
};

/**
 * createInvoice(invoiceData)
 * Insert new invoice record
 */
export const createInvoice = async (invoiceData) => {
  const {
    school_id,
    student_id,
    invoice_number,
    invoice_date,
    due_date,
    total_amount,
    paid_amount,
    pending_amount,
    notes,
    created_by
  } = invoiceData;

  const sql = `
    INSERT INTO invoice (
      school_id, student_id, invoice_number, invoice_date, due_date,
      total_amount, paid_amount, pending_amount, notes, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  const result = await pool.query(sql, [
    school_id, student_id, invoice_number, invoice_date, due_date,
    total_amount, paid_amount, pending_amount, notes, created_by
  ]);
  return result.rows[0];
};

/**
 * getStudentFeeAssignments(student_id, school_id)
 * Get fee assignments for a student with concessions applied
 */
export const getStudentFeeAssignments = async (student_id, school_id) => {
  const sql = `
    SELECT
      sfa.*,
      fs.fee_type,
      fs.amount as original_amount,
      fs.description
    FROM student_fee_assignment sfa
    JOIN fee_structure fs ON sfa.fee_structure_id = fs.id
    WHERE sfa.student_id = $1 AND sfa.school_id = $2
  `;
  const result = await pool.query(sql, [student_id, school_id]);
  return result.rows;
};

/**
 * createAuditLog(auditData)
 * Insert audit log entry
 */
export const createAuditLog = async (auditData) => {
  const {
    school_id,
    user_id,
    action,
    entity,
    entity_id,
    status,
    old_data,
    new_data,
    change_summary,
    ip_address,
    user_agent
  } = auditData;

  const sql = `
    INSERT INTO audit_log (
      school_id, user_id, action, entity, entity_id, status,
      old_data, new_data, change_summary, ip_address, user_agent
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `;
  await pool.query(sql, [
    school_id, user_id, action, entity, entity_id, status,
    old_data, new_data, change_summary, ip_address, user_agent
  ]);
};