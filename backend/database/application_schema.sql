-- ============================================================================
-- APPLICATION MULTI-STEP FORM SCHEMA
-- ============================================================================
-- Tracks application progress through multi-step form system
-- Create application main table
CREATE TABLE IF NOT EXISTS application (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES school(id) ON DELETE CASCADE,
  lead_id BIGINT REFERENCES lead(id) ON DELETE
  SET NULL,
    student_id BIGINT REFERENCES student(id) ON DELETE
  SET NULL,
    academic_year_id BIGINT NOT NULL REFERENCES academic_year(id) ON DELETE CASCADE,
    -- Step tracking
    current_step INT DEFAULT 1 CHECK (
      current_step >= 1
      AND current_step <= 6
    ),
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (
      status IN (
        'in_progress',
        'submitted',
        'approved',
        'rejected',
        'on_hold'
      )
    ),
    -- Auto-fill fields
    admission_type VARCHAR(50) CHECK (
      admission_type IN ('new', 'transfer', 'sibling', 're-admission')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    UNIQUE(academic_year_id, lead_id)
);
CREATE INDEX idx_application_school_id ON application(school_id);
CREATE INDEX idx_application_lead_id ON application(lead_id);
CREATE INDEX idx_application_student_id ON application(student_id);
CREATE INDEX idx_application_academic_year_id ON application(academic_year_id);
CREATE INDEX idx_application_status ON application(status);
-- ============================================================================
-- APPLICATION PROGRESS TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS application_progress (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  application_id BIGINT NOT NULL UNIQUE REFERENCES application(id) ON DELETE CASCADE,
  -- Step statuses
  step_1_student_info VARCHAR(20) DEFAULT 'pending' CHECK (
    step_1_student_info IN ('pending', 'in_progress', 'completed')
  ),
  step_2_parent_info VARCHAR(20) DEFAULT 'pending' CHECK (
    step_2_parent_info IN ('pending', 'in_progress', 'completed')
  ),
  step_3_academic_info VARCHAR(20) DEFAULT 'pending' CHECK (
    step_3_academic_info IN ('pending', 'in_progress', 'completed')
  ),
  step_4_photos VARCHAR(20) DEFAULT 'pending' CHECK (
    step_4_photos IN ('pending', 'in_progress', 'completed')
  ),
  step_5_documents VARCHAR(20) DEFAULT 'pending' CHECK (
    step_5_documents IN ('pending', 'in_progress', 'completed')
  ),
  step_6_review VARCHAR(20) DEFAULT 'pending' CHECK (
    step_6_review IN ('pending', 'in_progress', 'completed')
  ),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_application_progress_application_id ON application_progress(application_id);
-- ============================================================================
-- STEP 1: STUDENT INFO
-- ============================================================================
CREATE TABLE IF NOT EXISTS application_student_info (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  application_id BIGINT NOT NULL UNIQUE REFERENCES application(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  middle_name VARCHAR(100),
  dob DATE,
  gender VARCHAR(20),
  blood_group VARCHAR(10),
  nationality VARCHAR(100),
  religion VARCHAR(100),
  aadhar_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_app_student_info_app_id ON application_student_info(application_id);
-- ============================================================================
-- STEP 2: PARENT INFO
-- ============================================================================
CREATE TABLE IF NOT EXISTS application_parent_info (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  application_id BIGINT NOT NULL UNIQUE REFERENCES application(id) ON DELETE CASCADE,
  -- Father info
  father_name VARCHAR(150),
  father_occupation VARCHAR(100),
  father_phone VARCHAR(20),
  father_email VARCHAR(100),
  father_aadhar VARCHAR(20),
  -- Mother info
  mother_name VARCHAR(150),
  mother_occupation VARCHAR(100),
  mother_phone VARCHAR(20),
  mother_email VARCHAR(100),
  mother_aadhar VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_app_parent_info_app_id ON application_parent_info(application_id);
-- ============================================================================
-- STEP 3: ACADEMIC INFO
-- ============================================================================
CREATE TABLE IF NOT EXISTS application_academic_info (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  application_id BIGINT NOT NULL UNIQUE REFERENCES application(id) ON DELETE CASCADE,
  grade_applied_for VARCHAR(50),
  previous_school VARCHAR(255),
  previous_grade VARCHAR(50),
  previous_board VARCHAR(100),
  -- Address
  street_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_app_academic_info_app_id ON application_academic_info(application_id);
-- ============================================================================
-- STEP 4: PHOTOS & IDENTITY
-- ============================================================================
CREATE TABLE IF NOT EXISTS application_photos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  application_id BIGINT NOT NULL REFERENCES application(id) ON DELETE CASCADE,
  photo_type VARCHAR(100),
  -- 'student_photo', 'student_aadhar', 'father_photo', 'father_aadhar', 'mother_photo', 'mother_aadhar'
  file_path VARCHAR(500),
  file_size INT,
  mime_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_app_photos_app_id ON application_photos(application_id);
CREATE INDEX idx_app_photos_photo_type ON application_photos(photo_type);
-- ============================================================================
-- STEP 5: DOCUMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS application_documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  application_id BIGINT NOT NULL REFERENCES application(id) ON DELETE CASCADE,
  document_type VARCHAR(100),
  -- 'birth_certificate', 'address_proof', 'school_records', 'transfer_certificate'
  file_path VARCHAR(500),
  file_size INT,
  mime_type VARCHAR(50),
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_app_documents_app_id ON application_documents(application_id);
CREATE INDEX idx_app_documents_type ON application_documents(document_type);
-- ============================================================================
-- TRIGGERS & CONSTRAINTS
-- ============================================================================
-- Update application updated_at on progress change
CREATE OR REPLACE FUNCTION update_application_timestamp() RETURNS TRIGGER AS $$ BEGIN
UPDATE application
SET updated_at = CURRENT_TIMESTAMP
WHERE id = NEW.application_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_app_on_progress_change
AFTER
UPDATE ON application_progress FOR EACH ROW EXECUTE FUNCTION update_application_timestamp();
-- Similar triggers for all step tables
CREATE TRIGGER trigger_update_app_on_student_info
AFTER
INSERT
  OR
UPDATE ON application_student_info FOR EACH ROW EXECUTE FUNCTION update_application_timestamp();
CREATE TRIGGER trigger_update_app_on_parent_info
AFTER
INSERT
  OR
UPDATE ON application_parent_info FOR EACH ROW EXECUTE FUNCTION update_application_timestamp();
CREATE TRIGGER trigger_update_app_on_academic_info
AFTER
INSERT
  OR
UPDATE ON application_academic_info FOR EACH ROW EXECUTE FUNCTION update_application_timestamp();