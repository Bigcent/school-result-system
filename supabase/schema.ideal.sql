-- ============================================================
-- GRADORA — SCHOOL RESULT SYSTEM
-- DATABASE BLUEPRINT (IDEAL / TARGET STATE)
-- ============================================================
-- This file describes the database as it SHOULD be before a
-- second paying school is onboarded.
--
-- The ONLY difference from schema.real.sql is security:
-- here, Row Level Security (RLS) is turned ON, with policies
-- that stop one school from ever seeing another school's data.
--
-- ⚠️  DO NOT run this whole file against the live database.
--     The tables already exist. This file is a TARGET + a
--     step-by-step plan. The section you will actually run,
--     when ready, is "PART 2: SECURITY" — and even that
--     should be run carefully, ideally one table at a time
--     with testing in between. See the RUNBOOK at the bottom.
--
-- Last updated: 2026-06-27
-- ============================================================


-- ============================================================
-- PART 1: STRUCTURE
-- ============================================================
-- The table structure is identical to schema.real.sql.
-- It is intentionally NOT repeated here to avoid two files
-- drifting apart. For the table/column definitions, see:
--     schema.real.sql
--
-- This file focuses only on what changes: SECURITY.
-- ============================================================


-- ============================================================
-- PART 2: SECURITY (Row Level Security)
-- ============================================================
-- HOW THIS WORKS (plain English):
--
-- Every logged-in user has an ID from Supabase Auth, available
-- inside the database as  auth.uid().
--
-- Our "users" table maps each auth.uid() to a school_id.
--
-- So the core question — "which school does this user belong
-- to?" — is answered by this small lookup:
--
--     SELECT school_id FROM users WHERE id = auth.uid()
--
-- Every policy below uses that same idea: a user may only
-- touch rows that trace back to THEIR school.
--
-- A helper function keeps the policies short and readable.
-- ============================================================


-- ------------------------------------------------------------
-- 2.0  Helper function: the current user's school_id
-- ------------------------------------------------------------
-- SECURITY DEFINER lets this function read the users table
-- without being blocked by RLS on that table (avoids an
-- infinite loop where checking users requires checking users).
CREATE OR REPLACE FUNCTION current_school_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid()
$$;


-- ------------------------------------------------------------
-- 2.1  Turn RLS ON for every table
-- ------------------------------------------------------------
ALTER TABLE schools           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms             ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores            ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance        ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_ratings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes      ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- 2.2  USERS table
-- ------------------------------------------------------------
-- A user can read their own row (needed so the app can look
-- up their school_id and role right after login).
CREATE POLICY users_select_self ON users
  FOR SELECT USING (id = auth.uid());

-- A user can read other users in the same school (e.g. an
-- admin listing teachers). Uses the helper.
CREATE POLICY users_select_same_school ON users
  FOR SELECT USING (school_id = current_school_id());

-- A user can insert their own row during signup (the app
-- inserts id = the new auth user's id).
CREATE POLICY users_insert_self ON users
  FOR INSERT WITH CHECK (id = auth.uid());


-- ------------------------------------------------------------
-- 2.3  SCHOOLS table
-- ------------------------------------------------------------
-- A user can see and edit only their own school.
CREATE POLICY schools_same_school ON schools
  FOR ALL
  USING (id = current_school_id())
  WITH CHECK (id = current_school_id());


-- ------------------------------------------------------------
-- 2.4  Tables that hold school_id DIRECTLY
--       (classes, students, sessions)
-- ------------------------------------------------------------
CREATE POLICY classes_same_school ON classes
  FOR ALL
  USING (school_id = current_school_id())
  WITH CHECK (school_id = current_school_id());

CREATE POLICY students_same_school ON students
  FOR ALL
  USING (school_id = current_school_id())
  WITH CHECK (school_id = current_school_id());

CREATE POLICY sessions_same_school ON sessions
  FOR ALL
  USING (school_id = current_school_id())
  WITH CHECK (school_id = current_school_id());


-- ------------------------------------------------------------
-- 2.5  Tables that reach a school THROUGH A PARENT
-- ------------------------------------------------------------
-- terms  ->  session  ->  school
CREATE POLICY terms_same_school ON terms
  FOR ALL
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE school_id = current_school_id()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE school_id = current_school_id()
    )
  );

