-- ============================================
-- SCHOOL RESULT SYSTEM - DATABASE SETUP
-- ============================================
-- Run this ENTIRE script in Supabase SQL Editor:
-- 1. Go to your Supabase project
-- 2. Click "SQL Editor" in the sidebar
-- 3. Paste this entire file
-- 4. Click "Run"
-- ============================================

-- Schools table
CREATE TABLE schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  motto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic sessions (e.g., 2024/2025)
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "2024/2025"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Terms (1st, 2nd, 3rd)
CREATE TABLE terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "1st Term", "2nd Term", "3rd Term"
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes
CREATE TABLE classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Primary 1", "Primary 2"
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects per class
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "English", "Mathematics"
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('M', 'F')),
  admission_number TEXT,
  fees_paid BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores (the core table)
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  term_id UUID REFERENCES terms(id) ON DELETE CASCADE,
  test1 INTEGER DEFAULT 0 CHECK (test1 >= 0 AND test1 <= 20),
  test2 INTEGER DEFAULT 0 CHECK (test2 >= 0 AND test2 <= 20),
  exam INTEGER DEFAULT 0 CHECK (exam >= 0 AND exam <= 60),
  total INTEGER GENERATED ALWAYS AS (test1 + test2 + exam) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, term_id)
);

-- Users (for teacher/admin login - linked to Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_scores_student ON scores(student_id);
CREATE INDEX idx_scores_subject ON scores(subject_id);
CREATE INDEX idx_scores_term ON scores(term_id);
CREATE INDEX idx_subjects_class ON subjects(class_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see data from their school
CREATE POLICY "Users see own school" ON schools
  FOR ALL USING (
    id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users see own school sessions" ON sessions
  FOR ALL USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users see own school terms" ON terms
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE school_id IN (SELECT school_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Users see own school classes" ON classes
  FOR ALL USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users see own school subjects" ON subjects
  FOR ALL USING (
    class_id IN (SELECT id FROM classes WHERE school_id IN (SELECT school_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Users see own school students" ON students
  FOR ALL USING (
    school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users see own school scores" ON scores
  FOR ALL USING (
    student_id IN (
      SELECT id FROM students WHERE school_id IN (
        SELECT school_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users see own profile" ON users
  FOR ALL USING (id = auth.uid());

-- ============================================
-- SEED DATA (Demo school for testing)
-- ============================================
-- You can remove this after testing

-- Insert demo school
INSERT INTO schools (id, name, address, motto)
VALUES ('00000000-0000-0000-0000-000000000001', 'Bright Future Academy', 'Asaba, Delta State', 'Excellence in Learning');

-- Insert session
INSERT INTO sessions (id, school_id, name, is_active)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2024/2025', true);

-- Insert terms
INSERT INTO terms (id, session_id, name, is_active) VALUES
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', '1st Term', false),
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002', '2nd Term', true),
('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', '3rd Term', false);

-- Insert classes
INSERT INTO classes (id, school_id, name, sort_order) VALUES
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Primary 1', 1),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Primary 2', 2),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Primary 3', 3);

-- Insert subjects for Primary 1
INSERT INTO subjects (id, class_id, name, sort_order) VALUES
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000003', 'English', 1),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000003', 'Mathematics', 2),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000003', 'Basic Science', 3),
('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000003', 'Social Studies', 4),
('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000003', 'Civic Education', 5),
('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000003', 'Computer', 6),
('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000003', 'CRK', 7),
('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000003', 'Handwriting', 8);

-- Insert sample students for Primary 1
INSERT INTO students (id, school_id, class_id, first_name, last_name, gender, admission_number, fees_paid) VALUES
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Adaeze', 'Okonkwo', 'F', 'BFA/001', true),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Chukwuma', 'Eze', 'M', 'BFA/002', true),
('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Blessing', 'Ogbonna', 'F', 'BFA/003', false),
('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'David', 'Nwachukwu', 'M', 'BFA/004', true),
('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Esther', 'Okoro', 'F', 'BFA/005', true),
('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Francis', 'Amadi', 'M', 'BFA/006', false),
('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Grace', 'Iheanacho', 'F', 'BFA/007', true),
('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Henry', 'Obi', 'M', 'BFA/008', true);

-- ============================================
-- DONE! Your database is ready.
-- ============================================
