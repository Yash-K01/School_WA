import pool from '../config/db.js';

/**
 * Create a new application from lead
 * POST /api/applications
 */
export const createApplication = async (leadId, academicYearId, schoolId) => {
  let client;
  try {
    // Validate inputs
    if (!leadId || !academicYearId || !schoolId) {
      throw new Error(`Missing required fields: leadId=${leadId}, academicYearId=${academicYearId}, schoolId=${schoolId}`);
    }

    console.log(`📝 Creating application - Lead: ${leadId}, Year: ${academicYearId}, School: ${schoolId}`);

    // Use transaction for safety
    client = await pool.connect();
    await client.query('BEGIN');

    // Verify lead exists
    const leadCheck = await client.query('SELECT id FROM lead WHERE id = $1', [leadId]);
    if (leadCheck.rows.length === 0) {
      throw new Error(`Lead with ID ${leadId} not found`);
    }

    // Verify academic year exists
    const yearCheck = await client.query('SELECT id FROM academic_year WHERE id = $1', [academicYearId]);
    if (yearCheck.rows.length === 0) {
      throw new Error(`Academic year with ID ${academicYearId} not found`);
    }

    // Verify school exists
    const schoolCheck = await client.query('SELECT id FROM school WHERE id = $1', [schoolId]);
    if (schoolCheck.rows.length === 0) {
      throw new Error(`School with ID ${schoolId} not found`);
    }

    // Generate a unique application number using timestamp
    const appNumber = `APP-${new Date().getFullYear()}-${Date.now()}`;

    // Create application
    const query = `
      INSERT INTO application (school_id, lead_id, academic_year_id, application_number, current_step, status)
      VALUES ($1, $2, $3, $4, 1, 'in_progress')
      RETURNING id, current_step, status, created_at;
    `;
    
    const result = await client.query(query, [schoolId, leadId, academicYearId, appNumber]);
    const applicationId = result.rows[0].id;

    console.log(`✅ Application created with ID: ${applicationId}`);

    // Note: application_progress tracking is handled separately via migration (app_progress table)

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }
    console.error('❌ Error creating application:', error.message);
    throw new Error(`Failed to create application: ${error.message}`);
  } finally {
    if (client) {
      client.release();
    }
  }
};

/**
 * Get application progress
 * GET /api/applications/:id/progress
 */
export const getApplicationProgress = async (applicationId) => {
  try {
    // Derive progress from current_step on the application table
    // (avoids joining the legacy application_progress table which has wrong column names)
    const query = `
      SELECT 
        a.id,
        a.current_step,
        a.status
      FROM application a
      WHERE a.id = $1;
    `;

    const result = await pool.query(query, [applicationId]);
    if (result.rows.length === 0) {
      throw new Error('Application not found');
    }

    const app = result.rows[0];
    const step = parseInt(app.current_step, 10);

    return {
      id: app.id,
      current_step: step,
      status: app.status,
      steps: {
        student_info:  step > 1 ? 'completed' : 'pending',
        parent_info:   step > 2 ? 'completed' : 'pending',
        academic_info: step > 3 ? 'completed' : 'pending',
        photos:        step > 4 ? 'completed' : 'pending',
        documents:     step > 5 ? 'completed' : 'pending',
        review:        app.status === 'submitted' ? 'completed' : 'pending',
      }
    };
  } catch (error) {
    throw new Error(`Failed to get application progress: ${error.message}`);
  }
};


/**
 * Save student info (Step 1)
 * POST /api/applications/:id/student-info
 */