-- subjects  ->  class  ->  school
CREATE POLICY subjects_same_school ON subjects
  FOR ALL
  USING (
    class_id IN (
      SELECT id FROM classes WHERE school_id = current_school_id()
    )
  )
  WITH CHECK (
    class_id IN (
      SELECT id FROM classes WHERE school_id = current_school_id()
    )
  );

-- scores  ->  student  ->  school
CREATE POLICY scores_same_school ON scores
  FOR ALL
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = current_school_id()
    )
  )
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE school_id = current_school_id()
    )
  );

-- attendance  ->  student  ->  school
CREATE POLICY attendance_same_school ON attendance
  FOR ALL
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = current_school_id()
    )
  )
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE school_id = current_school_id()
    )
  );

-- character_ratings  ->  student  ->  school
CREATE POLICY character_ratings_same_school ON character_ratings
  FOR ALL
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = current_school_id()
    )
  )
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE school_id = current_school_id()
    )
  );

-- skill_ratings  ->  student  ->  school
CREATE POLICY skill_ratings_same_school ON skill_ratings
  FOR ALL
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id = current_school_id()
    )
  )
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE school_id = current_school_id()
    )
  );


-- ------------------------------------------------------------
-- 2.6  ACCESS_CODES table  (SPECIAL — read carefully)
-- ------------------------------------------------------------
-- Access codes are created by YOU (the server, using the
-- service role key) BEFORE a school exists, and are checked
-- during signup BEFORE the user has a school_id.
--
-- The service role key BYPASSES RLS entirely, so your
-- server-side code (verify-payment route, signup checks that
-- run on the server) keeps working regardless of the policy
-- below.
--
-- Therefore we deliberately add NO permissive policy for
-- normal logged-in users here. With RLS on and no policy,
-- ordinary users get NO access — which is exactly what we
-- want: access codes must never be readable by regular users.
--
-- ⚠️ IMPORTANT: this assumes access-code checks happen on the
-- SERVER (service role), not in the browser (anon key). If any
-- access-code lookup currently runs in browser code with the
-- anon key, it will STOP working when RLS is enabled here.
-- That lookup must be moved to a server route first.
-- (This is a known thing to verify before enabling — see the
-- RUNBOOK step 0.)


-- ============================================================
-- RUNBOOK — how to actually turn this on safely, later
-- ============================================================
-- Do NOT run this whole file. Instead, when you're ready for
-- the dedicated "enable RLS" session, work in this order:
--
-- STEP 0 — PREP (before touching anything)
--   • Confirm access-code checks run on the SERVER (service
--     role), not in the browser. If any run in the browser,
--     move them server-side first.
--   • Make sure you can log in as a test user and view the
--     dashboard, scores, and results pages. This is your
--     "before" picture.
--
-- STEP 1 — Create the helper function (section 2.0). Safe.
--
-- STEP 2 — Enable RLS + add policies for ONE table only,
--   starting with a low-risk one like "schools".
--   Then immediately test the app. Does the dashboard still
--   load your school? If yes, continue. If it goes blank,
--   you can instantly undo with:
--       ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
--
-- STEP 3 — Repeat table by table: students, classes,
--   subjects, sessions, terms, scores, attendance,
--   character_ratings, skill_ratings, users, access_codes.
--   Test the app after EACH table. Never do all at once.
--
-- STEP 4 — Full walk-through as a normal logged-in user:
--   • dashboard loads
--   • students list loads
--   • scores entry loads AND saves
--   • results/report cards generate
--   • login and signup still work
--
-- STEP 5 — The real test: create a SECOND test school with a
--   second login, add a student to each, and confirm neither
--   login can see the other's student. That proves the wall
--   works.
--
-- ROLLBACK for any table (instant, safe):
--   ALTER TABLE <table_name> DISABLE ROW LEVEL SECURITY;
-- ============================================================