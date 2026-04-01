import * as applicationService from '../services/applicationService.js';

/**
 * Create application from lead
 * POST /api/applications
 */
export const createApplication = async (req, res) => {
  try {
    const { lead_id, academic_year_id } = req.body;
    const { school_id, id: user_id } = req.user; // From authenticated request

    console.log(`📨 POST /api/applications - User: ${user_id}, School: ${school_id}`);
    console.log(`   Body: lead_id=${lead_id}, academic_year_id=${academic_year_id}`);

    if (!lead_id || !academic_year_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: lead_id and academic_year_id are required'
      });
    }

    if (!school_id) {
      console.error('❌ school_id not found in token!', req.user);
      return res.status(401).json({
        success: false,
        message: 'Authentication error: school_id not found in JWT token'
      });
    }

    const result = await applicationService.createApplication(lead_id, academic_year_id, school_id);
    
    console.log(`✅ Application created: ${result.id}`);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Application created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating application:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create application'
    });
  }
};

/**
 * Get application progress
 * GET /api/applications/:id/progress
 */
export const getApplicationProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await applicationService.getApplicationProgress(id);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching application progress:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Application not found'
    });
  }
};

/**
 * Save student info
 * POST /api/applications/:id/student-info
 */
export const saveStudentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📨 POST /api/applications/${id}/student-info`);
    console.log("Incoming Body:", JSON.stringify(req.body, null, 2));

    const {
      first_name, last_name, middle_name, date_of_birth, dob,
      gender, blood_group, aadhar_number, student_phone, student_email
    } = req.body;

    const studentData = {
      first_name: first_name || req.body.firstName,
      last_name: last_name || req.body.lastName,
      middle_name: middle_name || req.body.middleName,
      date_of_birth: dob || date_of_birth || req.body.dateOfBirth,
      gender: gender,
      blood_group: blood_group || req.body.bloodGroup,
      aadhar_number: aadhar_number || req.body.aadharNumber,
      phone: student_phone || req.body.phone,
      email: student_email || req.body.email
    };

    console.log("Mapped Student Data:", studentData);

    await applicationService.saveStudentInfo(id, studentData);
    res.json({
      success: true,
      message: 'Student information saved successfully'
    });
  } catch (error) {
    console.error('❌ Error saving student info:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Save parent info
 * POST /api/applications/:id/parent-info
 */
export const saveParentInfo = async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    // Log incoming request body for debugging
    console.log("Received:", req.body);

    // Destructure and map frontend fields to DB fields
    const {
      fatherName, fatherOccupation, fatherPhone, fatherEmail,
      motherName, motherOccupation, motherPhone, motherEmail,
      guardianName, guardianRelation, guardianPhone, guardianEmail,
      primaryContactPerson, primaryContactRelation, primaryContactPhone,
      address, city, state, postalCode, incomeRange
    } = req.body;

    // Validation
    if (!fatherName || !primaryContactPerson || !primaryContactPhone) {
      return res.status(400).json({
        success: false,
        message: "fatherName, primaryContactPerson, and primaryContactPhone are required"
      });
    }
    if (fatherPhone && !/^[0-9]{10}$/.test(fatherPhone)) {
      return res.status(400).json({ success: false, message: "Father phone must be 10 digits" });
    }
    if (fatherEmail && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(fatherEmail)) {
      return res.status(400).json({ success: false, message: "Invalid father email" });
    }

    // Prepare DB payload (Snake Case)
    const parentData = {
      father_name: fatherName,
      father_occupation: fatherOccupation,
      father_phone: fatherPhone,
      father_email: fatherEmail,
      mother_name: motherName,
      mother_occupation: motherOccupation,
      mother_phone: motherPhone,
      mother_email: motherEmail,
      guardian_name: guardianName,
      guardian_relation: guardianRelation,
      guardian_phone: guardianPhone,
      guardian_email: guardianEmail,
      primary_contact_person: primaryContactPerson,
      primary_contact_relation: primaryContactRelation,
      primary_contact_phone: primaryContactPhone,
      address,
      city,
      state,
      postal_code: postalCode,
      income_range: incomeRange
    };

    console.log("Mapped Parent Data:", parentData);

    await applicationService.saveParentInfo(applicationId, parentData);
    res.json({
      success: true,
      message: 'Parent information saved successfully'
    });
  } catch (error) {
    console.error('Error saving parent info:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Save academic info
 * POST /api/applications/:id/academic-info
 */
export const saveAcademicInfo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📨 POST /api/applications/${id}/academic-info`);
    console.log("Incoming Body:", JSON.stringify(req.body, null, 2));

    const {
      desired_class, desiredClass, grade_applied_for, gradeAppliedFor,
      previous_school, previousSchool,
      previous_class, previousClass, previous_grade, previousGrade,
      percentage, gpa,
      subjects, strengths, areas_to_improve
    } = req.body;

    const academicData = {
      desired_class: desired_class || desiredClass || grade_applied_for || gradeAppliedFor,
      previous_school: previous_school || previousSchool,
      previous_class: previous_class || previousClass || previous_grade || previousGrade,
      percentage: percentage || gpa,
      subjects: subjects,
      strengths: strengths,
      areas_to_improve: areas_to_improve
    };

    console.log("Mapped Academic Data:", academicData);

    await applicationService.saveAcademicInfo(id, academicData);
    res.json({
      success: true,
      message: 'Academic information saved successfully'
    });
  } catch (error) {
    console.error('❌ Error saving academic info:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Save documents
 * POST /api/applications/:id/documents
 */
export const saveDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { documents } = req.body;

    await applicationService.saveDocuments(id, documents);
    res.json({
      success: true,
      message: 'Documents saved successfully'
    });
  } catch (error) {
    console.error('Error saving documents:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Submit application
 * POST /api/applications/:id/submit
 */
export const submitApplication = async (req, res) => {
  try {
    const { id } = req.params;

    await applicationService.submitApplication(id);
    res.json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get application details
 * GET /api/applications/:id/details
 */
export const getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await applicationService.getApplicationDetails(id);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};