export const saveStudentInfo = async (applicationId, studentData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log(`📝 Saving Student Info for App: ${applicationId}`);
    
    // Schema columns: application_id, first_name, last_name, middle_name, date_of_birth, gender, blood_group, aadhar_number, phone, email
    const query = `
      INSERT INTO application_student_info
      (application_id, first_name, last_name, middle_name, date_of_birth, gender, blood_group, aadhar_number, phone, email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (application_id) DO UPDATE
      SET first_name = $2, last_name = $3, middle_name = $4, date_of_birth = $5, gender = $6,
          blood_group = $7, aadhar_number = $8, phone = $9, email = $10, updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      applicationId,
      studentData.first_name || 'Student',
      studentData.last_name || studentData.first_name || 'Name',
      studentData.middle_name || null,
      studentData.date_of_birth || studentData.dob || new Date().toISOString().split('T')[0],
      studentData.gender || 'Other',
      studentData.blood_group || null,
      studentData.aadhar_number || null,
      studentData.phone || null,
      studentData.email || null
    ];

    console.log("SQL Values Student:", JSON.stringify(values));
    await client.query(query, values);

    // Advance current_step to 2
    await client.query(
      `UPDATE application SET current_step = GREATEST(current_step, 2), updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [applicationId]
    );

    await client.query('COMMIT');
    return { success: true, message: 'Student info saved' };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ SQL Error in saveStudentInfo:', error.message);
    throw new Error(`Failed to save student info: ${error.message}`);
  } finally {
    client.release();
  }
};

/**
 * Save parent info (Step 2)
 * POST /api/applications/:id/parent-info
 */
export const saveParentInfo = async (applicationId, parentData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log(`📝 Saving Parent Info for App: ${applicationId}`);

    // Map guardian relation carefully due to CHECK constraint
    const allowedRelations = ['Other Relative', 'Family Friend', 'Court Appointed', 'Other'];
    let gRelation = parentData.guardian_relation || 'Other';
    if (!allowedRelations.includes(gRelation)) {
      gRelation = 'Other';
    }

    const primaryContact = parentData.primary_contact_person || parentData.father_name || 'Parent';
    const primaryRelation = parentData.primary_contact_relation || 'Father';
    const primaryPhone = parentData.primary_contact_phone || parentData.father_phone || '0000000000';

    const query = `
      INSERT INTO application_parent_info
      (application_id, father_name, father_occupation, father_phone, father_email,
       mother_name, mother_occupation, mother_phone, mother_email,
       guardian_name, guardian_relation, guardian_phone, guardian_email,
       primary_contact_person, primary_contact_relation, primary_contact_phone,
       address, city, state, postal_code, income_range)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      ON CONFLICT (application_id) DO UPDATE
      SET father_name = $2, father_occupation = $3, father_phone = $4, father_email = $5,
          mother_name = $6, mother_occupation = $7, mother_phone = $8, mother_email = $9,
          guardian_name = $10, guardian_relation = $11, guardian_phone = $12, guardian_email = $13,
          primary_contact_person = $14, primary_contact_relation = $15, primary_contact_phone = $16,
          address = $17, city = $18, state = $19, postal_code = $20, income_range = $21,
          updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      applicationId,
      parentData.father_name || null,
      parentData.father_occupation || null,
      parentData.father_phone || null,
      parentData.father_email || null,
      parentData.mother_name || null,
      parentData.mother_occupation || null,
      parentData.mother_phone || null,
      parentData.mother_email || null,
      parentData.guardian_name || null,
      gRelation,
      parentData.guardian_phone || null,
      parentData.guardian_email || null,
      primaryContact,
      primaryRelation,
      primaryPhone,
      parentData.address || null,
      parentData.city || null,
      parentData.state || null,
      parentData.postal_code || null,
      parentData.income_range || null
    ];

    console.log("SQL Values Parent:", JSON.stringify(values));
    await client.query(query, values);

    // Advance current_step to 3
    await client.query(
      `UPDATE application SET current_step = GREATEST(current_step, 3), updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [applicationId]
    );

    await client.query('COMMIT');
    return { success: true, message: 'Parent info saved' };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ SQL Error in saveParentInfo:', error.message);
    throw new Error(`Failed to save parent info: ${error.message}`);
  } finally {
    client.release();
  }
};

/**
 * Save academic info (Step 3)
 * POST /api/applications/:id/academic-info
 */
