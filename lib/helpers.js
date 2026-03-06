// ─── Grading Scale (Customizable per school) ───
export const GRADE_SCALE = [
  { min: 70, grade: "A", remark: "Excellent" },
  { min: 60, grade: "B", remark: "Very Good" },
  { min: 50, grade: "C", remark: "Good" },
  { min: 40, grade: "D", remark: "Fair" },
  { min: 0, grade: "F", remark: "Needs Improvement" },
];

export function getGrade(score) {
  for (const g of GRADE_SCALE) {
    if (score >= g.min) return g;
  }
  return GRADE_SCALE[GRADE_SCALE.length - 1];
}

export function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Rank students by grand total, handling ties ───
export function rankStudents(studentsWithTotals) {
  const sorted = [...studentsWithTotals].sort(
    (a, b) => (b.grandTotal || 0) - (a.grandTotal || 0)
  );

  let currentRank = 1;
  return sorted.map((student, idx) => {
    if (idx > 0 && sorted[idx - 1].grandTotal === student.grandTotal) {
      // Same rank as previous (tie)
      return { ...student, position: sorted[idx - 1].position };
    }
    currentRank = idx + 1;
    return { ...student, position: currentRank };
  });
}

// ─── Compute student results across all subjects ───
export function computeClassResults(students, subjects, scores) {
  const withTotals = students.map((student) => {
    let grandTotal = 0;
    let subjectCount = 0;

    const subjectResults = subjects.map((subject) => {
      const key = `${student.id}-${subject.id}`;
      const score = scores[key];

      if (!score) {
        return { subject: subject.name, subjectId: subject.id, total: null, grade: null, remark: null, test1: null, test2: null, exam: null };
      }

      const t1 = score.test1 ?? 0;
      const t2 = score.test2 ?? 0;
      const ex = score.exam ?? 0;
      const total = t1 + t2 + ex;

      grandTotal += total;
      subjectCount++;

      const gradeInfo = getGrade(total);
      return {
        subject: subject.name,
        subjectId: subject.id,
        test1: t1,
        test2: t2,
        exam: ex,
        total,
        grade: gradeInfo.grade,
        remark: gradeInfo.remark,
      };
    });

    const average =
      subjectCount > 0 ? parseFloat((grandTotal / subjectCount).toFixed(1)) : null;

    return {
      ...student,
      subjectResults,
      grandTotal,
      average,
      subjectCount,
    };
  });

  return rankStudents(withTotals);
}
