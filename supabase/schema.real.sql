-- ============================================================
-- GRADORA — SCHOOL RESULT SYSTEM
-- DATABASE BLUEPRINT (REAL STATE)
-- ============================================================
-- This file describes the database EXACTLY as it currently
-- exists in the live Supabase project.
--
-- It is an honest record of reality, including the fact that
-- Row Level Security (RLS) is currently OFF on every table.
--
-- For the "safe / production-ready" target version (RLS ON
-- with policies), see: schema.ideal.sql
--
-- Last reconciled with live DB: 2026-06-27
-- ============================================================


-- ============================================================
-- CORE STRUCTURE
-- ============================================================

-- Schools (the top-level tenant — one row per school)
CREATE TABLE schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  motto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Report card appearance / behaviour settings
  theme TEXT DEFAULT 'royal',
  show_position BOOLEAN DEFAULT true,   -- show class position on report?
  logo_url TEXT,                        -- link to logo in Storage
  show_fees BOOLEAN DEFAULT true,       -- show fees-paid status?

  -- Default maximum marks (a subject can override these)
  test1_max INTEGER DEFAULT 20,
  test2_max INTEGER DEFAULT 20,
  exam_max  INTEGER DEFAULT 60,

  -- Plan / subscription limits
  max_students_total INTEGER DEFAULT 50,
  subscription_expires_at TIMESTAMPTZ
);

-- Academic sessions (e.g. "2024/2025")
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Terms (1st / 2nd / 3rd) within a session
CREATE TABLE terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  days_opened INTEGER DEFAULT 0,        -- total school days this term
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes (e.g. "Primary 1")
CREATE TABLE classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects (belong to a class)
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Optional per-subject max marks. If NULL, the school
  -- default (schools.test1_max etc.) is used instead.
  test1_max INTEGER,
  test2_max INTEGER,
  exam_max  INTEGER
);

-- Students
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT,                          -- free text in live DB (no CHECK)
  admission_number TEXT,
  fees_paid BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- ACADEMIC RECORDS
-- ============================================================

-- Scores (the core academic table)
-- NOTE: there is NO generated "total" column in the live DB.
-- Totals are calculated in the app code, not the database.
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  term_id UUID REFERENCES terms(id) ON DELETE CASCADE,
  test1 INTEGER DEFAULT 0,
  test2 INTEGER DEFAULT 0,
  exam  INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, term_id)
);

-- Attendance (days present, per student per term)
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  term_id UUID REFERENCES terms(id) ON DELETE CASCADE,
  days_present INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character ratings (e.g. Punctuality, Neatness) — 1 row per trait
CREATE TABLE character_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  term_id UUID REFERENCES terms(id) ON DELETE CASCADE,
  trait TEXT NOT NULL,
  rating INTEGER DEFAULT 0
);

-- Skill ratings (e.g. Handwriting, Drawing) — 1 row per skill
CREATE TABLE skill_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  term_id UUID REFERENCES terms(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  rating INTEGER DEFAULT 0
);


-- ============================================================
-- ACCESS & USERS
-- ============================================================

-- Access codes (generated after payment; used to onboard a school)
CREATE TABLE access_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR NOT NULL,
  plan VARCHAR NOT NULL DEFAULT 'basic',
  max_classes INTEGER,
  max_students_per_class INTEGER,
  max_students_total INTEGER DEFAULT 50,
  can_print BOOLEAN DEFAULT true,
  used BOOLEAN DEFAULT false,
  used_by UUID,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 days'),
  notes TEXT
);

-- Users (teacher/admin logins — linked to Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY,                  -- matches auth.users(id)
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,                   -- 'admin' or 'teacher' (no CHECK in live DB)
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- INDEXES (performance helpers)
-- ============================================================
CREATE INDEX idx_students_class   ON students(class_id);
CREATE INDEX idx_students_school  ON students(school_id);
CREATE INDEX idx_scores_student   ON scores(student_id);
CREATE INDEX idx_scores_subject   ON scores(subject_id);
CREATE INDEX idx_scores_term      ON scores(term_id);
CREATE INDEX idx_subjects_class   ON subjects(class_id);


-- ============================================================
-- SECURITY STATUS (IMPORTANT)
-- ============================================================
-- Row Level Security (RLS) is currently OFF on ALL tables.
--
-- This means the database does NOT enforce school-to-school
-- data separation. Right now, the app code is the only thing
-- keeping one school's data separate from another's.
--
-- This is acceptable while there is effectively one tenant,
-- but MUST be fixed before onboarding a second paying school.
--
-- The "turn RLS on safely" plan lives in: schema.ideal.sql
-- ============================================================