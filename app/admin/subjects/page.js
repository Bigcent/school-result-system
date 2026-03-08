"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Master subject library for Nigerian primary schools
const SUBJECT_LIBRARY = [
  "English Language",
  "Mathematics",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Civic Education",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Computer Studies / ICT",
  "Agricultural Science",
  "Home Economics",
  "Physical & Health Education",
  "Creative Arts",
  "Music",
  "French",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Handwriting",
  "Verbal Reasoning",
  "Quantitative Reasoning",
  "Spelling / Dictation",
  "Phonics",
  "Literature in English",
  "History",
  "Geography",
  "Business Studies",
  "Moral Instruction",
  "Security Education",
  "National Values Education",
];

export default function SubjectsPage() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classSubjects, setClassSubjects] = useState([]);
  const [schoolId, setSchoolId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [customSubject, setCustomSubject] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data: user } = await supabase
        .from("users")
        .select("school_id, role")
        .eq("id", session.user.id)
        .single();

      if (!user || user.role !== "admin") { router.push("/dashboard"); return; }
      setSchoolId(user.school_id);

      const { data: classData } = await supabase
        .from("classes")
        .select("*")
        .eq("school_id", user.school_id)
        .order("sort_order");
      setClasses(classData || []);

      setLoading(false);
    };
    init();
  }, []);

  const loadSubjects = async (classId) => {
    setSelectedClassId(classId);
    if (!classId) { setClassSubjects([]); return; }

    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("class_id", classId)
      .order("sort_order");
    setClassSubjects(data || []);
  };

  const addSubject = async (subjectName) => {
    if (!selectedClassId || !subjectName.trim()) return;

    // Check duplicate
    if (classSubjects.some((s) => s.name.toLowerCase() === subjectName.trim().toLowerCase())) {
      alert("This subject already exists for this class.");
      return;
    }

    const { error } = await supabase.from("subjects").insert({
      class_id: selectedClassId,
      name: subjectName.trim(),
      sort_order: classSubjects.length + 1,
    });

    if (error) {
      alert("Error adding subject.");
    } else {
      await loadSubjects(selectedClassId);
    }
  };

  const removeSubject = async (subjectId, subjectName) => {
    if (!confirm(`Remove "${subjectName}" from this class? Any scores for this subject will also be deleted.`)) return;

    const { error } = await supabase.from("subjects").delete().eq("id", subjectId);
    if (error) {
      alert("Error removing subject.");
    } else {
      await loadSubjects(selectedClassId);
    }
  };

  const addCustomSubject = () => {
    if (customSubject.trim()) {
      addSubject(customSubject.trim());
      setCustomSubject("");
    }
  };

  // Subjects from library not yet added to this class
  const availableSubjects = SUBJECT_LIBRARY.filter(
    (s) => !classSubjects.some((cs) => cs.name.toLowerCase() === s.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-forest-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-100">
      <div className="bg-gradient-to-br from-forest-800 to-forest-700 text-white px-5 pt-4 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.push("/dashboard")} className="text-white/60 hover:text-white text-lg">←</button>
          <div>
            <h1 className="text-lg font-bold">Subjects</h1>
            <p className="text-xs text-white/60">Assign subjects to each class</p>
          </div>
        </div>

        <select
          value={selectedClassId}
          onChange={(e) => loadSubjects(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold border-0 outline-none"
        >
          <option value="" className="text-gray-800">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id} className="text-gray-800">{cls.name}</option>
          ))}
        </select>
      </div>

      {selectedClassId && (
        <div className="px-4 py-5">
          {/* Current subjects */}
          <div className="mb-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
              Current Subjects ({classSubjects.length})
            </div>

            {classSubjects.length > 0 ? (
              <div className="space-y-2">
                {classSubjects.map((subject, idx) => (
                  <div key={subject.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-forest-100 rounded-lg flex items-center justify-center text-forest-800 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div className="text-sm font-semibold text-gray-800">{subject.name}</div>
                    </div>
                    <button
                      onClick={() => removeSubject(subject.id, subject.name)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-sm text-center text-gray-400 text-sm">
                No subjects yet. Add from the list below.
              </div>
            )}
          </div>

          {/* Add custom subject */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Add Custom Subject</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomSubject()}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-sand-300 bg-sand-50 text-sm font-medium focus:outline-none focus:border-forest-700 transition-colors"
                placeholder="Type a subject name..."
              />
              <button
                onClick={addCustomSubject}
                className="px-5 py-2.5 bg-forest-800 text-white rounded-xl text-sm font-bold hover:bg-forest-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Subject library */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
              Subject Library — Tap to Add
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSubjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => addSubject(subject)}
                  className="px-3 py-2 bg-white rounded-xl text-xs font-semibold text-gray-600 shadow-sm hover:bg-forest-100 hover:text-forest-800 transition-colors border border-sand-300"
                >
                  + {subject}
                </button>
              ))}
            </div>

            {availableSubjects.length === 0 && (
              <div className="text-center py-4 text-gray-400 text-xs">
                All library subjects have been added. Use custom subject above for anything else.
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedClassId && (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">
          Select a class to manage its subjects.
        </div>
      )}
    </div>
  );
}