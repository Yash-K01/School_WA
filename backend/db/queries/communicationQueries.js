import pool from '../pool.js';

const recipientQueryMap = {
  lead: `
    SELECT
      id,
      school_id,
      'lead' AS recipient_type,
      TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))) AS name,
      first_name,
      last_name,
      email,
      phone,
      desired_class AS context_label
    FROM lead
    WHERE id = $1 AND school_id = $2
  `,
  student: `
    SELECT
      id,
      school_id,
      'student' AS recipient_type,
      TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))) AS name,
      first_name,
      last_name,
      email,
      phone,
      admission_number AS context_label
    FROM student
    WHERE id = $1 AND school_id = $2
  `,
  parent: `
    SELECT
      pd.id,
      pd.school_id,
      'parent' AS recipient_type,
      TRIM(CONCAT(COALESCE(pd.first_name, ''), ' ', COALESCE(pd.last_name, ''))) AS name,
      pd.first_name,
      pd.last_name,
      pd.email,
      pd.phone,
      CONCAT(pd.relation, CASE WHEN s.admission_number IS NOT NULL THEN CONCAT(' - ', s.admission_number) ELSE '' END) AS context_label
    FROM parent_detail pd
    LEFT JOIN student s ON s.id = pd.student_id AND s.school_id = pd.school_id
    WHERE pd.id = $1 AND pd.school_id = $2
  `,
};

export const getRecipientByTypeAndId = async (recipientType, recipientId, schoolId) => {
  const result = await pool.query(recipientQueryMap[recipientType], [recipientId, schoolId]);
  return result.rows[0];
};

export const getRecipientsByType = async (recipientType, schoolId, search) => {
  const searchClause = search ? ' AND search_value ILIKE $2' : '';
  const params = search ? [schoolId, `%${search}%`] : [schoolId];

  const queries = {
    lead: `
      SELECT *
      FROM (
        SELECT
          id,
          'lead' AS recipient_type,
          TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))) AS name,
          email,
          phone,
          desired_class AS extra_info,
          CONCAT_WS(' ', first_name, last_name, email, phone, desired_class) AS search_value
        FROM lead
        WHERE school_id = $1
      ) recipient
      WHERE 1=1${searchClause}
      ORDER BY name ASC, id DESC
      LIMIT 200
    `,
    student: `
      SELECT *
      FROM (
        SELECT
          id,
          'student' AS recipient_type,
          TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))) AS name,
          email,
          phone,
          admission_number AS extra_info,
          CONCAT_WS(' ', first_name, last_name, email, phone, admission_number) AS search_value
        FROM student
        WHERE school_id = $1
      ) recipient
      WHERE 1=1${searchClause}
      ORDER BY name ASC, id DESC
      LIMIT 200
    `,
    parent: `
      SELECT *
      FROM (
        SELECT
          pd.id,
          'parent' AS recipient_type,
          TRIM(CONCAT(COALESCE(pd.first_name, ''), ' ', COALESCE(pd.last_name, ''))) AS name,
          pd.email,
          pd.phone,
          CONCAT(pd.relation, CASE WHEN s.admission_number IS NOT NULL THEN CONCAT(' - ', s.admission_number) ELSE '' END) AS extra_info,
          CONCAT_WS(' ', pd.first_name, pd.last_name, pd.email, pd.phone, pd.relation, s.admission_number) AS search_value
        FROM parent_detail pd
        LEFT JOIN student s ON s.id = pd.student_id AND s.school_id = pd.school_id
        WHERE pd.school_id = $1
      ) recipient
      WHERE 1=1${searchClause}
      ORDER BY name ASC, id DESC
      LIMIT 200
    `,
  };

  const result = await pool.query(queries[recipientType], params);
  return result.rows.map(({ search_value, ...row }) => row);
};

export const getTemplateById = async (templateId, schoolId) => {
  const result = await pool.query(
    `SELECT *
     FROM message_template
     WHERE id = $1 AND school_id = $2`,
    [templateId, schoolId]
  );

  return result.rows[0];
};

export const touchTemplateLastUsed = async (templateId, schoolId) => {
  await pool.query(
    `UPDATE message_template
     SET last_used_at = NOW()
     WHERE id = $1 AND school_id = $2`,
    [templateId, schoolId]
  );
};

export const touchTemplateLastUsedWithClient = async (client, templateId, schoolId) => {
  await client.query(
    `UPDATE message_template
     SET last_used_at = NOW()
     WHERE id = $1 AND school_id = $2`,
    [templateId, schoolId]
  );
};