export const saveAcademicInfo = async (applicationId, academicData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log(`📝 Saving Academic Info for App: ${applicationId}`);

    // If desired_class is still not specified, try to get it from lead
    let desiredClass = academicData.desired_class;
    if (!desiredClass || desiredClass === 'Not specified') {
      const leadInfo = await client.query(
        'SELECT desired_class FROM lead l JOIN application a ON a.lead_id = l.id WHERE a.id = $1',
        [applicationId]
      );
      if (leadInfo.rows.length > 0) {
        desiredClass = leadInfo.rows[0].desired_class;
      }
    }

    const query = `
      INSERT INTO application_academic_info
      (application_id, desired_class, previous_school, previous_class, marks_percentage, extracurricular_activities, achievements)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (application_id) DO UPDATE
      SET desired_class = $2, previous_school = $3, previous_class = $4, marks_percentage = $5,
          extracurricular_activities = $6, achievements = $7, updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      applicationId,
      desiredClass || 'K-01',
      academicData.previous_school || null,
      academicData.previous_class || null,
      academicData.percentage || academicData.marks_percentage || null,
      academicData.subjects || null, // Using subjects as extracurriculars for now
      academicData.strengths || null  // Using strengths as achievements for now
    ];

    console.log("SQL Values Academic:", JSON.stringify(values));
    await client.query(query, values);

    // Advance current_step to 4
    await client.query(
      `UPDATE application SET current_step = GREATEST(current_step, 4), updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [applicationId]
    );

    await client.query('COMMIT');
    return { success: true, message: 'Academic info saved' };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ SQL Error in saveAcademicInfo:', error.message);
    throw new Error(`Failed to save academic info: ${error.message}`);
  } finally {
    client.release();
  }
};

/**
 * Save documents (Step 5)
 * POST /api/applications/:id/documents
 */
export const saveDocuments = async (applicationId, documents) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete existing documents for this application
    await client.query(
      `DELETE FROM application_documents WHERE application_id = $1`,
      [applicationId]
    );

    // Insert new documents
    // Schema: application_id, document_type, file_name (NOT NULL), file_path (NOT NULL), file_size, mime_type
    for (const doc of documents) {
      const fileName = doc.file_name || doc.file_path?.split('/').pop() || 'document';
      await client.query(
        `INSERT INTO application_documents
         (application_id, document_type, file_name, file_path, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [applicationId, doc.document_type, fileName, doc.file_path || '', doc.file_size || null, doc.mime_type || null]
      );
    }

    // Advance current_step to 6
    await client.query(
      `UPDATE application SET current_step = GREATEST(current_step, 6), updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [applicationId]
    );

    await client.query('COMMIT');
    return { success: true, message: 'Documents saved' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Failed to save documents: ${error.message}`);
  } finally {
    client.release();
  }
};

/**
 * Submit application (Step 6)
 * POST /api/applications/:id/submit
 */
export const submitApplication = async (applicationId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update application status to submitted
    await client.query(
      `UPDATE application SET status = 'submitted', current_step = 6, submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [applicationId]
    );

    await client.query('COMMIT');
    return { success: true, message: 'Application submitted' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Failed to submit application: ${error.message}`);
  } finally {
    client.release();
  }
};

/**
 * Get application details for prefill
 */
export const getApplicationDetails = async (applicationId) => {
  try {
    const appQuery = `
      SELECT a.*, l.first_name, l.last_name, l.email, l.phone, l.desired_class
      FROM application a
      LEFT JOIN lead l ON a.lead_id = l.id
      WHERE a.id = $1
    `;
    const app = await pool.query(appQuery, [applicationId]);

    const studentQuery = `SELECT * FROM application_student_info WHERE application_id = $1`;
    const student = await pool.query(studentQuery, [applicationId]);

    const parentQuery = `SELECT * FROM application_parent_info WHERE application_id = $1`;
    const parent = await pool.query(parentQuery, [applicationId]);

    const academicQuery = `SELECT * FROM application_academic_info WHERE application_id = $1`;
    const academic = await pool.query(academicQuery, [applicationId]);

    return {
      application: app.rows[0],
      student_info: student.rows[0] || {},
      parent_info: parent.rows[0] || {},
      academic_info: academic.rows[0] || {}
    };
  } catch (error) {
    throw new Error(`Failed to get application details: ${error.message}`);
  }
};
