import pool from '../../db/pool.js';

export async function getAdmissionFunnel(schoolId) {
  const query = `
    SELECT
      COUNT(*) AS inquiry,
      COUNT(*) FILTER (WHERE l.status = 'contacted') AS contacted,
      COUNT(*) FILTER (WHERE l.status = 'interested') AS interested,
      COUNT(*) FILTER (WHERE l.status = 'visit') AS visit,
      COUNT(DISTINCT a.lead_id) AS applied,
      COUNT(*) FILTER (WHERE a.status = 'approved') AS enrolled
    FROM lead l
    LEFT JOIN application a ON a.lead_id = l.id
    WHERE l.school_id = $1
  `;
  try {
    const { rows } = await pool.query(query, [schoolId]);
    const funnel = rows[0];
    // Ensure all values are numbers and not null
    return {
      inquiry: Number(funnel.inquiry) || 0,
      contacted: Number(funnel.contacted) || 0,
      interested: Number(funnel.interested) || 0,
      visit: Number(funnel.visit) || 0,
      applied: Number(funnel.applied) || 0,
      enrolled: Number(funnel.enrolled) || 0,
    };
  } catch (err) {
    console.error('[Funnel] Error:', err);
    throw err;
  }
}