export const createCommunicationLog = async (client, payload) => {
  const result = await client.query(
    `INSERT INTO communication_log (
      school_id, recipient_type, recipient_id, channel, subject, message, status,
      sent_at, delivered_at, opened_at, clicked_at, created_by
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12
    )
    RETURNING *`,
    [
      payload.school_id,
      payload.recipient_type,
      payload.recipient_id,
      payload.channel,
      payload.subject,
      payload.message,
      payload.status,
      payload.sent_at,
      payload.delivered_at || null,
      payload.opened_at || null,
      payload.clicked_at || null,
      payload.created_by,
    ]
  );

  return result.rows[0];
};

export const getCommunicationLogs = async (schoolId, filters, pagination) => {
  const whereClauses = ['cl.school_id = $1'];
  const params = [schoolId];

  if (filters.recipient_type) {
    params.push(filters.recipient_type);
    whereClauses.push(`cl.recipient_type = $${params.length}`);
  }

  if (filters.channel) {
    params.push(filters.channel);
    whereClauses.push(`cl.channel = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    whereClauses.push(`cl.status = $${params.length}`);
  }

  if (filters.from_date) {
    params.push(filters.from_date);
    whereClauses.push(`cl.created_at::date >= $${params.length}`);
  }

  if (filters.to_date) {
    params.push(filters.to_date);
    whereClauses.push(`cl.created_at::date <= $${params.length}`);
  }

  const whereSql = whereClauses.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total
     FROM communication_log cl
     WHERE ${whereSql}`,
    params
  );

  params.push(pagination.limit);
  params.push(pagination.offset);

  const result = await pool.query(
    `SELECT
      cl.*,
      CASE
        WHEN cl.recipient_type = 'lead' THEN (
          SELECT TRIM(CONCAT(COALESCE(l.first_name, ''), ' ', COALESCE(l.last_name, '')))
          FROM lead l
          WHERE l.id = cl.recipient_id AND l.school_id = cl.school_id
        )
        WHEN cl.recipient_type = 'student' THEN (
          SELECT TRIM(CONCAT(COALESCE(s.first_name, ''), ' ', COALESCE(s.last_name, '')))
          FROM student s
          WHERE s.id = cl.recipient_id AND s.school_id = cl.school_id
        )
        WHEN cl.recipient_type = 'parent' THEN (
          SELECT TRIM(CONCAT(COALESCE(pd.first_name, ''), ' ', COALESCE(pd.last_name, '')))
          FROM parent_detail pd
          WHERE pd.id = cl.recipient_id AND pd.school_id = cl.school_id
        )
        ELSE NULL
      END AS recipient_name,
      u.name AS created_by_name
    FROM communication_log cl
    LEFT JOIN app_user u ON u.id::text = cl.created_by::text AND u.school_id = cl.school_id
    WHERE ${whereSql}
    ORDER BY cl.created_at DESC, cl.id DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    rows: result.rows,
    total: Number.parseInt(countResult.rows[0]?.total || '0', 10),
  };
};

export const getCommunicationLogById = async (communicationId, schoolId) => {
  const result = await pool.query(
    `SELECT *
     FROM communication_log
     WHERE id = $1 AND school_id = $2`,
    [communicationId, schoolId]
  );

  return result.rows[0];
};

export const updateCommunicationStatus = async (communicationId, schoolId, payload) => {
  const result = await pool.query(
    `UPDATE communication_log
     SET
       status = $3,
       delivered_at = COALESCE($4, delivered_at),
       opened_at = COALESCE($5, opened_at),
       clicked_at = COALESCE($6, clicked_at)
     WHERE id = $1 AND school_id = $2
     RETURNING *`,
    [
      communicationId,
      schoolId,
      payload.status,
      payload.delivered_at || null,
      payload.opened_at || null,
      payload.clicked_at || null,
    ]
  );

  return result.rows[0];
};

export const createTemplate = async (schoolId, payload) => {
  const result = await pool.query(
    `INSERT INTO message_template (school_id, name, category, subject, content, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING *`,
    [schoolId, payload.name, payload.category || null, payload.subject || null, payload.content]
  );

  return result.rows[0];
};

export const getTemplates = async (schoolId, category) => {
  const params = [schoolId];
  let sql = `
    SELECT *
    FROM message_template
    WHERE school_id = $1
  `;

  if (category) {
    params.push(category);
    sql += ` AND category = $${params.length}`;
  }

  sql += ' ORDER BY created_at DESC, id DESC';
  const result = await pool.query(sql, params);
  return result.rows;
};

export const updateTemplate = async (templateId, schoolId, payload) => {
  const result = await pool.query(
    `UPDATE message_template
     SET
       name = COALESCE($3, name),
       category = COALESCE($4, category),
       subject = COALESCE($5, subject),
       content = COALESCE($6, content)
     WHERE id = $1 AND school_id = $2
     RETURNING *`,
    [templateId, schoolId, payload.name, payload.category, payload.subject, payload.content]
  );

  return result.rows[0];
};

export const deleteTemplate = async (templateId, schoolId) => {
  const result = await pool.query(
    `DELETE FROM message_template
     WHERE id = $1 AND school_id = $2`,
    [templateId, schoolId]
  );

  return result.rowCount > 0;
};

export const createScheduledEmail = async (payload) => {
  const result = await pool.query(
    `INSERT INTO scheduled_emails (
      school_id,
      sender_id,
      recipient_type,
      recipient_id,
      recipients,
      subject,
      message,
      attachments,
      scheduled_at,
      status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
    RETURNING *`,
    [
      payload.school_id,
      payload.sender_id,
      payload.recipient_type,
      payload.recipient_id,
      payload.recipients,
      payload.subject,
      payload.message,
      JSON.stringify(payload.attachments || []),
      payload.scheduled_at,
      payload.status || 'pending',
    ]
  );

  return result.rows[0];
};

export const getPendingScheduledEmails = async (limit = 50) => {
  const result = await pool.query(
    `SELECT id, school_id, sender_id, recipient_type, recipient_id, recipients, subject, message, attachments, scheduled_at
     FROM scheduled_emails
     WHERE scheduled_at <= NOW()
       AND status = 'pending'
     ORDER BY scheduled_at ASC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
};

export const updateScheduledEmailStatus = async (id, status) => {
  await pool.query(
    `UPDATE scheduled_emails
     SET status = $2
     WHERE id = $1`,
    [id, status]
  );
};

export const createSimpleCommunicationLog = async (payload) => {
  if (!payload?.school_id) {
    throw new Error('school_id is required for communication log insertion.');
  }

  if (!payload?.sender_id) {
    throw new Error('sender_id is required for communication log insertion.');
  }

  if (!payload?.recipient_id) {
    throw new Error('recipient_id is required for communication log insertion.');
  }

  const result = await pool.query(
    `INSERT INTO communication_log (
      school_id,
      created_by,
      recipient_type,
      recipient_id,
      recipient_email,
      channel,
      subject,
      message,
      status,
      attachments
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
     RETURNING *`,
    [
      payload.school_id,
      payload.sender_id,
      payload.recipient_type,
      payload.recipient_id,
      payload.recipient_email,
      'email',
      payload.subject,
      payload.message,
      payload.status || 'sent',
      JSON.stringify(payload.attachments || [])
    ]
  );

  return result.rows[0];
};

export const createCampaign = async (schoolId, payload) => {
  const result = await pool.query(
    `INSERT INTO campaign (school_id, name, channel, status, start_date, end_date, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING *`,
    [
      schoolId,
      payload.name,
      payload.channel,
      payload.status || 'draft',
      payload.start_date || null,
      payload.end_date || null,
    ]
  );

  return result.rows[0];
};

export const getCampaigns = async (schoolId, status) => {
  const params = [schoolId];
  let sql = `
    SELECT *
    FROM campaign
    WHERE school_id = $1
  `;

  if (status) {
    params.push(status);
    sql += ` AND status = $${params.length}`;
  }

  sql += ' ORDER BY created_at DESC, id DESC';
  const result = await pool.query(sql, params);
  return result.rows;
};

export const getCampaignById = async (campaignId, schoolId) => {
  const result = await pool.query(
    `SELECT *
     FROM campaign
     WHERE id = $1 AND school_id = $2`,
    [campaignId, schoolId]
  );

  return result.rows[0];
};

export const updateCampaignStatus = async (campaignId, schoolId, status) => {
  const result = await pool.query(
    `UPDATE campaign
     SET status = $3
     WHERE id = $1 AND school_id = $2
     RETURNING *`,
    [campaignId, schoolId, status]
  );

  return result.rows[0];
};
